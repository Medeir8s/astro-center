/* Calculadora do André · Numerologia (método MMINA, tabela pitagórica)
   Regras: mestres (11, 22, 33) e cármicos (13, 14, 16, 19) só são marcados nas posições do DNA
   (Alma, Personalidade, Missão, Caminho de Vida, Maturidade). O resto é sempre reduzido a 1–9. */
"use strict";
(function(){
const TAB={A:1,J:1,S:1,B:2,K:2,T:2,C:3,L:3,U:3,D:4,M:4,V:4,E:5,N:5,W:5,F:6,O:6,X:6,G:7,P:7,Y:7,H:8,Q:8,Z:8,I:9,R:9};
const VOG='AEIOU';
const PARTICULAS=['DE','DA','DO','DAS','DOS','E'];
const MESTRES=[11,22,33],CARMICOS=[13,14,16,19];

const limpa=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z ]/g,' ').replace(/\s+/g,' ').trim();
const soma=n=>String(n).split('').reduce((a,b)=>a+ +b,0);
/* caminho de redução: [67,13,4] */
function caminho(n,parar){const p=[n];while(p[p.length-1]>9){const v=p[p.length-1];if(parar&&parar.includes(v))break;p.push(soma(v));}return p;}
function red(n){while(n>9)n=soma(n);return n;}
const val=ch=>TAB[ch]||0;
const somaLetras=(s,filtro)=>s.split('').reduce((a,c)=>a+((!filtro||filtro(c))?val(c):0),0);

/* Analisa um valor do DNA por três métodos: soma geral, sem os 9, por blocos */
function dna(nomeLimpo,filtro){
  const partes=nomeLimpo.split(' ').filter(Boolean);
  const total=somaLetras(nomeLimpo.replace(/ /g,''),filtro);
  const sem9=nomeLimpo.replace(/ /g,'').split('').reduce((a,c)=>a+((filtro&&!filtro(c))||val(c)===9?0:val(c)),0);
  const blocos=partes.map(p=>somaLetras(p,filtro));
  const blocosRed=blocos.map(b=>caminho(b)).map(c=>c[c.length-1]);
  const blocoSoma=blocos.map(b=>red(b)).reduce((a,b)=>a+b,0);
  const metodos=[
    {nome:'soma geral',valor:total,cam:caminho(total)},
    {nome:'sem os 9',valor:sem9,cam:caminho(sem9)},
    {nome:'por blocos',valor:blocoSoma,cam:caminho(blocoSoma),blocos:blocos.map((b,i)=>({nome:partes[i],soma:b,red:red(b)}))}
  ];
  return fecha(metodos,red(total));
}
/* junta as marcas encontradas */
function fecha(metodos,simples){
  const achados=[];
  for(const m of metodos)for(const v of m.cam){
    if(MESTRES.includes(v)||CARMICOS.includes(v)){if(!achados.some(a=>a.n===v))achados.push({n:v,tipo:MESTRES.includes(v)?'mestre':'carmico',via:m.nome});}
  }
  return {n:simples,metodos,achados};
}

function dataParts(iso){const [y,m,d]=iso.split('-').map(Number);return{y,m,d};}

function caminhoVida(iso){
  const {y,m,d}=dataParts(iso);
  const comp=[red(d),red(m),red(soma(y))];
  const total=comp.reduce((a,b)=>a+b,0);
  const todos=iso.replace(/-/g,'').split('').reduce((a,b)=>a+ +b,0);
  const metodos=[
    {nome:'dia + mês + ano reduzidos',valor:total,cam:caminho(total)},
    {nome:'soma de todos os dígitos',valor:todos,cam:caminho(todos)}
  ];
  const r=fecha(metodos,red(total));
  r.comp={dia:red(d),mes:red(m),ano:red(soma(y))};
  return r;
}

const ARCANOS=['O Louco (0/22)','O Mago','A Sacerdotisa','A Imperatriz','O Imperador','O Hierofante','Os Enamorados','O Carro','A Força','O Eremita','A Roda da Fortuna','A Justiça','O Enforcado','A Morte','A Temperança','O Diabo','A Torre','A Estrela','A Lua','O Sol','O Julgamento','O Mundo'];
function arcano(n){while(n>22)n=soma(n);return n;}
function nomeArcano(n){return n===22?'O Louco':ARCANOS[n];}

