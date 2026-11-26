/* Códigos de acesso da calculadora. Formato: B-261231-XXXXXX (básica) ou A-261231-XXXXXX (avançada).
   O meio é a data de validade (AAMMDD). O fim é uma assinatura calculada com a chave do config.js. */
"use strict";
(function(){
function h53(str,seed){let h1=0xdeadbeef^(seed||0),h2=0x41c6ce57^(seed||0);for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0);}
const AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function assina(nivel,val,chave){let n=h53(nivel+val+chave,7),s='';for(let i=0;i<6;i++){s+=AL[n%32];n=Math.floor(n/32);}return s;}
function gerar(nivel,validadeISO,chave){const v=validadeISO.slice(2,4)+validadeISO.slice(5,7)+validadeISO.slice(8,10);return nivel+'-'+v+'-'+assina(nivel,v,chave);}
function hojeBRT(){const d=new Date(Date.now()-3*3600*1000);return d.toISOString().slice(0,10).replace(/-/g,'').slice(2);}
/* devolve {ok, nivel:1|2, ate:'dd/mm/aaaa'} ou {ok:false, motivo} */
function validar(codigo,chave){
  const c=String(codigo||'').toUpperCase().replace(/\s+/g,'');
  const m=c.match(/^([BA])-(\d{6})-([A-Z2-9]{6})$/);
  if(!m)return{ok:false,motivo:'Código no formato errado. Exemplo: B-261231-AB12CD'};
  if(assina(m[1],m[2],chave)!==m[3])return{ok:false,motivo:'Código inválido. Confira se digitou igual ao recebido.'};
  if(m[2]<hojeBRT())return{ok:false,motivo:'Este código venceu. Peça o código do mês ao André.'};
  return{ok:true,nivel:m[1]==='A'?2:1,ate:m[2].slice(4)+'/'+m[2].slice(2,4)+'/20'+m[2].slice(0,2),codigo:c};
}
window.ACESSO={gerar,validar};
})();
