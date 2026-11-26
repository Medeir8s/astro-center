/* ---------- constantes ---------- */
const T='︎';
const SIGNS=['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SG=['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'].map(g=>g+T);
const ELS=['fogo','terra','ar','água'];
const ELCOL={fogo:'#ff8f6e',terra:'#b9cc86',ar:'#86d3c6','água':'#8fb4ff'};
const MODN=['cardinal','fixa','mutável'];
const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const GLYPH={sun:'☉',moon:'☽',asc:'AC',mc:'MC',mercury:'☿',venus:'♀',mars:'♂',jupiter:'♃',saturn:'♄',uranus:'♅',neptune:'♆',pluto:'♇',chiron:'⚷',lilith:'⚸',nnode:'☊',snode:'☋',fortune:'⊗'};
const NOME={sun:'Sol',moon:'Lua',asc:'Ascendente',mc:'Meio do Céu',mercury:'Mercúrio',venus:'Vênus',mars:'Marte',jupiter:'Júpiter',saturn:'Saturno',uranus:'Urano',neptune:'Netuno',pluto:'Plutão',chiron:'Quíron',lilith:'Lilith',nnode:'Nodo Norte',snode:'Nodo Sul',fortune:'Parte da Fortuna'};
const BODY={sun:'Sun',moon:'Moon',mercury:'Mercury',venus:'Venus',mars:'Mars',jupiter:'Jupiter',saturn:'Saturn',uranus:'Uranus',neptune:'Neptune',pluto:'Pluto'};
const DOM={sun:[4],moon:[3],mercury:[2,5],venus:[1,6],mars:[0,7],jupiter:[8,11],saturn:[9,10],uranus:[10],neptune:[11],pluto:[7]};
const EXA={sun:0,moon:1,mercury:5,venus:11,mars:9,jupiter:3,saturn:6};
const RULER=['mars','venus','mercury','moon','sun','mercury','venus','pluto','jupiter','saturn','uranus','neptune'];
const ORB=[10,5,3,10,5,3,10,5,3,10,5,3];
const ASP_ORDER=['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
const WEIGHT={sun:3,moon:3,asc:3,mercury:2,venus:2,mars:2,jupiter:1,saturn:1,uranus:1,neptune:1,pluto:1,mc:1};
const STARS=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.3,p:Math.random()*6}));

/* ---------- astronomia ---------- */
const HAS_ASTRO=typeof window.Astronomy!=='undefined';
function lonOf(body,d){
  if(HAS_ASTRO){
    if(body==='Sun')return Astronomy.SunPosition(d).elon;
    if(body==='Moon')return Astronomy.EclipticGeoMoon(d).lon;
    return Astronomy.Ecliptic(Astronomy.GeoVector(body,d,true)).elon;
  }
  const days=(d-Date.UTC(2000,0,1,12))/864e5;
  const base={Sun:[280.46,.9856474],Moon:[218.32,13.176396],Mercury:[252.25,4.0923344],Venus:[181.98,1.6021302],Mars:[355.43,.5240208],Jupiter:[34.35,.0830853],Saturn:[50.08,.0334442],Uranus:[313.23,.0117],Neptune:[304.88,.006],Pluto:[238.9,.004]}[body];
  return ((base[0]+base[1]*days)%360+360)%360;
}
const nm=x=>((x%360)+360)%360;
const signOf=l=>Math.floor(nm(l)/30);
const degIn=l=>nm(l)%30;
const elOf=s=>ELS[s%4];
const modOf=s=>MODN[s%3];
function tzOffsetMin(tz,utcMs){try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});const p={};for(const x of f.formatToParts(new Date(utcMs)))p[x.type]=x.value;return Math.round((Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-utcMs)/6e4);}catch(e){return -180;}}
function zonedToUtc(date,time,tz){const [y,m,d]=date.split('-').map(Number),[hh,mm]=time.split(':').map(Number),local=Date.UTC(y,m-1,d,hh,mm);let g=local-tzOffsetMin(tz,local)*6e4;g=local-tzOffsetMin(tz,g)*6e4;return new Date(g);}
function placidus(d,lat,lon){
  const days=(d-Date.UTC(2000,0,1,12))/864e5,rad=Math.PI/180;
  const ramc=nm(nm(280.46061837+360.98564736629*days)+lon),eps=(23.4393-3.563e-7*days)*rad,phi=lat*rad;
  const ra2lon=ra=>nm(Math.atan2(Math.sin(ra*rad),Math.cos(ra*rad)*Math.cos(eps))/rad);
  const asc=nm(Math.atan2(Math.cos(ramc*rad),-(Math.sin(ramc*rad)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps)))/rad),mc=ra2lon(ramc);
  const cusp=(f,noct)=>{let ra=noct?nm(ramc+180-90*f):nm(ramc+90*f);
    for(let i=0;i<60;i++){const l=ra2lon(ra),dec=Math.asin(Math.sin(eps)*Math.sin(l*rad)),x=Math.tan(phi)*Math.tan(dec);if(Math.abs(x)>=1)return null;
      const ad=Math.asin(x)/rad,nra=noct?nm(ramc+180-f*(90-ad)):nm(ramc+f*(90+ad));if(Math.abs(((nra-ra+540)%360)-180)<1e-8){ra=nra;break;}ra=nra;}
    return ra2lon(ra);};
  const c11=cusp(1/3,false),c12=cusp(2/3,false),c2=cusp(2/3,true),c3=cusp(1/3,true);
  if([c11,c12,c2,c3].some(v=>v===null))return{asc,mc,cusps:Array.from({length:12},(_,i)=>nm(asc+30*i)),sys:'iguais'};
  return{asc,mc,cusps:[asc,c2,c3,nm(mc+180),nm(c11+180),nm(c12+180),nm(asc+180),nm(c2+180),nm(c3+180),mc,c11,c12],sys:'Placidus'};
}
function houseOf(lon,cusps){if(!cusps)return null;const d=x=>nm(x);let h=0;for(let i=0;i<12;i++){const span=d(cusps[(i+1)%12]-cusps[i]);if(d(lon-cusps[i])<span){h=i;break;}}const nx=(h+1)%12;return d(cusps[nx]-lon)<=ORB[nx]?nx:h;}
function dignity(k,s){if(!DOM[k])return null;if(DOM[k].includes(s))return'domicilio';if(EXA[k]===s)return'exaltacao';if(DOM[k].some(x=>(x+6)%12===s))return'exilio';if(EXA[k]!==undefined&&(EXA[k]+6)%12===s)return'queda';return null;}
function meanNode(d){const Tc=(d-Date.UTC(2000,0,1,12))/36525/864e5;return nm(125.0445479-1934.1362891*Tc+0.0020754*Tc*Tc);}
function meanLilith(d){const Tc=(d-Date.UTC(2000,0,1,12))/36525/864e5;return nm(83.3532465+4069.0137287*Tc-0.0103200*Tc*Tc+180);}

