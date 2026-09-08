'use client';
import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {KTX2Loader} from 'three/examples/jsm/loaders/KTX2Loader.js';
import {getProject} from '@theatre/core';
import type {MotionState} from '../../lib/motion';
const xyz=(x=0,y=0,z=0)=>({x,y,z});
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const fragment=`uniform sampler2D a;uniform sampler2D b;uniform float progress;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){float edge=length((vUv-vec2(.54,.49))*vec2(1.,.8))+noise(vUv*13.)*.08;float m=1.-smoothstep(progress*.95-.06,progress*.95+.06,edge);if(progress<=0.)m=0.;if(progress>=1.)m=1.;gl_FragColor=mix(texture2D(a,vUv),texture2D(b,vUv),m);#include <colorspace_fragment>}`;
function Renderer({motion,onReady,onFailure}:{motion:MotionState;onReady:()=>void;onFailure:()=>void}){
 const {gl,size,invalidate}=useThree();const loaded=useRef<any[]>([]);const output=useRef<THREE.ShaderMaterial>(null);const current=useRef(motion);current.current=motion;
 useEffect(()=>{invalidate()},[motion,invalidate]);
 useEffect(()=>{
  let cancelled=false;const draco=new DRACOLoader().setDecoderPath('/decoders/draco/');const ktx=new KTX2Loader().setTranscoderPath('/decoders/basis/').detectSupport(gl);const loader=new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx);
  async function load(name:string){
   const [model,bg,state]=await Promise.all([loader.loadAsync(`/assets/${name}-model.glb`),ktx.loadAsync(`/assets/${name}-background.ktx2`),fetch(`/assets/${name}-theatre.json`).then(r=>r.json())]);
   const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.01,100);scene.add(new THREE.AmbientLight(0xffffff,2));const keyLight=new THREE.DirectionalLight(0xffefcf,4);keyLight.position.set(2,3,5);scene.add(keyLight);
   const group=new THREE.Group();group.add(model.scene);scene.add(group);
   model.scene.traverse(o=>{if(o instanceof THREE.Mesh){const materials=Array.isArray(o.material)?o.material:[o.material];o.material=materials.map(m=>m.map&&!o.name.includes('Armillary')?new THREE.MeshBasicMaterial({map:m.map,transparent:m.transparent,alphaTest:m.alphaTest,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color:m.color,metalness:.65,roughness:.3,side:THREE.DoubleSide}));if(o.material.length===1)o.material=o.material[0];}});
   bg.colorSpace=THREE.SRGBColorSpace;const back=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:bg,side:THREE.DoubleSide}));scene.add(back);
   const sheet=getProject(`Replica-${name}`,{state}).sheet('Scene');
   const cam=sheet.object('camera',{position:xyz(0,0,4),rotation:xyz(),target:xyz(0,0,1),fov:30});
   const mixer=new THREE.AnimationMixer(model.scene);const animations:Record<string,{progress:number;loop:boolean}>={};
   const actions=model.animations.map(clip=>{const action=mixer.clipAction(clip);action.play();action.paused=true;const key=clip.name.replace(/[^a-zA-Z0-9_]/g,'_');animations[key]={progress:0,loop:false};return {action,clip,key}});
   const asset=sheet.object('asset-1',{position:xyz(),rotation:xyz(),scale:xyz(1,1,1),visibility:1,animations});
   const backdrop=sheet.object('asset-2',{position:xyz(),rotation:xyz(),scale:xyz(1,1,1),visibility:1});
   const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
   return {scene,camera,group,back,sheet,cam,asset,backdrop,mixer,actions,target};
  }
  Promise.all([load('hero'),load('sidekick')]).then(items=>{if(cancelled){items.forEach(x=>x.target.dispose());return}loaded.current=items;document.documentElement.dataset.scene='models-ready';invalidate();onReady()}).catch(e=>{console.error('Scene loading failed',e);document.documentElement.dataset.scene='fallback';onFailure()});
  return()=>{cancelled=true;for(const x of loaded.current){x.target.dispose();x.mixer.stopAllAction();x.scene.traverse((o:any)=>{o.geometry?.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach((m:any)=>{m?.map?.dispose();m?.dispose()})})}loaded.current=[];draco.dispose();ktx.dispose()};
 },[gl,invalidate,onReady,onFailure]);
 useFrame(()=>{
  if(loaded.current.length!==2||!output.current)return;
  loaded.current.forEach((x,i)=>{
   x.sheet.sequence.position=i===0?1+current.current.transition*1.6:.6+current.current.sidekick*1.9;
   const c=x.cam.value;x.camera.position.set(c.position.x,c.position.y,c.position.z);x.camera.fov=i===0?c.fov*.88:c.fov;x.camera.aspect=size.width/size.height;x.camera.lookAt(c.target.x+(i===1&&size.width<768?.45:0),c.target.y+(i===0?.35:0),c.target.z);x.camera.rotateZ(c.rotation.z);x.camera.updateProjectionMatrix();
   for(const [object,v,cover] of [[x.group,x.asset.value,false],[x.back,x.backdrop.value,true]] as any[]){const f=cover?Math.max(1,size.width/size.height):1;object.position.set(v.position.x*f,v.position.y,v.position.z);object.rotation.set(v.rotation.x,v.rotation.y,v.rotation.z);object.scale.set(v.scale.x*f*(i===0&&!cover?1.15:1),v.scale.y*f,v.scale.z*f);object.visible=v.visibility>.01;}
   for(const a of x.actions){a.action.time=(x.asset.value.animations[a.key]?.progress??0)*a.clip.duration;}x.mixer.update(0);
   const dpr=gl.getPixelRatio();if(x.target.width!==Math.round(size.width*dpr)||x.target.height!==Math.round(size.height*dpr))x.target.setSize(Math.round(size.width*dpr),Math.round(size.height*dpr));
   gl.setRenderTarget(x.target);gl.render(x.scene,x.camera);
  });
  gl.setRenderTarget(null);output.current.uniforms.a.value=loaded.current[0].target.texture;output.current.uniforms.b.value=loaded.current[1].target.texture;output.current.uniforms.progress.value=current.current.transition;
 });
 return <mesh frustumCulled={false}><planeGeometry args={[2,2]}/><shaderMaterial ref={output} uniforms={{a:{value:null},b:{value:null},progress:{value:0}}} vertexShader={vertex} fragmentShader={fragment.replace(';#include',';\n#include')} depthTest={false} depthWrite={false}/></mesh>;
}
export default function SceneStage({motion}:{motion:MotionState}){
 const [active,setActive]=useState(false),[ready,setReady]=useState(false);const onReady=useRef(()=>setReady(true)),onFailure=useRef(()=>setActive(false));
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{const c=document.createElement('canvas');const ctx=c.getContext('webgl2');const enabled=!!ctx&&!media.matches&&!new URLSearchParams(location.search).has('fallback');ctx?.getExtension('WEBGL_lose_context')?.loseContext();setActive(enabled);document.documentElement.dataset.scene=enabled?'loading':'fallback'};update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 if(!active)return null;
 return <div className="webgl-stage" style={{opacity:ready?1:0}} aria-hidden="true"><Canvas frameloop="demand" dpr={[1,1.5]} gl={{antialias:false,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.NoToneMapping;gl.domElement.addEventListener('webglcontextlost',onFailure.current)}}><Renderer motion={motion} onReady={onReady.current} onFailure={onFailure.current}/></Canvas></div>;
}