function idadeEm(iso,ref){const{y,m,d}=dataParts(iso);let i=ref.y-y;if(ref.m<m||(ref.m===m&&ref.d<d))i--;return i;}

function calcular(nomeCompleto,iso,ref){
  const nome=limpa(nomeCompleto);
  const letras=nome.replace(/ /g,'');
  const partes=nome.split(' ').filter(Boolean);
  const alma=dna(nome,c=>VOG.includes(c));
  const pers=dna(nome,c=>!VOG.includes(c));
  const missao=dna(nome);
  const cv=caminhoVida(iso);
  const matSoma=missao.n+cv.n;
  const maturidade=fecha([{nome:'Missão + Caminho de Vida',valor:matSoma,cam:caminho(matSoma)}],red(matSoma));

  /* extras (reduzidos) */
  const fundamento=val(letras[0]);
  const util=partes.filter(p=>!PARTICULAS.includes(p));
  const apoioSoma=util.reduce((a,p)=>a+val(p[0]),0);
  const apoio=red(apoioSoma);

  const {y,m,d}=dataParts(iso);
  const idade=idadeEm(iso,ref),faz=idade+1;
  const idadeNum=red(idade+faz);
  const anoPessoal=red(red(d)+red(m)+red(soma(ref.y)));

  /* trânsito de letras: cada letra dura o valor dela em anos, começando no nascimento */
  const trans=[];let acc=0;
  const ciclo=letras.split('');
  let guard=0,i=0;
  while(acc<=idade+1&&guard<400){const L=ciclo[i%ciclo.length],v=val(L);trans.push({letra:L,v,ini:acc,fim:acc+v});acc+=v;i++;guard++;}
  const atual=trans.find(t=>idade>=t.ini&&idade<t.fim)||trans[trans.length-1];
  const essSoma=idadeNum+anoPessoal+atual.v;
  const essencia=arcano(essSoma);

  /* apogeus e ciclos */
  const cvSimples=cv.n;
  const fim1=36-cvSimples;
  const ap=[red(d)+red(m),red(d)+red(soma(y)),0,red(m)+red(soma(y))];
  ap[0]=red(ap[0]);ap[1]=red(ap[1]);ap[2]=red(ap[0]+ap[1]);ap[3]=red(ap[3]);
  const apogeus=[
    {n:ap[0],de:0,ate:fim1},{n:ap[1],de:fim1+1,ate:fim1+9},{n:ap[2],de:fim1+10,ate:fim1+18},{n:ap[3],de:fim1+19,ate:null}
  ];
  const ciclos=[{nome:'Formativo',ate:fim1},{nome:'Produtivo',de:fim1+1,ate:56},{nome:'Colheita',de:57,ate:null}];
  const rd=red(d),rm=red(m),ry=red(soma(y));
  const d1=Math.abs(rm-rd),d2=Math.abs(rd-ry),d3=Math.abs(d1-d2),d4=Math.abs(rm-ry);
  const desafios=[{n:d1,de:0,ate:fim1},{n:d2,de:fim1+1,ate:fim1+9},{n:d3,de:fim1+10,ate:fim1+18},{n:d4,de:fim1+19,ate:null}];

  /* Biblioteca Cósmica */
  const cont={};for(let n=1;n<=9;n++)cont[n]=0;
  for(const c of letras)cont[val(c)]++;
  const maxN=Math.max(...Object.values(cont));
  const dominantes=Object.keys(cont).filter(k=>cont[k]===maxN).map(Number);
  const ausentes=Object.keys(cont).filter(k=>cont[k]===0).map(Number);
  const virtudes=Object.keys(cont).filter(k=>cont[k]>=3&&!dominantes.includes(+k)).map(Number);

  return {nome,letras:letras.length,alma,pers,missao,cv,maturidade,fundamento,apoio,idade,faz,idadeNum,anoPessoal,transitoAtual:atual,essencia,essSoma,apogeus,ciclos,desafios,cont,dominantes,ausentes,virtudes,anoRef:ref.y};
}

/* planetas regentes dos números (para correlação com o mapa astral) */
const REGENTE={1:'sun',2:'moon',3:'jupiter',4:'uranus',5:'mercury',6:'venus',7:'neptune',8:'saturn',9:'mars',11:'neptune',22:'saturn',33:'venus'};
/* Cármicos: planeta ligado ao tema */
const REGENTE_CARMICO={13:'saturn',14:'mercury',16:'pluto',19:'sun'};

