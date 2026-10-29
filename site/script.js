/* R7.09 (Shifat Oct 24 10:00 PM "Gift scene ... too slow to trigger. & jittery"): one quiet-time queue for the footer's heavy one-off work (footer GL shaders, sticker embers, the gift's code + 3D stage). Each job runs on an idle callback once nobody has scrolled for 450 ms, one at a time, so it never lands mid-scroll or at the moment the gift is wanted. */
window.__csQuiet=window.__csQuiet||(()=>{let lastS=-1e9,busy=0,ok=0;const q=[],D=document.documentElement,mark=()=>{lastS=performance.now()};addEventListener('scroll',mark,{passive:true});addEventListener('touchmove',mark,{passive:true});addEventListener('wheel',mark,{passive:true});const ric=window.requestIdleCallback?f=>requestIdleCallback(f,{timeout:1500}):f=>setTimeout(f,50);const pump=()=>{if(busy||!ok||!q.length)return;busy=1;const go=()=>{const w=performance.now()-lastS;if(w<450||D.classList.contains('gift-open')){setTimeout(go,Math.max(60,460-w));return}ric(()=>{if(performance.now()-lastS<450){setTimeout(go,120);return}const f=q.shift();try{f()}catch(e){}busy=0;setTimeout(pump,150)})};go()};const start=()=>setTimeout(()=>{ok=1;pump()},1000);if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});return f=>{q.push(f);pump()}})();
(()=>{/* MEDIA PRELOAD (Shifat Oct 23 2:42 PM "preload fast on first frame for better ux"): no grey box, no alt text, no broken icon, ever.
Every image and video carries an inline tiny blurred preview (LQIP) as its background, so a box is never empty. Images off screen are
taken over here: their src becomes a transparent placeholder of the exact same aspect ratio (no layout shift) and the real file is
asked for up to ~3 screens ahead (6 on phones and slow networks), nearest first, a few at a time; the ones already that close load right away. The browser keeps showing the placeholder until the real image is complete, so it lands whole,
never half-painted. A failed file is retried once, then the preview stays. Posters (each clip's first frame) load up front; on desktop the clip itself starts buffering ~1.5 screens early;
the player below plays them only in view. Without JS the native lazy loading stands. */
const vh=innerHeight||800,PHONE=matchMedia('(pointer:coarse)').matches||innerWidth<820,C=navigator.connection,SD=!!(C&&C.saveData);
const SLOW=!!(C&&(/(^|-)([23]g)$/.test(C.effectiveType||'')||C.downlink&&C.downlink<3));
const IMG_M=Math.round(Math.max((SLOW||PHONE?6:3)*vh,2600)),VID_M=Math.round(Math.max(1.5*vh,1100));
const PH=(w,h)=>`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w||1}' height='${h||1}'/%3E`;
const isPH=s=>!s||s.startsWith('data:');
const imgs=[...document.querySelectorAll('img[loading="lazy"]')];
const go=im=>{const r=im.dataset.real;if(r&&isPH(im.getAttribute('src'))){im.src=r;return 1}return 0};
const done=im=>{if(im.naturalWidth&&!isPH(im.getAttribute('src')))im.style.background=''};/* once the real file is in, the preview goes, so a loaded page renders exactly as before */
imgs.forEach(im=>{const s=im.getAttribute('src');if(isPH(s))return;im.dataset.real=s;if(im.complete)done(im);im.addEventListener('load',()=>done(im));
im.addEventListener('error',()=>{const cur=im.getAttribute('src');if(isPH(cur))return;
if(!im.dataset.retry){im.dataset.retry=1;im.src=PH(im.getAttribute('width'),im.getAttribute('height'));setTimeout(()=>{im.src=s+(s.includes('?')?'&':'?')+'r=1'},700)}
else im.src=PH(im.getAttribute('width'),im.getAttribute('height'))});
if(im.complete&&!im.naturalWidth){im.dispatchEvent(new Event('error'));return}});
if(!('IntersectionObserver' in window)){imgs.forEach(im=>{im.loading='eager'});return}
const take=[];for(const im of imgs){if(im.complete||!im.dataset.real)continue;const r=im.getBoundingClientRect();if(r.bottom<-IMG_M||r.top>vh+IMG_M){im.src=PH(im.getAttribute('width'),im.getAttribute('height'));im.loading='eager';take.push(im)}else im.loading='eager'}
/* a small queue, nearest first, keeps the line full without splitting it across every file at once (phones get 4 at a time) */
const K=SLOW||PHONE?4:6,want=new Set();let fly=0;
const dist=r=>r.top>=vh?r.top-vh:r.bottom<=0?-r.bottom*1.5:0;
const pump=()=>{if(fly>=K||!want.size)return;const a=[...want].map(im=>[im,dist(im.getBoundingClientRect())]).sort((x,y)=>x[1]-y[1]);
for(const [im] of a){if(fly>=K)break;want.delete(im);if(im.dataset.real&&!isPH(im.getAttribute('src')))continue;fly++;let f=0;const fin=()=>{if(f)return;f=1;im.removeEventListener('load',fin);im.removeEventListener('error',fin);fly--;pump()};im.addEventListener('load',fin);im.addEventListener('error',fin);if(!go(im))fin()}};
const io=new IntersectionObserver(es=>{for(const e of es)if(e.isIntersecting){io.unobserve(e.target);want.add(e.target)}pump()},{rootMargin:IMG_M+'px 0px'});
take.forEach(im=>io.observe(im));
const vio=new IntersectionObserver(es=>{for(const e of es){if(!e.isIntersecting)continue;const v=e.target;vio.unobserve(v);if(v.preload==='none'&&v.readyState===0){v.preload='auto';v.load()}}},{rootMargin:VID_M+'px 0px'});
/* phones and data saver: the poster (already loaded, it is the clip's first frame) holds the box and the clip itself loads only when it plays, so a phone never pulls clips it may not reach */
if(!PHONE&&!SD)document.querySelectorAll('video.lv').forEach(v=>vio.observe(v));
})();
(()=>{/* BUTTON v2, the portfolio's ink button (src/services/inkButton.ts) in vanilla JS: ink flood from the pointer point,
masked label roll, ↗ arrow swap, magnet with parallax, soft-body press squash + jelly release, SVG ring ripple. One rAF loop,
zero cost at rest. Reduced motion: instant colour swap only. Used by the header pill, the big CTA and the video player. */
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const bez=(x1,y1,x2,y2)=>{const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;const sx=t=>((ax*t+bx)*t+cx)*t,sy=t=>((ay*t+by)*t+cy)*t,dx=t=>(3*ax*t+2*bx)*t+cx;
return x=>{if(x<=0)return 0;if(x>=1)return 1;let t=x;for(let i=0;i<8;i++){const e=sx(t)-x,d=dx(t);if(Math.abs(e)<1e-6)return sy(t);if(Math.abs(d)<1e-6)break;t-=e/d}let a=0,b=1;t=x;for(let i=0;i<30;i++){const v=sx(t);if(Math.abs(v-x)<1e-6)break;if(x>v)a=t;else b=t;t=(a+b)/2}return sy(t)}};
const EIN=bez(.19,1,.22,1),EINOUT=bez(.65,0,.35,1);
const K={FLOOD:.6,DRAIN:.5,TAP_HOLD:.32,MAG:{cta:8,sound:4},MAG_PAD:.2,MAG_PAD_MIN:24,PAR:1.5,MAG_F:2.6,MAG_Z:.55,SQ_X:1.04,SQ_Y:.92,SQ_F:7,SQ_Z:.8,REL_F:2.4,REL_Z:.45,ROLL:.6,RIP_DUR:.76,RIP:{cta:20,sound:10}};
const btns=[];let raf=0,last=0,ringURL='',svgRoot=null,magnetOn=false,fid=0;
const now=()=>performance.now()/1000,spr=(x,f,z)=>({x,v:0,t:x,f,z});
function stepSpr(s,dt){const w=2*Math.PI*s.f,n=Math.max(1,Math.ceil(dt*240)),h=dt/n;for(let i=0;i<n;i++){s.v+=(-w*w*(s.x-s.t)-2*s.z*w*s.v)*h;s.x+=s.v*h}
if(Math.abs(s.x-s.t)<1e-4&&Math.abs(s.v)<1e-3){s.x=s.t;s.v=0;return false}return true}
function ringMap(){if(ringURL)return ringURL;const N=512,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),img=g.createImageData(N,N),d=img.data;
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};const T=1024,prof=new Float32Array(T+1);
for(let k=0;k<=T;k++){const r=k/T,env=(1-sm(.9,1,r))*Math.exp(-2.6*Math.max(0,.9-r))*sm(.04,.3,r);prof[k]=r<1&&r>1e-4?Math.sin((1-r)*Math.PI*2*1.75)*env/r:0}
for(let j=0;j<N;j++){const v=(j+.5)/N*2-1;for(let i=0;i<N;i++){const u=(i+.5)/N*2-1,r2=u*u+v*v,k=(j*N+i)*4;let fx=0,fy=0;if(r2<1){const f=prof[Math.round(Math.sqrt(r2)*T)];fx=u*f;fy=v*f}
d[k]=Math.round(128+127*fx);d[k+1]=Math.round(128+127*fy);d[k+2]=128;d[k+3]=255}}g.putImageData(img,0,0);ringURL=c.toDataURL('image/png');return ringURL}
const NS='http://www.w3.org/2000/svg',mapSetters=[];function armMaps(){for(const s of mapSetters)s()}
function makeFilter(){if(!svgRoot){svgRoot=document.createElementNS(NS,'svg');svgRoot.setAttribute('aria-hidden','true');svgRoot.setAttribute('width','0');svgRoot.setAttribute('height','0');
svgRoot.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';document.body.appendChild(svgRoot)}
const f=document.createElementNS(NS,'filter');f.id='ink-rip-'+(++fid);[['filterUnits','userSpaceOnUse'],['primitiveUnits','userSpaceOnUse'],['color-interpolation-filters','sRGB']].forEach(([k,v])=>f.setAttribute(k,v));
const fl=document.createElementNS(NS,'feFlood');fl.setAttribute('flood-color','rgb(128,128,128)');fl.setAttribute('result','n');
const im=document.createElementNS(NS,'feImage');const setMap=()=>{if(im.getAttribute('href'))return;im.setAttribute('href',ringMap());im.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',ringMap())};mapSetters.push(setMap);if(ringURL)setMap();
im.setAttribute('preserveAspectRatio','none');im.setAttribute('result','r');const mg=document.createElementNS(NS,'feMerge');mg.setAttribute('result','m');
for(const s of['n','r']){const mn=document.createElementNS(NS,'feMergeNode');mn.setAttribute('in',s);mg.appendChild(mn)}
const dm=document.createElementNS(NS,'feDisplacementMap');dm.setAttribute('in','SourceGraphic');dm.setAttribute('in2','m');dm.setAttribute('scale','0');dm.setAttribute('xChannelSelector','R');dm.setAttribute('yChannelSelector','G');
f.append(fl,im,mg,dm);svgRoot.appendChild(f);return{f,im,dm}}
const measure=b=>{b.w=b.el.offsetWidth;b.h=b.el.offsetHeight},farR=(b,x,y)=>Math.hypot(Math.max(x,b.w-x),Math.max(y,b.h-y))+1;
function local(b,cx,cy){const r=b.el.getBoundingClientRect(),mx=(r.left+r.right)/2,my=(r.top+r.bottom)/2;return{x:Math.min(b.w,Math.max(0,(cx-mx)/(b.sx.x||1)+b.w/2)),y:Math.min(b.h,Math.max(0,(cy-my)/(b.sy.x||1)+b.h/2))}}
function flood(b,p){measure(b);b.on=true;b.drainAt=0;const to={x:p.x,y:p.y,r:farR(b,p.x,p.y)};if(RM){b.fl=to;b.flA=null;kick();return}
const from=b.fl.r>.5?{...b.fl}:{x:p.x,y:p.y,r:0};b.flA={a:from,b:to,t0:now(),d:K.FLOOD,e:EIN};kick()}
function drain(b,p){b.on=false;b.drainAt=0;measure(b);if(RM){b.fl={x:p.x,y:p.y,r:0};b.flA=null;kick();return}let from={...b.fl};
if(from.r>=farR(b,from.x,from.y)-1)from={x:p.x,y:p.y,r:farR(b,p.x,p.y)};b.flA={a:from,b:{x:p.x,y:p.y,r:0},t0:now(),d:K.DRAIN,e:EINOUT};kick()}
function roll(b){if(RM)return;if(b.roll<b.rollB1-.02)return;b.rollA0=b.roll;b.rollB1=Math.floor(b.roll+.02)+1;b.rollT0=now();kick()}
function press(b,p){if(RM)return;b.sx.f=b.sy.f=K.SQ_F;b.sx.z=b.sy.z=K.SQ_Z;b.sx.t=K.SQ_X;b.sy.t=K.SQ_Y;b.rip={x:p.x,y:p.y,t0:now()};kick()}
function release(b){b.sx.f=b.sy.f=K.REL_F;b.sx.z=b.sy.z=K.REL_Z;b.sx.t=1;b.sy.t=1;kick()}
function frame(){raf=0;const t=now(),dt=Math.min(1/20,Math.max(0,t-last));last=t;let live=false;
for(const b of btns){if(b.drainAt&&t>=b.drainAt&&b.drainPt){const p=b.drainPt;b.drainPt=null;drain(b,p)}if(b.drainAt)live=true;
if(b.flA){const k=Math.min(1,(t-b.flA.t0)/b.flA.d),e=b.flA.e(k),A=b.flA.a,B=b.flA.b;b.fl={x:A.x+(B.x-A.x)*e,y:A.y+(B.y-A.y)*e,r:A.r+(B.r-A.r)*e};if(k>=1)b.flA=null;else live=true}
if(b.fl.r<=.25){b.ink.style.visibility='hidden';b.ink.style.clipPath='circle(0px at 0px 0px)'}else{b.ink.style.visibility='visible';b.ink.style.clipPath=`circle(${b.fl.r.toFixed(2)}px at ${b.fl.x.toFixed(2)}px ${b.fl.y.toFixed(2)}px)`}
for(const s of[b.mx,b.my,b.sx,b.sy])if(stepSpr(s,dt))live=true;
b.el.style.translate=(b.mx.x||b.my.x)?`${b.mx.x.toFixed(2)}px ${b.my.x.toFixed(2)}px`:'';b.el.style.scale=(b.sx.x!==1||b.sy.x!==1)?`${b.sx.x.toFixed(4)} ${b.sy.x.toFixed(4)}`:'';
const px=b.mx.x*(K.PAR-1),py=b.my.x*(K.PAR-1);for(const e of b.par)e.style.translate=(px||py)?`${px.toFixed(2)}px ${py.toFixed(2)}px`:'';
if(b.roll!==b.rollB1){const k=Math.min(1,(t-b.rollT0)/K.ROLL);b.roll=k>=1?b.rollB1:b.rollA0+(b.rollB1-b.rollA0)*EIN(k);if(k<1)live=true}
const fr=b.roll-Math.floor(b.roll);for(const e of b.rollA)e.style.transform=fr?`translate3d(0,${(-fr*100).toFixed(3)}%,0)`:'';for(const e of b.rollB)e.style.transform=`translate3d(0,${((1-fr)*100).toFixed(3)}%,0)`;
for(const e of b.arrA)e.style.transform=fr?`translate3d(${(fr*130).toFixed(3)}%,${(-fr*130).toFixed(3)}%,0)`:'';for(const e of b.arrB)e.style.transform=`translate3d(${((fr-1)*130).toFixed(3)}%,${((1-fr)*130).toFixed(3)}%,0)`;
if(b.rip){const k=(t-b.rip.t0)/K.RIP_DUR;if(k>=1)b.rip=null;else{live=true;const pad=24;if(!b.filtOn){measure(b);b.filt.setAttribute('x',-pad);b.filt.setAttribute('y',-pad);b.filt.setAttribute('width',b.w+2*pad);b.filt.setAttribute('height',b.h+2*pad);b.el.style.filter=`url(#${b.filt.id})`;b.filtOn=true}
const fR=farR(b,b.rip.x,b.rip.y),front=4+fR*1.15*EIN(k),half=front/.9,grow=Math.min(1,front/(.75*fR)),amp=K.RIP[b.kind]*grow*grow*Math.pow(1-k,1.6);
b.fimg.setAttribute('x',(b.rip.x-half).toFixed(2));b.fimg.setAttribute('y',(b.rip.y-half).toFixed(2));b.fimg.setAttribute('width',(2*half).toFixed(2));b.fimg.setAttribute('height',(2*half).toFixed(2));b.disp.setAttribute('scale',amp.toFixed(3))}}
if(!b.rip&&b.filtOn){b.el.style.filter='';b.disp.setAttribute('scale','0');b.filtOn=false}}
if(live)raf=requestAnimationFrame(frame)}
function kick(){if(!raf){last=now();raf=requestAnimationFrame(frame)}}
function onMove(e){if(e.pointerType!=='mouse')return;for(const b of btns){if(!b.mag)continue;const r=b.el.getBoundingClientRect();if(!r.width)continue;const cx=(r.left+r.right)/2-b.mx.x,cy=(r.top+r.bottom)/2-b.my.x,w=b.el.offsetWidth,h=b.el.offsetHeight,pad=Math.max(K.MAG_PAD*w,K.MAG_PAD_MIN);
const dx=e.clientX-cx,dy=e.clientY-cy,ox=Math.max(0,Math.abs(dx)-w/2),oy=Math.max(0,Math.abs(dy)-h/2),out=Math.hypot(ox,oy)/pad;let tx=0,ty=0;
if(out<1){const s=1-out*out*(3-2*out),M=K.MAG[b.kind];tx=Math.max(-1,Math.min(1,dx/(w/2+pad)))*M*s;ty=Math.max(-1,Math.min(1,dy/(h/2+pad)))*M*s}if(tx!==b.mx.t||ty!==b.my.t){b.mx.t=tx;b.my.t=ty;kick()}}}
function bind(el,kind,o={}){if(!el||btns.some(b=>b.el===el))return null;const ink=el.querySelector(':scope > .ink');if(!ink)return null;const q=s=>Array.from(el.querySelectorAll(s));const{f,im,dm}=makeFilter();
const b={el,kind,ink,mag:o.magnet!==false,par:q('.ink-par'),rollA:q('.ir-a'),rollB:q('.ir-b'),arrA:q('.ia-a'),arrB:q('.ia-b'),w:0,h:0,fl:{x:0,y:0,r:0},flA:null,on:false,pressT0:0,downPt:null,drainAt:0,drainPt:null,
mx:spr(0,K.MAG_F,K.MAG_Z),my:spr(0,K.MAG_F,K.MAG_Z),sx:spr(1,K.SQ_F,K.SQ_Z),sy:spr(1,K.SQ_F,K.SQ_Z),roll:0,rollA0:0,rollB1:0,rollT0:0,rip:null,filt:f,fimg:im,disp:dm,filtOn:false};
el.classList.add('inkb');btns.push(b);measure(b);kick();const P=e=>local(b,e.clientX,e.clientY);
el.addEventListener('pointerenter',e=>{armMaps();if(e.pointerType==='mouse'){flood(b,P(e));roll(b)}});
el.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){drain(b,P(e));release(b)}});
el.addEventListener('pointerdown',e=>{if(e.button!==0)return;armMaps();const p=P(e);b.pressT0=now();b.downPt=p;if(e.pointerType!=='mouse')flood(b,p);press(b,p)});
const up=e=>{if(!b.downPt)return;b.downPt=null;release(b);roll(b);if(e.pointerType!=='mouse'){const p=P(e),at=b.pressT0+K.TAP_HOLD;if(e.type==='pointercancel'||now()>=at)drain(b,p);else{b.drainAt=at;b.drainPt=p;kick()}}};
addEventListener('pointerup',up);addEventListener('pointercancel',up);
el.addEventListener('focus',()=>{armMaps();if(el.matches(':focus-visible')){measure(b);flood(b,{x:b.w/2,y:b.h/2})}});
el.addEventListener('blur',()=>{if(b.on){measure(b);drain(b,{x:b.w/2,y:b.h/2})}});
el.addEventListener('keydown',e=>{if(!e.repeat&&(e.key==='Enter'||e.key===' ')){measure(b);b.downPt={x:b.w/2,y:b.h/2};press(b,b.downPt)}});
el.addEventListener('keyup',e=>{if((e.key==='Enter'||e.key===' ')&&b.downPt){b.downPt=null;release(b);roll(b)}});
if(!magnetOn&&!RM&&matchMedia('(hover: hover) and (pointer: fine)').matches){magnetOn=true;addEventListener('pointermove',onMove,{passive:true})}
return{roll:()=>roll(b),drain:()=>{if(b.on){measure(b);drain(b,{x:b.w/2,y:b.h/2})}}}}
window.__ink={bind};
document.querySelectorAll('.big-btn').forEach(el=>bind(el,'cta'));
document.querySelectorAll('.top .pill').forEach(el=>bind(el,'sound'));
})();
(()=>{/* the case-study video player (Shifat 06:36Z "custom made based on my portfolio design system"): frosted pills, Inter,
ink / white / silver, Phosphor icons, the portfolio's ink buttons. Loops still autoplay muted in view (the clips have no audio). */
const vps=[...document.querySelectorAll('.vp')];if(!vps.length)return;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,FINE=matchMedia('(hover: hover) and (pointer: fine)').matches,ink=window.__ink;
const IC={"play": "M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z", "pause": "M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z", "fs": "M220,48V88a12,12,0,0,1-24,0V60H168a12,12,0,0,1,0-24h40A12,12,0,0,1,220,48ZM88,196H60V168a12,12,0,0,0-24,0v40a12,12,0,0,0,12,12H88a12,12,0,0,0,0-24Zm120-40a12,12,0,0,0-12,12v28H168a12,12,0,0,0,0,24h40a12,12,0,0,0,12-12V168A12,12,0,0,0,208,156ZM88,36H48A12,12,0,0,0,36,48V88a12,12,0,0,0,24,0V60H88a12,12,0,0,0,0-24Z", "fsx": "M148,96V48a12,12,0,0,1,24,0V84h36a12,12,0,0,1,0,24H160A12,12,0,0,1,148,96ZM96,148H48a12,12,0,0,0,0,24H84v36a12,12,0,0,0,24,0V160A12,12,0,0,0,96,148Zm112,0H160a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V172h36a12,12,0,0,0,0-24ZM96,36A12,12,0,0,0,84,48V84H48a12,12,0,0,0,0,24H96a12,12,0,0,0,12-12V48A12,12,0,0,0,96,36Z"};
const svg=(k,s)=>`<svg viewBox="0 0 256 256" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="${IC[k]}"/></svg>`;
const btn=(cls,label,k,s)=>`<button type="button" class="${cls}" aria-label="${label}"><span class="vp__ic ink-par">${svg(k,s)}</span><span class="ink" aria-hidden="true"><span class="vp__ic ink-par">${svg(k,s)}</span></span></button>`;
const fmt=t=>{t=Math.max(0,Math.floor(t||0));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const setIc=(b,k)=>b.querySelectorAll('path').forEach(p=>p.setAttribute('d',IC[k]));
const live=new Set();let raf=0;const loop=()=>{raf=0;for(const P of live)P.paint();if(live.size)raf=requestAnimationFrame(loop)};
const P0=vps.map(vp=>{const v=vp.querySelector('video');if(!v)return null;v.controls=false;v.removeAttribute('controls');
const ui=document.createElement('div');ui.className='vp__ui';
ui.innerHTML=btn('vp__big','Play video','play',26)+`<div class="vp__bar">${btn('vp__btn vp__pp','Play','play',16)}<span class="vp__time"><span class="vp__cur">0:00</span><i>/</i><span class="vp__dur">0:00</span></span><div class="vp__scrub" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00 of 0:00"><span class="vp__track"><span class="vp__buf"></span><span class="vp__fill"></span><span class="vp__knob"></span></span></div>${btn('vp__btn vp__fs','Full screen','fs',16)}</div>`;
vp.appendChild(ui);
const $=s=>ui.querySelector(s),big=$('.vp__big'),pp=$('.vp__pp'),fs=$('.vp__fs'),cur=$('.vp__cur'),dur=$('.vp__dur'),sc=$('.vp__scrub'),fill=$('.vp__fill'),buf=$('.vp__buf'),knob=$('.vp__knob');
if(ink){ink.bind(big,'cta');ink.bind(pp,'sound',{magnet:false});ink.bind(fs,'sound',{magnet:false})}
let user=0,vis=0,drag=0,hideT=0,lastP=-1;
const P={vp,v,paint(){const d=v.duration||0,t=v.currentTime||0,p=d?Math.min(1,t/d):0;if(Math.abs(p-lastP)>1e-4){lastP=p;fill.style.transform=`scaleX(${p.toFixed(4)})`;knob.style.left=(p*100).toFixed(3)+'%'}
const s=fmt(t);if(cur.textContent!==s){cur.textContent=s;sc.setAttribute('aria-valuenow',Math.floor(t));sc.setAttribute('aria-valuetext',`${s} of ${fmt(d)}`)}
if(v.buffered.length&&d){buf.style.transform=`scaleX(${Math.min(1,v.buffered.end(v.buffered.length-1)/d).toFixed(3)})`}}};
const state=()=>{const pl=!v.paused&&!v.ended;vp.dataset.state=pl?'playing':'paused';setIc(pp,pl?'pause':'play');pp.setAttribute('aria-label',pl?'Pause':'Play');
if(pl&&vis)live.add(P);else live.delete(P);if(live.size&&!raf)raf=requestAnimationFrame(loop);P.paint()};
const load=()=>{if(v.preload==='none'){v.preload='auto';v.load()}};/* a host that answers without byte ranges leaves the clip unseekable (and iOS Safari will not play it at all): then the clip is fetched once as a blob, which is seekable everywhere, and swapped in where it was */
let blob=0,want=-1;const canSeek=()=>{const d=v.duration;return v.seekable.length>0&&d>0&&v.seekable.end(v.seekable.length-1)>=d-.5};const toBlob=()=>{if(blob)return;blob=1;const s=v.currentSrc||(v.querySelector('source')||{}).src;if(!s)return;fetch(s).then(r=>r.ok?r.blob():Promise.reject()).then(bl=>{const t=want>=0?want:v.currentTime,pl=!v.paused||(vis&&!user&&!RM);want=-1;v.addEventListener('loadedmetadata',()=>{try{v.currentTime=Math.min(t,(v.duration||t)-.05)}catch(e){}if(pl)play()},{once:true});v.src=URL.createObjectURL(bl);v.load()}).catch(()=>{blob=0})};/* R-video1: no blob fetch on load any more; a clip is fetched as a seekable blob only when someone actually scrubs it (or it fails to play), so a scroll-through downloads each clip once */const so=v.querySelector('source');if(so)so.addEventListener('error',toBlob);v.addEventListener('error',toBlob);
const play=()=>{load();const r=v.play();if(r&&r.catch)r.catch(()=>{state()})};
const toggle=()=>{if(v.paused||v.ended){user=0;play()}else{user=1;v.pause()}showUi()};
const showUi=(ms)=>{vp.classList.add('is-ui');clearTimeout(hideT);if(!v.paused)hideT=setTimeout(()=>{if(!drag&&!vp.matches(':focus-within'))vp.classList.remove('is-ui')},ms||2200)};
['play','playing','pause','ended','loadedmetadata','durationchange'].forEach(e=>v.addEventListener(e,()=>{if(e==='loadedmetadata'||e==='durationchange'){dur.textContent=fmt(v.duration);sc.setAttribute('aria-valuemax',Math.floor(v.duration||0))}state();if(e==='pause'||e==='ended')showUi()}));
v.addEventListener('progress',()=>P.paint());v.addEventListener('timeupdate',()=>{if(!live.has(P))P.paint()});
big.addEventListener('click',toggle);pp.addEventListener('click',toggle);
v.addEventListener('click',e=>{if(e.pointerType==='mouse'||e.detail&&FINE)toggle();else{vp.classList.contains('is-ui')?vp.classList.remove('is-ui'):showUi(3000)}});
vp.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')showUi()});vp.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!v.paused&&!drag){clearTimeout(hideT);hideT=setTimeout(()=>vp.classList.remove('is-ui'),400)}});
vp.addEventListener('focusin',()=>showUi());
// scrub: drag anywhere on the strip, arrows / Home / End on the keyboard
const seek=x=>{const r=sc.querySelector('.vp__track').getBoundingClientRect(),d=v.duration;if(!d)return;const t=Math.min(d-.05,Math.max(0,(x-r.left)/r.width*d));if(!canSeek()){want=t;toBlob()}v.currentTime=t;lastP=-1;P.paint()};
sc.addEventListener('pointerdown',e=>{if(e.button!==0)return;load();if(!canSeek())toBlob();drag=1;sc.classList.add('is-drag');sc.setPointerCapture(e.pointerId);seek(e.clientX);showUi()});
sc.addEventListener('pointermove',e=>{if(drag)seek(e.clientX)});
const end=()=>{if(!drag)return;drag=0;sc.classList.remove('is-drag');showUi()};sc.addEventListener('pointerup',end);sc.addEventListener('pointercancel',end);
sc.addEventListener('keydown',e=>{const d=v.duration;if(!d)return;let t=v.currentTime;if(e.key==='ArrowRight'||e.key==='ArrowUp')t+=d*.05;else if(e.key==='ArrowLeft'||e.key==='ArrowDown')t-=d*.05;else if(e.key==='Home')t=0;else if(e.key==='End')t=d-.05;else if(e.key===' '||e.key==='k'){e.preventDefault();toggle();return}else return;
e.preventDefault();t=Math.min(d-.05,Math.max(0,t));if(!canSeek()){want=t;toBlob()}v.currentTime=t;lastP=-1;P.paint()});
// full screen: the player itself where the browser allows it, else the phone's own video viewer
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
fs.addEventListener('click',()=>{if(fsEl()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else if(vp.requestFullscreen){vp.requestFullscreen().catch(()=>{})}else if(vp.webkitRequestFullscreen){vp.webkitRequestFullscreen()}else if(v.webkitEnterFullscreen){load();v.webkitEnterFullscreen()}});
const fsc=()=>{const on=fsEl()===vp;setIc(fs,on?'fsx':'fs');fs.setAttribute('aria-label',on?'Exit full screen':'Full screen')};document.addEventListener('fullscreenchange',fsc);document.addEventListener('webkitfullscreenchange',fsc);
P.setVis=x=>{vis=x;if(x){load();if(!RM&&!user&&v.paused)play()}else if(!v.paused&&!fsEl())v.pause();state()};
state();return P}).filter(Boolean);
if(!('IntersectionObserver' in window)){P0.forEach(P=>P.setVis(1));return}
const io=new IntersectionObserver(es=>{for(const e of es){const P=P0.find(p=>p.vp===e.target);if(P)P.setVis(e.isIntersecting)}},{rootMargin:'200px 0px',threshold:.15});P0.forEach(P=>io.observe(P.vp));
})();
(()=>{/* footer progress bar. R6.80 (Shifat Oct 22 "scroll hard to loop to top", "Rubber band is enough"): the footer is the
end of the page; scrolling on past it only stretches the bar, which springs back to 0 when the input stops; only a hard,
sustained push (wheel, finger or held key) outruns the leak and fills it, and a full bar wraps to the top. Passive listeners;
the rAF runs only while the bar is stretched. Reduced motion keeps the old runway (native scroll fills the bar). */
const f=document.querySelector('.overscroll__fill'),ft=document.querySelector('.site-footer'),sp=document.querySelector('.footer-spacer');if(f&&ft&&sp){let p=0,fired=0;const bar=f.closest('.overscroll__bar');
const size=()=>{document.documentElement.style.setProperty('--fh',ft.offsetHeight+'px')};
const set=v=>{const s=v.toFixed(3);f.style.setProperty('--f',s);bar.style.setProperty('--f',s);dispatchEvent(new Event('cs-barf'))};
// after the wrap the rest of the push (wheel inertia) is dropped until it pauses (450 ms), max 1.8 s, so it cannot carry you down from the top
let muteUntil=0,muteCap=0;const mute=e=>{const t=performance.now();if(t<muteUntil){if(e.cancelable)e.preventDefault();muteUntil=Math.min(muteCap,t+450)}else removeEventListener('wheel',mute,{passive:false})};
// R6.81 (Shifat Oct 22 05:12 "auto fill to 100% and loop back to top & stop scroll a bit moment"): after a rubber-band loop
// the page HOLDS at the top for 0.8 s: wheel, finger and scroll keys do nothing (touch screens also stop any momentum)
const HOLD=800,coarse=matchMedia('(hover: none) and (pointer: coarse)');let holdUntil=0;
const block=e=>{if(performance.now()<holdUntil){if(e.cancelable)e.preventDefault()}};
const blockKey=e=>{if(performance.now()<holdUntil&&/^(ArrowDown|ArrowUp|PageDown|PageUp|End|Home| )$/.test(e.key))e.preventDefault()};
const hold=()=>{const d=document.documentElement;holdUntil=performance.now()+HOLD;const nf={passive:false};
addEventListener('touchmove',block,nf);addEventListener('wheel',block,nf);addEventListener('keydown',blockKey,true);if(coarse.matches)d.classList.add('cs-hold');
setTimeout(()=>{removeEventListener('touchmove',block,nf);removeEventListener('wheel',block,nf);removeEventListener('keydown',blockKey,true);d.classList.remove('cs-hold')},HOLD)};
const wrap=h=>{fired=1;const t=performance.now();muteUntil=t+(h?HOLD:600);muteCap=t+1800;addEventListener('wheel',mute,{passive:false});scrollTo({top:0,behavior:'instant'});if(h)hold();setTimeout(()=>fired=0,900)};
const RMq=matchMedia('(prefers-reduced-motion: reduce)');
const u=()=>{p=0;if(!RMq.matches)return;const d=document.documentElement,m=d.scrollHeight-innerHeight,rw=sp.offsetHeight,v=rw>0?Math.min(1,Math.max(0,(scrollY-(m-rw)+2)/Math.max(1,rw-6))):0;set(v);
if(v>0.985&&!fired)wrap()};
addEventListener('scroll',()=>{if(!p)p=requestAnimationFrame(u)},{passive:true});addEventListener('resize',()=>{size();u()});size();u();
// the rubber band (same numbers as the portfolio's services/loopPull.ts)
// R6.81: past 80 % it is the point of no return: a tiny buzz (Android, once the visitor has tapped the page; the browser's
// rule), then the bar fills itself to 100 % (0.3 s ease) and loops; pushing back no longer drains it
const WK=1150,WC=120,TK=.6,KS=.05,LEAK=.3,GRACE=.13,SPRING=6.5,ARM=.3,COMMIT=.8,AUTO=.3;
let pull=0,lastPush=-1e9,restSince=-1,finger=0,fy=0,raf=0,last=0,shown=-1,cAt=-1,cFrom=0;
const now=()=>performance.now()/1000,atEnd=()=>scrollY>=document.documentElement.scrollHeight-innerHeight-2;
const buzz=()=>{try{const n=navigator;if(typeof n.vibrate==='function'&&(!n.userActivation||n.userActivation.hasBeenActive))n.vibrate(10)}catch(e){}};
const commit=()=>{if(cAt>=0)return;pull=Math.min(pull,COMMIT);cAt=now();cFrom=pull;buzz();go()};
const step=t=>{raf=0;const dt=Math.min(.1,Math.max(0,(t-last)/1000));last=t;const T=now();
if(cAt>=0){const k=Math.min(1,(T-cAt)/AUTO);pull=cFrom+(1-cFrom)*(1-Math.pow(1-k,3));if(Math.abs(pull-shown)>1e-4){shown=pull;set(pull)}
if(k>=1){cAt=-1;pull=0;restSince=-1;if(!fired)wrap(1)}else raf=requestAnimationFrame(step);return}
if(atEnd()){if(restSince<0)restSince=T}else{restSince=-1;pull=Math.max(0,pull-dt*SPRING*2*pull)}
if(pull>0){pull=Math.max(0,pull-LEAK*dt);if(!finger&&T-lastPush>GRACE)pull*=Math.exp(-SPRING*dt);if(pull<.002)pull=0}
if(Math.abs(pull-shown)>1e-4){shown=pull;set(pull)}
if(pull>=COMMIT){commit();return}
if(pull>0||(restSince>=0&&(finger||T-restSince<ARM)))raf=requestAnimationFrame(step)};
const go=()=>{if(!raf&&!RMq.matches&&!document.documentElement.classList.contains('gift-open')){last=performance.now();raf=requestAnimationFrame(step)}};
const push=v=>{go();if(cAt>=0||RMq.matches||!atEnd()||restSince<0||now()-restSince<ARM)return;pull=Math.min(1,pull+v);lastPush=now();if(pull>=COMMIT)commit()};
addEventListener('scroll',go,{passive:true});
addEventListener('wheel',e=>{if(e.ctrlKey)return;let dy=e.deltaY;if(Math.abs(e.deltaX)>Math.abs(dy))return;if(e.deltaMode===1)dy*=40;else if(e.deltaMode===2)dy*=800;
if(dy>0)push(Math.min(dy,WC)/WK);else if(dy<0&&cAt<0){pull=Math.max(0,pull+dy/WK*3);go()}},{passive:true});
addEventListener('touchstart',e=>{finger=e.touches.length===1?1:0;fy=e.touches[0]?e.touches[0].clientY:0;go()},{passive:true});
addEventListener('touchmove',e=>{if(!finger||e.touches.length!==1)return;const y=e.touches[0].clientY,dy=y-fy;fy=y;const k=TK*innerHeight;if(dy<0)push(-dy/k);else if(dy>0&&cAt<0){pull=Math.max(0,pull-dy/k*2);go()}},{passive:true});
const up=()=>{finger=0;go()};addEventListener('touchend',up,{passive:true});addEventListener('touchcancel',up,{passive:true});
addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;if(e.key==='ArrowDown'||e.key==='PageDown'||(e.key===' '&&!e.shiftKey))push(KS)});
window.__csPull={get value(){return pull},get committed(){return cAt>=0}};go()}
})();
(()=>{/* GPU footer bar (Shifat 06:33Z "Gpu version"): the portfolio's lime glow bar drawn in WebGL (footerWorld.ts footBar,
layer for layer) and bent by the portfolio's cursor trail (ScreenPaint.ts + ScreenPaintDistortion, same numbers), on one small
canvas behind the footer text. Lazy (starts when the footer nears the viewport), sleeps when off-screen or still, DOM bar stays as
the fallback (no WebGL, reduced motion, context lost). Zero dependencies.
R6.94 (Shifat Oct 23 2:00 PM "Just old footer with plain white bg but fill bar & gift sticker gets refracted on cursor trail"): the
same canvas now also reaches up over the gift sticker. While the trail runs over the sticker, the sticker's own 2D canvas is
uploaded and drawn here (its DOM canvas goes transparent, the button stays for the peel/drag/tap), so the trail bends the bar
and the sticker together; once the trail has died out the DOM sticker takes over again. On white the trail's colour fringe is
kept faint; on the bar and the sticker it is the portfolio's. */
const H=document.documentElement,ft=document.querySelector('.site-footer'),track=document.querySelector('.overscroll__track'),bar=document.querySelector('.overscroll__bar');
if(!ft||!track||!bar||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const M=72,PHONE=matchMedia('(pointer:coarse)').matches||innerWidth<820,KP=Math.min(1.5,devicePixelRatio||1)/4;
let cv,gl,P={},T={},U={},vb,sb,stk=null,stkOn=0,stkHot=0,stkVer=-1,stkPv=-1,stkDirty=0,scx=0,scy=0,on=0,vis=0,raf=0,dead=0,dirty=1,sceneDirty=1,cw=1,ch=1,dpr=1,pw=2,ph=2,lw=1,lh=1,bg=[1,1,1],rect=null,trk=[0,0,0,0];
let mx=-1e4,my=-1e4,hasP=0,lmx=0,lmy=0,lastTop=null,lastSY=scrollY,sDelta=0,from=[0,0,0],to=[0,0,0],vel=[0,0],moved=0,idle=0,last=0,bf=0,bfFrom=0,bfTo=0,bfT=1,ping=0;
const VS='attribute vec2 p;varying vec2 v_uv;void main(){v_uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const PAINT=`precision highp float;uniform sampler2D u_prev,u_low;uniform vec2 u_px;uniform vec4 u_from,u_to;uniform vec2 u_vel,u_off;varying vec2 v_uv;
vec2 pn_hash(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy)*2.-1.;}
vec3 noised(in vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);vec2 du=30.*f*f*(f*(f-2.)+1.);
vec2 ga=pn_hash(i),gb=pn_hash(i+vec2(1.,0.)),gc=pn_hash(i+vec2(0.,1.)),gd=pn_hash(i+vec2(1.,1.));
float va=dot(ga,f),vb=dot(gb,f-vec2(1.,0.)),vc=dot(gc,f-vec2(0.,1.)),vd=dot(gd,f-vec2(1.,1.));
float v=va+u.x*(vb-va)+u.y*(vc-va)+u.x*u.y*(va-vb-vc+vd);
vec2 d=ga+u.x*(gb-ga)+u.y*(gc-ga)+u.x*u.y*(ga-gb-gc+gd)+du*(u.yx*(va-vb-vc+vd)+vec2(vb,vc)-va);return vec3(v,d);}
vec2 capsule(vec2 p,vec2 a,vec2 b){vec2 ap=p-a,ab=b-a;float t=clamp(dot(ap,ab)/max(dot(ab,ab),1e-6),0.,1.);return vec2(length(ap-ab*t),t);}
void main(){vec2 seg=capsule(gl_FragCoord.xy,u_from.xy,u_to.xy);vec2 rw=mix(u_from.zw,u_to.zw,seg.y);float brush=1.-smoothstep(-.01,rw.x,seg.x);
vec4 low=texture2D(u_low,v_uv-u_off);vec2 upstream=(.5-low.xy)*25.;
vec3 n0=noised(gl_FragCoord.xy*.02*(1.-low.xy));vec2 n1=noised(gl_FragCoord.xy*.02*(2.-low.xy*(.5+n0.x)+n0.yz*.1)).yz;upstream+=n1*(low.z+low.w)*3.;
vec4 data=texture2D(u_prev,v_uv-u_off+upstream*u_px);data.xy-=.5;
vec4 change=(vec3(.975,.95,.8).xxyz-1.)*data;change+=vec4(u_vel*brush,rw.yy*brush);change.zw=sign(change.zw)*max(vec2(.004),abs(change.zw));data+=change;
data.xy+=.5;gl_FragColor=clamp(data,0.,1.);}`;
const STKVS='attribute vec2 p;uniform vec2 u_c,u_ax,u_ay,u_res;varying vec2 v_uv;void main(){v_uv=p*.5+.5;vec2 q=u_c+p.x*u_ax+p.y*u_ay;gl_Position=vec4(q.x/u_res.x*2.-1.,1.-q.y/u_res.y*2.,0.,1.);}';
const COPY=`precision mediump float;varying vec2 v_uv;uniform sampler2D u_t;void main(){gl_FragColor=texture2D(u_t,v_uv);}`;
const BLUR=`precision highp float;uniform sampler2D u_t;uniform vec2 u_dir;varying vec2 v_uv;
void main(){vec4 c=texture2D(u_t,v_uv)*.1633;vec2 d=u_dir;c+=(texture2D(u_t,v_uv-d)+texture2D(u_t,v_uv+d))*.1531;d+=u_dir;
c+=(texture2D(u_t,v_uv-d)+texture2D(u_t,v_uv+d))*.12245;d+=u_dir;c+=(texture2D(u_t,v_uv-d)+texture2D(u_t,v_uv+d))*.0918;d+=u_dir;
c+=(texture2D(u_t,v_uv-d)+texture2D(u_t,v_uv+d))*.051;gl_FragColor=c;}`;
// footerWorld.ts footBar: the 24 px halo, the 9 px glow, the ink track, the fill's 6/14 px spill, the lime fill, its highlight
const SCENE=`precision highp float;varying vec2 v_uv;uniform vec4 u_bar;uniform vec3 u_bfill;uniform vec3 u_bg;uniform vec2 u_res;
float ferf(float x){float x2=x*x;float t=sqrt(1.-exp(-x2*(1.2732395+.147*x2)/(1.+.147*x2)));return x<0.?-t:t;}
float fgbox(float x,float a,float b,float s){float k=.70710678/s;return .5*(ferf((x-a)*k)-ferf((x-b)*k));}
float fcap(vec2 p,vec2 a,vec2 b){float r=.5*(b.y-a.y);vec2 q=abs(p-.5*(a+b))-(.5*(b-a)-vec2(r));return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
vec3 footBar(vec3 col){vec2 pc=vec2(v_uv.x*u_bfill.y,(1.-v_uv.y)*u_bfill.z);
float x0=u_bar.x,yT=u_bar.y,x1=u_bar.z,yB=u_bar.w,W=x1-x0,f=u_bfill.x;const vec3 LIME=vec3(.639,1.,.071);
if(f>.001){float cb=fgbox(6.+(pc.x-x0)/f,0.,W+12.,24.)*fgbox(pc.y,yB-22.,yB+10.,24.);col=mix(col,vec3(.722,1.,.235),clamp(cb,0.,1.)*(.45+.4*f));
float ca=fgbox((pc.x-x0)/f,0.,W,9.)*fgbox(pc.y,yB-12.,yB,9.);col=mix(col,LIME,clamp(ca,0.,1.)*(.55+.45*f));}
float aa=u_bfill.z/u_res.y;float ct=clamp(.5-fcap(pc,vec2(x0,yT),vec2(x1,yB))/aa,0.,1.);if(ct<=0.)return col;
vec3 c=vec3(.0706,.0745,.0824);float xr=x0+f*W;
if(f>.001){float sy2=fgbox(pc.y,yT,yB,7.),sy1=fgbox(pc.y,yT,yB,3.);
c=mix(c,LIME,clamp(.5*(1.-ferf((pc.x-xr)*.70710678/7.))*sy2,0.,1.)*.8);c=mix(c,LIME,clamp(.5*(1.-ferf((pc.x-xr)*.70710678/3.))*sy1,0.,1.));}
float cf=clamp(.5-fcap(pc,vec2(xr-W,yT),vec2(xr,yB))/aa,0.,1.);c=mix(c,LIME,cf);
c=mix(c,vec3(1.),clamp(.5-fcap(pc,vec2(xr-W+6.,yT+2.),vec2(xr-6.,yT+5.))/aa,0.,1.)*.55);return mix(col,c,ct);}
void main(){gl_FragColor=vec4(footBar(u_bg),1.);}`;
// ScreenPaintDistortion (R6.20, locked on the portfolio): 9 jittered taps along the paint velocity + the phase-shifted sine fringe
const DIST=`precision highp float;varying vec2 v_uv;uniform sampler2D u_scene,u_paint;uniform vec2 u_ptx,u_css;uniform float u_on;uniform vec3 u_bg;
float ign(vec2 p){return fract(52.9829189*fract(dot(p,vec2(.06711056,.00583715))));}
void main(){vec4 data=texture2D(u_paint,v_uv);float weight=(data.z+data.w)*.5;vec2 vel=(.5-data.xy-.001)*2.*weight;
vec2 stepUv=vel*3./4.*u_ptx*5.;vec2 bn=vec2(ign(gl_FragCoord.xy+vec2(17.,29.)),ign(gl_FragCoord.yx+vec2(5.,61.)));vec2 p=v_uv+bn*stepUv;
vec3 acc=vec3(0.);for(int i=0;i<9;i++){acc+=texture2D(u_scene,p).rgb;p+=stepUv;}acc/=9.;
vec2 e=min(v_uv,1.-v_uv)*u_css;float edge=smoothstep(0.,28.,e.y)*smoothstep(0.,28.,e.x)*mix(.12,1.,clamp(length(acc-u_bg)*4.,0.,1.));
acc+=sin(vec3(vel.x+vel.y)*40.+vec3(0.,2.,4.)*.5)*smoothstep(.4,-.9,weight)*1.25*max(abs(vel.x),abs(vel.y))*10.*edge*u_on;
gl_FragColor=vec4(clamp(acc,0.,1.),1.);}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error('glbar shader');return o}
function prog(fs,names,vs){const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs||VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'p');gl.linkProgram(p);
if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error('glbar link');const u={};names.forEach(n=>u[n]=gl.getUniformLocation(p,n));return{p,u}}
function tgt(w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR));[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));
const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return{t,f,w,h}}
function clearTo(o,r,g,b,a){gl.bindFramebuffer(gl.FRAMEBUFFER,o.f);gl.viewport(0,0,o.w,o.h);gl.clearColor(r,g,b,a);gl.clear(gl.COLOR_BUFFER_BIT)}
function stkSet(v){if(v===stkOn)return;stkOn=v;stkDirty=1;const b=window.__csGiftGL&&window.__csGiftGL.btn;if(b)b.classList.toggle('is-gl',!!v)}
function fallback(){stkSet(0);dead=1;on=0;H.classList.remove('foot-glbar');if(cv)cv.style.display='none';if(raf)cancelAnimationFrame(raf);raf=0}
function measure(){const fr=ft.getBoundingClientRect(),tr=track.getBoundingClientRect(),W=H.clientWidth;
const G=window.__csGiftGL,sb_=G&&G.btn,tT=Math.round(tr.top-fr.top);let sTop=1e9,sBot=-1e9,bx=0,by=0;
if(sb_&&sb_.offsetWidth){const br=sb_.getBoundingClientRect(),x=G.xf(),hw=Math.round(sb_.offsetWidth*2.4)/2;bx=br.left+br.width/2-x.x-fr.left;by=br.top+br.height/2-x.y-fr.top;sTop=by-hw-6-sb_.offsetWidth*.4;sBot=by+hw+6}
const top=Math.floor(Math.min(tT-M,Math.max(0,sTop))),bot=Math.ceil(Math.max(tT+tr.height+M,Math.min(fr.height,sBot)));
cw=W;ch=Math.max(1,bot-top);cv.style.cssText=`position:absolute;left:${-Math.round(fr.left)}px;top:${top}px;width:${cw}px;height:${ch}px;z-index:-1;pointer-events:none;display:block`;
scx=bx+Math.round(fr.left);scy=by-top;
const nd=PHONE?Math.min(2,devicePixelRatio||1):Math.min(1.5,devicePixelRatio||1),W2=Math.max(1,Math.round(cw*nd)),H2=Math.max(1,Math.round(ch*nd));
const nl=Math.round(tr.left-fr.left+Math.round(fr.left)),nt=tT-top;trk=[nl,nt,nl+tr.width,nt+tr.height];
if(W2!==cv.width||H2!==cv.height||nd!==dpr){dpr=nd;cv.width=W2;cv.height=H2;pw=Math.max(2,Math.ceil(cw*KP));ph=Math.max(2,Math.ceil(ch*KP));lw=Math.max(1,pw>>1);lh=Math.max(1,ph>>1);
['a','b','l','lb','s','bar'].forEach(k=>{if(T[k]){gl.deleteTexture(T[k].t);gl.deleteFramebuffer(T[k].f)}});
T.a=tgt(pw,ph);T.b=tgt(pw,ph);T.l=tgt(lw,lh);T.lb=tgt(lw,lh);T.s=tgt(W2,H2);T.bar=tgt(W2,H2);[T.a,T.b,T.l,T.lb].forEach(o=>clearTo(o,.5,.5,0,0))}
const c=getComputedStyle(ft).backgroundColor.match(/[\d.]+/g);if(c&&(c.length<4||+c[3]>.5))bg=[c[0]/255,c[1]/255,c[2]/255];
dirty=0;sceneDirty=1;kick()}
// R6.94: is the trail on the sticker? (the brush's last segment against the sticker, css px in this canvas; only the sticker
// and its shadow have to be inside, its transparent margin may run off an edge; dragged out of here it is the DOM one again); it stays drawn
// here for 48 frames after the trail last touched it (the paint fades per frame, ~20% a frame), then the DOM sticker is back
function stkPick(r,R){const G=window.__csGiftGL;let want=0;
if(G&&G.cv&&G.ready()){const x=G.xf(),cx=scx+x.x,cy=scy+x.y,hw=G.W/2*x.sc*(Math.abs(Math.cos(x.r))+Math.abs(Math.sin(x.r)));
const core=G.S*.75*x.sc;if(cx-core>=0&&cx+core<=cw&&cy-G.S*(.6*x.sc+.05)>=0&&cy+G.S*(.6*x.sc+.14+4.9*Math.max(0,x.sc-1))<=ch){let hit=0;
if(hasP&&R>0){const ax=lmx-r.left,ay=lmy-r.top,dx=mx-r.left-ax,dy=my-r.top-ay,L2=dx*dx+dy*dy,t=L2>0?Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/L2)):0;
hit=Math.hypot(ax+dx*t-cx,ay+dy*t-cy)<G.S*.8*x.sc+R}
if(hit)stkHot=48;else if(stkHot>0)stkHot--;want=stkHot>0}else stkHot=0}else stkHot=0;
stkSet(want?1:0)}
function stkCompose(){const G=window.__csGiftGL;if(!stkOn||!G)return;
if(G.ver!==stkVer){stkVer=G.ver;gl.bindTexture(gl.TEXTURE_2D,stk);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,G.cv)}catch(e){gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);stkSet(0);return}
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);stkDirty=1}
if(G.pv!==stkPv){stkPv=G.pv;stkDirty=1}if(!stkDirty)return;stkDirty=0;
gl.useProgram(P.copy.p);tex(P.copy.u.u_t,T.bar.t,0);quad(T.s);
const x=G.xf(),c=Math.cos(x.r),sn=Math.sin(x.r),h=G.W/2*x.sc,u=P.stk.u;gl.useProgram(P.stk.p);tex(u.u_t,stk,0);
gl.uniform2f(u.u_c,scx+x.x,scy+x.y);gl.uniform2f(u.u_ax,c*h,sn*h);gl.uniform2f(u.u_ay,-sn*h,c*h);gl.uniform2f(u.u_res,cw,ch);
gl.bindBuffer(gl.ARRAY_BUFFER,sb);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
gl.bindFramebuffer(gl.FRAMEBUFFER,T.s.f);gl.viewport(0,0,T.s.w,T.s.h);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
gl.disable(gl.BLEND);gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0)}
function quad(o,w,h){gl.bindFramebuffer(gl.FRAMEBUFFER,o?o.f:null);gl.viewport(0,0,o?o.w:w,o?o.h:h);gl.drawArrays(gl.TRIANGLES,0,3)}
function tex(u,t,unit){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(u,unit)}
const ease=x=>{const ax=.57,bx=3*(.22-.19)-ax,cx=1-ax-bx,ay=3,by=-ay,cy=1-ay-by;let t=x;for(let i=0;i<6;i++){const xt=((cx*t+bx)*t+ax)*t-x,d=(3*cx*t+2*bx)*t+ax;if(Math.abs(d)<1e-6)break;t=Math.min(1,Math.max(0,t-xt/d))}return((cy*t+by)*t+ay)*t};
function frame(now){raf=0;if(!on||dead)return;if(document.documentElement.classList.contains('gift-open')){last=0;return}if(dirty)measure();
const dt=Math.min(.1,Math.max(.001,(now-(last||now-16))/1000));last=now;
const r=cv.getBoundingClientRect(),dTop=lastTop==null?0:r.top-lastTop;lastTop=r.top;
const s=sDelta;sDelta=0;const jump=Math.abs(s)>innerHeight*.5||Math.abs(dTop)>innerHeight*.5;
// the fill, eased like the DOM's .32 s transition on var(--ease)
const f=Math.min(1,Math.max(0,parseFloat(bar.style.getPropertyValue('--f'))||0));
if(Math.abs(f-bfTo)>1e-4){bfFrom=bf;bfTo=f;bfT=0}const ob=bf;bfT=Math.min(1,bfT+dt/.32);bf=bfFrom+(bfTo-bfFrom)*ease(bfT);if(Math.abs(bf-ob)>1e-5)sceneDirty=1;
// brush (ScreenPaint.update, desktop rule on every device): radius from px moved + the scroll term x3, tapered from the last radius
const ratio=.6,maxR=Math.max(40,innerWidth/20),sT=jump?0:s;let R=0;
if(hasP){R=Math.min(1,Math.max(0,Math.hypot(mx-lmx,(my+sT*ratio*3)-lmy)/100))*maxR;if(sT===0&&!moved)R=0}stkPick(r,R);lmx=mx;lmy=my;moved=0;R*=KP;
from=to.slice();to=[(mx-r.left)*KP,(r.bottom-my)*KP+(jump?0:sT*ratio*KP*.5),R];if(!hasP||jump){from=to.slice();hasP=1}
vel=[vel[0]*.8+(to[0]-from[0])*dt*.8,vel[1]*.8+(to[1]-from[1])*dt*.8];
const active=R>.01||from[2]>.01||sceneDirty||stkOn;if(active)idle=0;else idle+=dt;
// paint pass
const off=jump?0:(s*ratio+dTop)/Math.max(1,ch);const src=ping?T.b:T.a,dst=ping?T.a:T.b;ping^=1;
gl.useProgram(P.paint.p);const u=P.paint.u;tex(u.u_prev,src.t,0);tex(u.u_low,T.l.t,1);gl.uniform2f(u.u_px,1/pw,1/ph);gl.uniform2f(u.u_off,0,off);
gl.uniform4f(u.u_from,from[0],from[1],from[2],1);gl.uniform4f(u.u_to,to[0],to[1],to[2],1);gl.uniform2f(u.u_vel,vel[0],vel[1]);quad(dst);
gl.useProgram(P.copy.p);tex(P.copy.u.u_t,dst.t,0);quad(T.l);
gl.useProgram(P.blur.p);tex(P.blur.u.u_t,T.l.t,0);gl.uniform2f(P.blur.u.u_dir,8/lw*.25,0);quad(T.lb);tex(P.blur.u.u_t,T.lb.t,0);gl.uniform2f(P.blur.u.u_dir,0,8/lh*.25);quad(T.l);
if(sceneDirty){sceneDirty=0;gl.useProgram(P.scene.p);const q=P.scene.u;gl.uniform4f(q.u_bar,trk[0],trk[1],trk[2],trk[3]);gl.uniform3f(q.u_bfill,bf,cw,ch);gl.uniform3f(q.u_bg,bg[0],bg[1],bg[2]);gl.uniform2f(q.u_res,T.s.w,T.s.h);quad(T.bar);stkDirty=1}
stkCompose();
gl.useProgram(P.dist.p);const q=P.dist.u;tex(q.u_scene,(stkOn?T.s:T.bar).t,0);tex(q.u_paint,dst.t,1);gl.uniform2f(q.u_ptx,1/pw,1/ph);gl.uniform2f(q.u_css,cw,ch);gl.uniform3f(q.u_bg,bg[0],bg[1],bg[2]);gl.uniform1f(q.u_on,1);quad(null,cv.width,cv.height);
if(!H.classList.contains('foot-glbar'))H.classList.add('foot-glbar');
if(vis&&idle<3){if(!raf)raf=requestAnimationFrame(frame)}else{last=0}}
function kick(){if(on&&vis&&!raf&&!dead&&!document.documentElement.classList.contains('gift-open')){idle=0;raf=requestAnimationFrame(frame)}}
function init(){if(on||dead)return;cv=document.createElement('canvas');cv.className='overscroll__gl';cv.setAttribute('aria-hidden','true');
const o={alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,preserveDrawingBuffer:false,powerPreference:'low-power'};
try{gl=cv.getContext('webgl',o)||cv.getContext('experimental-webgl',o)}catch(e){gl=null}if(!gl){dead=1;return}
try{P.paint=prog(PAINT,['u_prev','u_low','u_px','u_from','u_to','u_vel','u_off']);P.copy=prog(COPY,['u_t']);P.blur=prog(BLUR,['u_t','u_dir']);
P.scene=prog(SCENE,['u_bar','u_bfill','u_bg','u_res']);P.dist=prog(DIST,['u_scene','u_paint','u_ptx','u_css','u_on','u_bg']);P.stk=prog(COPY.replace('uniform sampler2D u_t;','uniform sampler2D u_t;'),['u_t','u_c','u_ax','u_ay','u_res'],STKVS)}catch(e){dead=1;return}
sb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,sb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
stk=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,stk);[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR));[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T].forEach(k=>gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE));
if(window.__csGiftGL)window.__csGiftGL.kick=()=>{if(stkOn)kick()};
vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback()});
ft.appendChild(cv);on=1;measure();
new IntersectionObserver(es=>{vis=es[es.length-1].isIntersecting;if(vis){lastTop=null;kick()}else stkSet(0)},{rootMargin:'40px 0px'}).observe(cv);
const mv=(x,y)=>{if(!hasP){lmx=x;lmy=y}mx=x;my=y;moved=1;kick()};
addEventListener('pointermove',e=>mv(e.clientX,e.clientY),{passive:true});
addEventListener('touchstart',e=>{const t=e.touches[0];if(t){lmx=t.clientX;lmy=t.clientY;mv(t.clientX,t.clientY)}},{passive:true});
addEventListener('touchmove',e=>{const t=e.touches[0];if(t)mv(t.clientX,t.clientY)},{passive:true});
addEventListener('scroll',()=>{sDelta+=scrollY-lastSY;lastSY=scrollY;kick()},{passive:true});
addEventListener('resize',()=>{dirty=1;kick()});addEventListener('cs-barf',()=>kick());if(window.ResizeObserver)new ResizeObserver(()=>{dirty=1;kick()}).observe(ft);
document.fonts&&document.fonts.ready&&document.fonts.ready.then(()=>{dirty=1;kick()})}
window.__csQuiet(init);new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){init()}},{rootMargin:'600px 0px'}).observe(ft);
addEventListener('cs-gift-closed',()=>{lastTop=null;kick()});
})();
