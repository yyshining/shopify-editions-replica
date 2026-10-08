'use client';
import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {ArrowUp, ArrowUpRight} from 'lucide-react';

const cards=[
 ['Create an app that recommends which products I need to reorder.',.8,.4],
 ['Create a task tracker for my whole team.',.65,.4],
 ['Create an app that checks returns and cancellation eligibility for orders.',.75,.7],
 ['Create an event prep app that generates discounted checkout links for selected products.',.8,.9],
 ['Create a bulk B2B company importer that uploads companies from a CSV file.',1,1],
] as const;

export default function AppCloud(){
 const root=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(4);
 useEffect(()=>{
  const el=root.current;if(!el)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width: 767px)');
  const fixed=new URLSearchParams(location.search).has('frame');
  const items=Array.from(el.querySelectorAll<HTMLElement>('.app-cloud-card'));
  let raf=0;let point={x:0,y:0};let centers:{x:number;y:number}[]=[];
  const animations:Animation[]=[];
  const reset=()=>items.forEach(e=>{e.style.transform=`scale(${e.dataset.scale})`;e.style.opacity=e.dataset.opacity!;});
  const measure=()=>{centers=items.map(e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})};
  const intro=()=>{
   if(fixed||reduced.matches||mobile.matches){reset();measure();return;}
   items.forEach((e,i)=>{
    const scale=Number(e.dataset.scale),opacity=Number(e.dataset.opacity);
    // Stable stagger preserves the reference range while allowing reproducible captures.
    const a=e.animate([{transform:`scale(${scale*.5})`,opacity:0},{transform:`scale(${scale})`,opacity}],{duration:1000,delay:(i*173)%800,easing:'cubic-bezier(.34,1.56,.64,1)',fill:'backwards'});
    animations.push(a);a.finished.then(measure).catch(()=>{});
   });measure();
  };
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){intro();observer.disconnect()}},{threshold:.1});observer.observe(el);
  const move=(event:PointerEvent)=>{
   if(reduced.matches||mobile.matches||fixed||event.pointerType==='touch')return;
   point={x:event.clientX,y:event.clientY};if(raf)return;
   raf=requestAnimationFrame(()=>{raf=0;const rect=el.getBoundingClientRect();items.forEach((e,i)=>{
    const scale=Number(e.dataset.scale),opacity=Number(e.dataset.opacity);
    if(e.dataset.background){e.style.transform=`translate3d(${-(point.x-rect.x-rect.width/2)/rect.width*15}px,${-(point.y-rect.y-rect.height/2)/rect.height*15}px,0) scale(${scale})`;return;}
    const c=centers[i];if(!c)return;const dx=point.x-c.x,dy=point.y-c.y,d=Math.hypot(dx,dy);
    const weight=Math.max(0,1-(d/300)**2),shift=d?weight*20/d:0;
    e.style.transform=`translate3d(${-dx*shift}px,${-dy*shift}px,0) scale(${scale+(1-scale)*weight})`;
    e.style.opacity=String(opacity+(1-opacity)*weight);
   })});
  };
  const leave=()=>{cancelAnimationFrame(raf);raf=0;reset()};
  el.addEventListener('pointerenter',measure);el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
  window.addEventListener('resize',measure);reduced.addEventListener('change',leave);
  return()=>{observer.disconnect();cancelAnimationFrame(raf);animations.forEach(a=>a.cancel());el.removeEventListener('pointerenter',measure);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);window.removeEventListener('resize',measure);reduced.removeEventListener('change',leave)};
 },[]);
 useEffect(()=>{
  const videos=root.current?.querySelectorAll('video');
  videos?.forEach((v,i)=>{if(i===active&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!new URLSearchParams(location.search).has('frame')){v.play().catch(()=>{})}else{v.pause();v.currentTime=0}});
  const el=root.current;if(!el)return;
  const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)videos?.forEach(v=>v.pause())});observer.observe(el);return()=>observer.disconnect();
 },[active]);
 return <section id="complexity" className="complexity" aria-labelledby="complexity-title">
  <h2 id="complexity-title" className="narrative dropcap">Complexity, delegated</h2>
  <div className="insight-copy"><h3>Custom app generation</h3><p>Get Sidekick to build custom apps designed specifically for your business needs.</p><a className="help" href="https://help.shopify.com/en/manual/shopify-admin/productivity-tools/sidekick/generate-apps">Read help doc <ArrowUpRight size={12}/></a></div>
  <div ref={root} className="app-cloud" aria-label="App ideas">
   <img className="app-cloud-bg" src="/assets/apps/background.png" alt="" loading="lazy"/>
   {[.4,.5].map((scale,i)=><div key={i} aria-hidden="true" className={`app-cloud-card app-cloud-back back-${i}`} data-background="true" data-scale={scale} data-opacity=".4" style={{transform:`scale(${scale})`,opacity:.4}}><div className="app-card-face"/></div>)}
   {cards.map(([text,scale,opacity],i)=><div key={text} tabIndex={0} role="group" aria-label={text} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} className={`app-cloud-card card-${i} ${active===i?'is-active':''}`} data-scale={scale} data-opacity={opacity} style={{'--base-scale':scale,transform:`scale(${scale})`,opacity} as CSSProperties}>
    <img className="app-card-glow" src="/assets/apps/glow.png" alt="" loading="lazy"/>
    <div className="app-card-face"><p>{text}</p><div className="app-card-footer"><span className="app-card-icon"><video src="/assets/apps/icon.mp4" muted loop playsInline preload="metadata" aria-hidden="true"/></span><span className="app-card-arrow" aria-hidden="true"><ArrowUp size={13}/></span></div></div>
   </div>)}
  </div>
 </section>;
}
