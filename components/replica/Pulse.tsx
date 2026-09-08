'use client';
import {useEffect,useRef,useState} from 'react';
import {useRive,Layout,Fit,Alignment} from '@rive-app/react-canvas';
import assets from '../../docs/rive-assets-manifest.json';
export default function Pulse(){
 const pending=useRef<Promise<void>[]>([]);
 const holder=useRef<HTMLDivElement>(null);const [loaded,setLoaded]=useState(false);
 const {rive,RiveComponent}=useRive({src:'/assets/pulse.riv',artboard:'digestMain',stateMachines:'State Machine 1',autoplay:false,layout:new Layout({fit:Fit.Contain,alignment:Alignment.Center}),assetLoader:(asset,bytes)=>{if(bytes.length)return false;const match=assets.find(x=>x.id.toLowerCase()===asset.name.toLowerCase().replace(/\.(png|webp|ttf)$/,''));if(!match){console.warn('Unmapped Rive asset',asset.name);return false}const job=fetch(match.path).then(r=>{if(!r.ok)throw new Error(match.path);return r.arrayBuffer()}).then(b=>asset.decode(new Uint8Array(b)));pending.current.push(job);return true},onLoad:()=>{Promise.all(pending.current).then(()=>setLoaded(true)).catch(()=>setLoaded(false))}});
 useEffect(()=>{if(!rive)return;
 const observer=new IntersectionObserver(([entry])=>{const freeze=new URLSearchParams(location.search).has('frame')||matchMedia('(prefers-reduced-motion: reduce)').matches;if(entry.isIntersecting&&!freeze)rive.play();else rive.pause()});if(holder.current)observer.observe(holder.current);return()=>observer.disconnect()},[rive]);
 return <div ref={holder} className="pulse" role="img" aria-label="Sidekick Pulse recommendations"><img src="/assets/pulse-desktop.webp" alt=""/><div className="rive-layer" style={{opacity:loaded?1:0}}><RiveComponent/></div></div>;
}