/* ---------- motor ---------- */
function computeChart(dt,lat,lon,hasTime){
  const pos={};
  for(const k in BODY)pos[k]=lonOf(BODY[k],dt);
  pos.nnode=meanNode(dt);pos.snode=nm(pos.nnode+180);pos.lilith=meanLilith(dt);
  let asc=null,mc=null,cusps=null,sys='sem hora';
  if(hasTime){const p=placidus(dt,lat,lon);asc=p.asc;mc=p.mc;cusps=p.cusps;sys=p.sys;pos.asc=asc;pos.mc=mc;
    const sh=houseOf(pos.sun,cusps),dia=sh>=6;
    pos.fortune=nm(dia?(asc+pos.moon-pos.sun):(asc+pos.sun-pos.moon));}
  const dt2=new Date(+dt+3600e3),spd={};
  for(const k of ASP_ORDER)spd[k]=((lonOf(BODY[k],dt2)-pos[k]+540)%360-180);
  return {pos,asc,mc,cusps,sys,spd,hasTime,dt};
}
function aspects(ch){
  const out=[];
  for(let i=0;i<ASP_ORDER.length;i++)for(let j=i+1;j<ASP_ORDER.length;j++){
    const a=ASP_ORDER[i],b=ASP_ORDER[j];
    let sep=Math.abs(nm(ch.pos[a]-ch.pos[b]));if(sep>180)sep=360-sep;
    const lum=(a==='sun'||a==='moon'||b==='sun'||b==='moon'),orbMax=lum?10:8;
    const targets=[[0,'c'],[60,'h'],[90,'t'],[120,'h'],[180,'t']];
    let best=null;for(const[ang,mode]of targets){const orb=Math.abs(sep-ang);if(orb<=orbMax&&(!best||orb<best.orb))best={ang,mode,orb};}
    if(!best)continue;
    const key=a+'-'+b,entry=TB.aspecto[key];if(!entry)continue;
    const txt=entry[best.mode]||entry.c;if(!txt)continue;
    let sepFut=Math.abs(nm((ch.pos[a]+ch.spd[a])-(ch.pos[b]+ch.spd[b])));if(sepFut>180)sepFut=360-sepFut;
    const now=Math.abs(sep-best.ang),fut=Math.abs(sepFut-best.ang);
    const fase=best.orb<1?'partil':(fut<now?'aplicativo':'separativo');
    out.push({a,b,ang:best.ang,mode:best.mode,orb:best.orb,txt,fase});
  }
  return out.sort((x,y)=>x.orb-y.orb);
}
function signature(ch){
  const el={fogo:0,terra:0,ar:0,'água':0},md={cardinal:0,fixa:0,'mutável':0};
  for(const k in WEIGHT){const L=ch.pos[k];if(L==null)continue;const s=signOf(L);el[elOf(s)]+=WEIGHT[k];md[modOf(s)]+=WEIGHT[k];}
  const topEl=Object.keys(el).reduce((a,b)=>el[a]>=el[b]?a:b),lowEl=Object.keys(el).reduce((a,b)=>el[a]<=el[b]?a:b);
  const topMd=Object.keys(md).reduce((a,b)=>md[a]>=md[b]?a:b),lowMd=Object.keys(md).reduce((a,b)=>md[a]<=md[b]?a:b);
  return {el,md,topEl,lowEl,topMd,lowMd,key:topEl+'-'+topMd};
}
function rulers(ch){
  if(!ch.hasTime)return[];const out=[];
  for(let h=0;h<12;h++){const rk=RULER[signOf(ch.cusps[h])],rh=houseOf(ch.pos[rk],ch.cusps);out.push({house:h,ruler:rk,rulerHouse:rh,txt:TB.regente[h+1][rh]});}
  return out;
}