/* ======================== TEXTOS ======================== */
const N={
1:{nome:'Liderança e início',chave:'iniciativa, independência, coragem',
 core:'O 1 é o número do começo. Vibra em quem abre caminhos, decide por conta própria e precisa de espaço para ser autêntico.',
 luz:'Coragem, originalidade, capacidade de liderar e de recomeçar sem pedir licença.',
 sombra:'Teimosia, egoísmo, dificuldade de aceitar ajuda e de ouvir quem pensa diferente.',
 conselho:'Aprenda a liderar com escuta. Sua força cresce quando você inclui os outros.'},
2:{nome:'Cooperação e sensibilidade',chave:'parceria, diplomacia, intuição',
 core:'O 2 é o número da parceria. Vibra em quem percebe o clima, une as pessoas e trabalha melhor em dupla do que sozinho.',
 luz:'Diplomacia, paciência, sensibilidade e facilidade de mediar conflitos.',
 sombra:'Dependência emocional, indecisão, medo de desagradar e tendência a se anular.',
 conselho:'Diga o que sente com clareza. Sua delicadeza vale mais quando vem junto de limites.'},
3:{nome:'Comunicação e expressão',chave:'criatividade, alegria, palavra',
 core:'O 3 é o número da expressão. Vibra em quem comunica, cria, anima os ambientes e transforma ideias em palavras e imagens.',
 luz:'Criatividade, otimismo, carisma e talento para falar, escrever e ensinar.',
 sombra:'Dispersão, superficialidade, exagero e dificuldade de terminar o que começa.',
 conselho:'Escolha poucos projetos e leve até o fim. Seu brilho precisa de constância.'},
4:{nome:'Estrutura e trabalho',chave:'ordem, disciplina, construção',
 core:'O 4 é o número da base. Vibra em quem constrói devagar, com método, e é a pessoa em quem os outros confiam.',
 luz:'Organização, lealdade, persistência e capacidade de transformar plano em resultado.',
 sombra:'Rigidez, medo de mudança, excesso de trabalho e teimosia com o que é "certo".',
 conselho:'Deixe uma folga para o imprevisto. A estrutura serve a você, não o contrário.'},
5:{nome:'Liberdade e mudança',chave:'movimento, curiosidade, adaptação',
 core:'O 5 é o número da mudança. Vibra em quem precisa de variedade, viaja, aprende rápido e se adapta a qualquer cenário.',
 luz:'Versatilidade, magnetismo, curiosidade e coragem para experimentar.',
 sombra:'Impulsividade, inquietação, excesso nos prazeres e dificuldade de se comprometer.',
 conselho:'Liberdade com direção. Escolha uma âncora e explore a partir dela.'},
6:{nome:'Afeto e responsabilidade',chave:'família, cuidado, harmonia',
 core:'O 6 é o número do cuidado. Vibra em quem acolhe, protege, valoriza a família e busca beleza e equilíbrio nos vínculos.',
 luz:'Generosidade, senso de justiça, afeto e capacidade de criar lar em qualquer lugar.',
 sombra:'Controle disfarçado de cuidado, perfeccionismo e cobrança excessiva sobre quem se ama.',
 conselho:'Cuide de si com o mesmo zelo que dedica aos outros. Ajudar não é decidir pelo outro.'},
7:{nome:'Busca e interioridade',chave:'estudo, espiritualidade, análise',
 core:'O 7 é o número da busca. Vibra em quem pensa fundo, estuda, precisa de silêncio e procura o sentido por trás das coisas.',
 luz:'Intuição, inteligência analítica, espiritualidade e talento para pesquisa.',
 sombra:'Isolamento, desconfiança, frieza e dificuldade de pedir ou aceitar ajuda.',
 conselho:'Compartilhe o que descobre. Seu conhecimento só vira sabedoria quando chega a alguém.'},
8:{nome:'Poder e realização',chave:'ambição, dinheiro, autoridade',
 core:'O 8 é o número da realização material. Vibra em quem tem visão de negócio, lida bem com poder e dinheiro e persegue resultados concretos.',
 luz:'Liderança prática, senso estratégico, resistência e capacidade de prosperar.',
 sombra:'Obsessão por controle e status, workaholismo e dureza com quem não acompanha o ritmo.',
 conselho:'Meça sucesso também em tempo, saúde e afeto. Poder bem usado serve aos outros.'},
9:{nome:'Humanidade e conclusão',chave:'compaixão, ideal, encerramento',
 core:'O 9 é o número da conclusão. Vibra em quem pensa no coletivo, tem ideais amplos e aprende a soltar para renovar a vida.',
 luz:'Compaixão, generosidade, visão ampla e talento para inspirar causas.',
 sombra:'Dificuldade de soltar o passado, dramatização e sensação de carregar o mundo nas costas.',
 conselho:'Feche ciclos conscientemente. Doar-se sem esquecer de si é o ponto de equilíbrio.'},
11:{nome:'Mestre da inspiração',chave:'intuição elevada, mensagem, sensibilidade',
 core:'O 11 é um número mestre: uma intuição muito acima da média. Vibra em quem sente o que ainda não foi dito e pode inspirar pessoas, mas vive com os nervos à flor da pele.',
 luz:'Visão, carisma espiritual, capacidade de ensinar pelo exemplo e de despertar os outros.',
 sombra:'Ansiedade, oscilação entre grandeza e insegurança, sobrecarga emocional.',
 conselho:'Dê forma prática à intuição: rotina, corpo e escrita sustentam a sua sensibilidade. Em dias difíceis, ele se comporta como um 2.'},
22:{nome:'Mestre construtor',chave:'grande obra, visão prática, legado',
 core:'O 22 é o número mestre da grande realização. Une visão de longo alcance com capacidade prática de construir algo que atende a muita gente.',
 luz:'Capacidade de materializar projetos grandes, liderança de equipes, legado duradouro.',
 sombra:'Pressão para ser grande, medo de falhar, paralisia diante de projetos enormes.',
 conselho:'Divida a grande obra em passos pequenos e concretos. Em dias difíceis, ele se comporta como um 4.'},
33:{nome:'Mestre do cuidado',chave:'serviço, amor incondicional, ensino',
 core:'O 33 é o número mestre do serviço amoroso. Vibra em quem cuida do coletivo, ensina e cura pela presença.',
 luz:'Compaixão ativa, dedicação e talento para acolher e orientar.',
 sombra:'Autossacrifício, culpa e dificuldade de receber.',
 conselho:'Receber é parte de servir. Em dias difíceis, ele se comporta como um 6.'}
};

