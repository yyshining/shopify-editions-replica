"use client";
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import AppCloud from '../components/replica/AppCloud';
import Diagnostics from '../components/replica/Diagnostics';
import { ArrowUpRight, Search, Menu, X, Play, ChevronDown, ArrowDown } from 'lucide-react';
import { getMotion, type MotionState } from '../lib/motion';
const SceneStage=lazy(()=>import('../components/replica/SceneStage'));
const Pulse=lazy(()=>import('../components/replica/Pulse'));
const chapters=['Sidekick','Agentic','Online','Retail','Marketing','Checkout','Operations','Shop app','B2B','Finance','Shipping','Developer'];
const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const original='https://www.shopify.com/editions/winter2026';
const hrefFor=(name:string)=>name==='Sidekick'?'#sidekick':original+'#'+name.toLowerCase().replace(' ','-');
function EditionTitle(){return <>The<br/><em>Renaissance</em><br/>Edition</>}
export default function Home(){
 const [state,setState]=useState<MotionState>(getMotion(0,720));
 const [menu,setMenu]=useState(false),[search,setSearch]=useState(false),[video,setVideo]=useState(false),[editions,setEditions]=useState(false),[query,setQuery]=useState('');
 const lenis=useRef<Lenis|null>(null);const searchInput=useRef<HTMLInputElement>(null);const dialog=useRef<HTMLDialogElement>(null);const closeRef=useRef<HTMLButtonElement>(null);const priorFocus=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  const params=new URLSearchParams(location.search), fixed=params.has('frame')?Number(params.get('frame')):null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.dataset.capture=fixed!==null?'true':'false';
  const scroll=new Lenis({autoRaf:false,lerp:0.085,smoothWheel:!motion.matches});lenis.current=scroll;
  let raf=0;
  const update=()=>{const s=getMotion(fixed!==null?fixed*innerHeight:window.scrollY,innerHeight,innerWidth<768);setState(s);document.documentElement.dataset.theme=s.theme;};
  const tick=(time:number)=>{scroll.raf(time);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);
  scroll.on('scroll',update);window.addEventListener('resize',update);update();
  if(fixed!==null)scroll.scrollTo(fixed*innerHeight,{immediate:true});
  const anchor=()=>{if(location.hash==='#sidekick')scroll.scrollTo(document.querySelector('#sidekick') as HTMLElement,{immediate:fixed!==null});if(location.hash==='#insights')scroll.scrollTo(document.querySelector('#insights') as HTMLElement,{immediate:fixed!==null});};
  window.addEventListener('hashchange',anchor);if(fixed===null)anchor();
  return()=>{cancelAnimationFrame(raf);scroll.destroy();window.removeEventListener('resize',update);window.removeEventListener('hashchange',anchor)};
 },[]);
 useEffect(()=>{const open=menu||search||video;if(open){priorFocus.current=document.activeElement as HTMLElement;dialog.current?.showModal();lenis.current?.stop();if(search)searchInput.current?.focus();else closeRef.current?.focus();}else{dialog.current?.close();lenis.current?.start();priorFocus.current?.focus()}},[menu,search,video]);
 const close=()=>{setMenu(false);setSearch(false);setVideo(false)};
 const top=()=>{lenis.current?.scrollTo(0);history.replaceState(null,'',location.pathname+location.search)};
 return <>
  <Diagnostics/>
  <a className="skip" href="#insights">Skip to content</a>
  <div className="scene-fallback" aria-hidden="true">
   <picture><source media="(max-width: 767px)" srcSet="/assets/hero-mobile.jpg"/><img src="/assets/hero-desktop.jpg" alt=""/></picture>
   <picture style={{opacity:state.transition}}><source media="(max-width: 767px)" srcSet="/assets/sidekick-mobile.jpg"/><img src="/assets/sidekick-desktop.jpg" alt=""/></picture>
   <div className="scene-shade"/>
  </div>
  <Suspense fallback={null}><SceneStage motion={state}/></Suspense>
  <header className="topbar">
   <button className="brand" onClick={top} aria-label="Shopify Editions Winter '26, back to top"><span className="bag" aria-hidden="true">S</span><span>Shopify Editions <span className="season">Winter ’26</span></span></button>
   <div className="desktop-nav"><div className="editions-wrap"><button onClick={()=>setEditions(!editions)} aria-expanded={editions}>Editions <ChevronDown size={13}/></button>{editions&&<div className="editions-pop"><a href={original}>Winter ’26 · Renaissance</a><a href="https://www.shopify.com/editions">View all Editions <ArrowUpRight size={14}/></a></div>}</div><button onClick={()=>setSearch(true)}>Search <Search size={14}/></button></div>
   <div className="top-right"><a className="shopify-link" href="https://www.shopify.com">Shopify.com</a><a className="start" href="https://www.shopify.com/free-trial">Start for free</a><button className="mobile-menu" onClick={()=>{setQuery('');setMenu(true)}} aria-label="Open menu"><Menu/></button></div>
  </header>
  <aside className="side-rail" style={{opacity:state.rail}} aria-hidden={state.rail<0.1} inert={state.rail<0.1}>
   <button className="edition-small" onClick={top}><EditionTitle/></button>
   <nav aria-label="Chapters">{chapters.map((c,i)=><a key={c} className={c==='Sidekick'?'active':''} href={hrefFor(c)}><span>{c}</span><i/><small>{roman[i]}</small></a>)}</nav>
   <div className="legal">© Shopify Inc<br/><a href="https://www.shopify.com/legal/terms">Terms of Service</a><br/><a href="https://www.shopify.com/legal/privacy">Privacy Policy</a></div>
  </aside>
  <main>
   <section className="hero" aria-label="The Renaissance Edition">
    <div className="hero-frame" style={{opacity:1-state.rail,transform:`translate(-50%,-50%) scale(${1-state.transition*.06})`}}>
     <h1><EditionTitle/></h1>
     <div className="hero-bottom"><p>A new world of commerce.<br/>150+ product updates.</p><nav aria-label="Edition contents">{chapters.map((c,i)=><a href={hrefFor(c)} key={c}><span>{c}</span><small>{roman[i]}</small></a>)}</nav></div>
    </div>
    <a href="#sidekick" className="scroll-cue" style={{opacity:1-state.rail}} aria-label="Explore Sidekick"><ArrowDown size={16}/></a>
   </section>
   <section id="sidekick" className="sidekick-intro">
    <div className="story"><h2>Sidekick</h2><p className="narrative dropcap">The AI-powered Shopify expert who's just as obsessed with your business as you are.</p><button className="video-poster" onClick={()=>setVideo(true)} aria-label="Play Sidekick introduction video"><img src="/assets/sidekick-video-poster.png" alt="A merchant using Sidekick at a laptop"/><span><Play fill="currentColor" size={28}/></span></button></div>
   </section>
   <section id="insights" className="paper">
    <div className="paper-body"><h2 className="narrative dropcap">Insights, proactively delivered</h2><div className="insight-copy"><h3>Smart suggestions</h3><p>Sidekick Pulse delivers personalized recommendations and next steps for your business using market trends and data from your store.</p><a className="help" href="https://help.shopify.com/en/manual/shopify-admin/productivity-tools/sidekick/help-and-guidance#pulse" target="_blank" rel="noreferrer">Read help doc <ArrowUpRight size={12}/></a></div>
    <Suspense fallback={<div className="pulse"><img src="/assets/pulse-desktop.webp" alt="Sidekick Pulse recommendations"/></div>}><Pulse/></Suspense>
    <AppCloud/>
    <div className="sample-end"><a href={original+'#sidekick'}>Explore more Sidekick updates <ArrowUpRight size={16}/></a><button onClick={top}>Back to navigation <ArrowUpRight size={16}/></button></div></div>
   </section>
  </main>
  <dialog aria-label={video?"Sidekick video":search?"Search Editions":"Edition menu"} ref={dialog} onCancel={close} onClick={e=>{if(e.target===dialog.current)close()}} className={video?'overlay video-dialog':'overlay'}>
   <button ref={closeRef} className="close-dialog" onClick={close} aria-label="Close"><X/></button>
   {video?<video src="/assets/sidekick-intro.mp4" controls autoPlay playsInline poster="/assets/sidekick-video-poster.png"/>:<div className="dialog-body"><h2>{search?'Search Editions':'The Renaissance Edition'}</h2>{search&&<input ref={searchInput} placeholder="Search updates" aria-label="Search updates" value={query} onChange={e=>setQuery(e.target.value)}/>}<nav>{chapters.filter(c=>c.toLowerCase().includes(query.toLowerCase())).map((c,i)=><a key={c} href={hrefFor(c)} onClick={close}><span>{c}</span><small>{roman[chapters.indexOf(c)]}</small><ArrowUpRight size={18}/></a>)}{search&&/pulse|insight|smart/i.test(query)&&<a href="#insights" onClick={close}>Smart suggestions <ArrowUpRight size={18}/></a>}{search&&query&&!chapters.some(c=>c.toLowerCase().includes(query.toLowerCase()))&&!/pulse|insight|smart/i.test(query)&&<p>No matching updates. Try “Sidekick” or “Pulse”.</p>}</nav></div>}
  </dialog>
 </>;
}