const CARMICO={
13:{nome:'13/4 · Trabalho e disciplina',core:'Dívida ligada a preguiça, atalhos ou desperdício de oportunidades em outras vivências. A lição é construir com esforço constante e aceitar que nada vem pronto.',lic:'Trabalho persistente, organização e paciência; recompensa vem pela constância.',risco:'Desânimo, sensação de "tudo é mais difícil para mim", tendência a desistir no meio.'},
14:{nome:'14/5 · Uso consciente da liberdade',core:'Dívida ligada a excesso: de prazeres, de vícios ou de liberdade usada sem responsabilidade. A lição é moderação e escolhas conscientes.',lic:'Equilíbrio entre liberdade e compromisso; saber dizer "chega" a tempo.',risco:'Impulsividade, exageros, instabilidade em vínculos e hábitos.'},
16:{nome:'16/7 · Queda do ego',core:'Dívida ligada a vaidade, orgulho ou abuso de poder e de afeto. A lição é humildade: estruturas apoiadas no ego caem para que algo mais verdadeiro seja construído.',lic:'Humildade, espiritualidade e reconstrução depois de rupturas; sabedoria que nasce das perdas.',risco:'Crises que derrubam o que estava apoiado em aparência; isolamento e desconfiança.'},
19:{nome:'19/1 · Independência e partilha',core:'Dívida ligada ao uso egoísta do poder e à dificuldade de pedir e aceitar ajuda. A lição é ser forte sem ser sozinho.',lic:'Autonomia com generosidade; liderar partilhando mérito e recursos.',risco:'Isolamento, orgulho, sensação de ter de carregar tudo sozinho.'}
};

const POS={
 alma:{nome:'Alma',pergunta:'O que você deseja lá dentro',intro:'Sua Alma, calculada pelas vogais do nome, mostra o que você deseja de verdade, o que o move quando ninguém está olhando.'},
 pers:{nome:'Personalidade',pergunta:'Como os outros veem você',intro:'Sua Personalidade, calculada pelas consoantes, é a imagem que você passa e a primeira impressão que causa.'},
 missao:{nome:'Missão de Vida',pergunta:'O que você veio desenvolver',intro:'Sua Missão, calculada pelo nome completo, indica os talentos e a direção que você vai desenvolver ao longo da vida.'},
 cv:{nome:'Caminho de Vida',pergunta:'A estrada que você percorre',intro:'Seu Caminho de Vida, calculado pela data de nascimento, mostra as lições e o tipo de experiência que se repete na sua trajetória.'},
 mat:{nome:'Maturidade',pergunta:'Quem você se torna depois dos 35–40',intro:'Sua Maturidade, soma da Missão com o Caminho, descreve a fase em que seus talentos e lições se unem e aparece mais forte depois dos 35 a 40 anos.'}
};

const ANO={1:'Ano de recomeço: plantar, decidir, começar sozinho. Boa fase para novos projetos.',2:'Ano de paciência e parceria: ouvir, cooperar, esperar o tempo certo. Relações pedem cuidado.',3:'Ano de expressão: comunicar, criar, socializar. Boa fase para divulgar o seu trabalho.',4:'Ano de construção: organizar, trabalhar, estruturar as finanças. Resultado pede esforço.',5:'Ano de mudança: viagens, novidades, imprevistos. Flexibilidade é a palavra.',6:'Ano de afeto e responsabilidade: família, casa, compromissos e cuidado com a saúde.',7:'Ano de pausa e estudo: olhar para dentro, aprender, rever convicções.',8:'Ano de colheita material: carreira, dinheiro e reconhecimento. Boa fase para negócios.',9:'Ano de encerramento: soltar o que cumpriu o ciclo e se preparar para recomeçar.'};
const ARC_TXT={1:'Iniciativa e vontade: hora de agir e dominar uma habilidade.',2:'Intuição e silêncio: o que ainda não aparece já está sendo gestado.',3:'Fertilidade e criação: algo cresce quando recebe atenção e cuidado.',4:'Estrutura e autoridade: organização, limites e liderança.',5:'Orientação e tradição: aprender com mestres e valores.',6:'Escolha e vínculo: decisões do coração pedem clareza.',7:'Avanço com controle: conquista pela disciplina, sem perder a direção.',8:'Força interior: domínio das emoções e coragem tranquila.',9:'Busca e recolhimento: balanço, estudo e sabedoria.',10:'Ciclo e oportunidade: a roda gira, aproveite a virada.',11:'Equilíbrio e verdade: decisões justas e consequências claras.',12:'Pausa e novo ponto de vista: suspender para enxergar diferente.',13:'Fim e transformação: encerrar para renascer.',14:'Moderação e cura: misturar com paciência, ajustar o ritmo.',15:'Apegos e tentações: reconhecer o que prende e escolher soltar.',16:'Ruptura e despertar: o que é frágil cai e abre espaço.',17:'Esperança e renovação: confiança de que o céu está do seu lado.',18:'Sensibilidade e ilusão: cuidado com medos e interpretações precipitadas.',19:'Alegria e êxito: clareza, vitalidade e reconhecimento.',20:'Chamado e renascimento: hora de responder a algo maior.',21:'Realização e conclusão: ciclo completo, integração.',22:'Recomeço livre: dar o primeiro passo sem saber o caminho todo.'};
const FUND_TXT={1:'Você começa tudo pelo impulso e pela vontade própria.',2:'Você começa pelo outro: ouve, sente, observa.',3:'Você começa conversando, criando, tornando leve.',4:'Você começa pela base: organiza, planeja, estrutura.',5:'Você começa pela experiência: testa, viaja, muda de ângulo.',6:'Você começa pelo vínculo: cuida, acolhe, harmoniza.',7:'Você começa pela análise: estuda, desconfia, procura o porquê.',8:'Você começa pelo objetivo: estratégia, resultado e comando.',9:'Você começa pelo todo: visão ampla, ideal, entrega.'};
const BIB={1:'iniciativa',2:'cooperação',3:'comunicação',4:'disciplina',5:'liberdade',6:'afeto',7:'busca interior',8:'ambição',9:'generosidade'};

window.NUM={calcular,N,POS,CARMICO,ANO,ARC_TXT,FUND_TXT,BIB,REGENTE,REGENTE_CARMICO,nomeArcano,red,val,limpa};
})();
