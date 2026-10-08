'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {KTX2Loader} from 'three/examples/jsm/loaders/KTX2Loader.js';
import {getProject} from '@theatre/core';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {createSceneNoise} from '../../lib/scene-noise';
import {sceneFragment} from '../../lib/scene-shaders';
import type {MotionState} from '../../lib/motion';
const xyz=(x=0,y=0,z=0)=>({x,y,z});
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
function Renderer({motion,onReady,onFailure}:{motion:MotionState;onReady:()=>void;onFailure:()=>void}){
 const textures=useRef<{noise:THREE.Texture;mud:THREE.Texture}|null>(null);
 const pointer=useRef({x:0,y:0,sx:0,sy:0});
 const {gl,size,invalidate,scene:outputScene,camera:outputCamera}=useThree();const loaded=useRef<any[]>([]);const output=useRef<THREE.ShaderMaterial>(null);const current=useRef(motion);current.current=motion;
 const pipeline=useRef<{composer:EffectComposer;bloom:UnrealBloomPass}|null>(null);
 const uniforms=useMemo(()=>({tCurrent:{value:null},tNext:{value:null},tMudNormal:{value:null as THREE.Texture|null},tNoise:{value:null as THREE.Texture|null},uProgress:{value:0},uAspect:{value:1},uTime:{value:0},uResolution:{value:new THREE.Vector2(1,1)},uMouse:{value:new THREE.Vector2(.5,.5)},uIsHero:{value:1},uIsFallback:{value:0},uProjectionView:{value:new THREE.Matrix4()},uFadeCenterPoint:{value:new THREE.Vector3(-.08,.79,-7.5)},uDarken:{value:0},uPosition:{value:-1},uColor:{value:new THREE.Vector3(220/255,220/255,208/255)}}),[]);
 useEffect(()=>{
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType});
  const composer=new EffectComposer(gl,target),render=new RenderPass(outputScene,outputCamera),bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.55,.4,1),final=new OutputPass();
  composer.addPass(render);composer.addPass(bloom);composer.addPass(final);pipeline.current={composer,bloom};
  const noise=createSceneNoise();uniforms.tNoise.value=noise;
  let disposed=false;const mud=new THREE.TextureLoader().load('/assets/mud-normal.webp',()=>{if(!disposed)invalidate()});mud.wrapS=mud.wrapT=THREE.RepeatWrapping;uniforms.tMudNormal.value=mud;textures.current={noise,mud};
  return()=>{disposed=true;pipeline.current=null;textures.current=null;composer.dispose();bloom.dispose();final.dispose();mud.dispose();noise.dispose()};
 },[gl,outputScene,outputCamera,uniforms,invalidate]);
 useEffect(()=>{pipeline.current?.composer.setSize(size.width,size.height)},[size]);
 useEffect(()=>{invalidate()},[motion,invalidate]);
 useEffect(()=>{
  const move=(e:PointerEvent)=>{if(e.pointerType==='touch'||new URLSearchParams(location.search).has('frame'))return;pointer.current.x=e.clientX/innerWidth*2-1;pointer.current.y=1-e.clientY/innerHeight*2;invalidate()};
  const reset=()=>{pointer.current.x=pointer.current.y=0;invalidate()};
  window.addEventListener('pointermove',move);window.addEventListener('blur',reset);document.documentElement.addEventListener('pointerleave',reset);
  return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('blur',reset);document.documentElement.removeEventListener('pointerleave',reset)};
 },[invalidate]);
 useEffect(()=>{
  let cancelled=false;const draco=new DRACOLoader().setDecoderPath('/decoders/draco/');const ktx=new KTX2Loader().setTranscoderPath('/decoders/basis/').detectSupport(gl);const loader=new GLTFLoader().setDRACOLoader(draco).setKTX2Loader(ktx);
  async function load(name:string){
   const [model,bg,state]=await Promise.all([loader.loadAsync(`/assets/${name}-model.glb`),ktx.loadAsync(`/assets/${name}-background.ktx2`),fetch(`/assets/${name}-theatre.json`).then(r=>r.json())]);
   const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.01,100);scene.add(new THREE.AmbientLight(0xffffff,2));const keyLight=new THREE.DirectionalLight(0xffefcf,4);keyLight.position.set(2,3,5);scene.add(keyLight);
   const group=new THREE.Group();group.add(model.scene);scene.add(group);
   model.scene.traverse(o=>{if(o instanceof THREE.Mesh){const materials=Array.isArray(o.material)?o.material:[o.material];o.material=materials.map(m=>m.map&&!o.name.includes('Armillary')?new THREE.MeshBasicMaterial({map:m.map,transparent:m.transparent,alphaTest:m.alphaTest,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color:m.color,metalness:.65,roughness:.3,side:THREE.DoubleSide}));if(o.material.length===1)o.material=o.material[0];}});
   bg.colorSpace=THREE.SRGBColorSpace;const back=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:bg,side:THREE.DoubleSide}));scene.add(back);
   const sheet=getProject(`Replica-${name}`,{state}).sheet('Scene');
   const cam=sheet.object('camera',{position:xyz(0,0,4),rotation:xyz(),target:xyz(0,0,1),fov:30,gaze:.5});
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
 useFrame(({clock})=>{
  if(loaded.current.length!==2||!output.current)return;
  const p=pointer.current;p.sx+=(p.x-p.sx)*.1;p.sy+=(p.y-p.sy)*.1;
  if(Math.abs(p.x-p.sx)+Math.abs(p.y-p.sy)>.0001)invalidate();
  loaded.current.forEach((x,i)=>{
   x.sheet.sequence.position=i===0?1+current.current.transition*1.6:.6+current.current.sidekick*1.9;
   const c=x.cam.value;x.camera.position.set(c.position.x,c.position.y,c.position.z);x.camera.fov=i===0?c.fov*.88:c.fov;x.camera.aspect=size.width/size.height;x.camera.lookAt(c.target.x+(i===1&&size.width<768?.45:0),c.target.y+(i===0?.35:0),c.target.z);const target=new THREE.Vector3(c.target.x+(i===1&&size.width<768?.45:0),c.target.y+(i===0?.35:0),c.target.z);
   const direction=x.camera.position.clone().sub(target),distance=direction.length();direction.normalize();
   const pan=p.sx*.1*c.gaze,tilt=p.sy*.1*c.gaze;
   const dx=direction.x*Math.cos(-pan)-direction.z*Math.sin(-pan),dz=direction.x*Math.sin(pan)+direction.z*Math.cos(pan);
   direction.set(dx*Math.cos(-tilt),direction.y*Math.cos(-tilt)-Math.sin(-tilt),dz*Math.cos(-tilt)).normalize();
   x.camera.position.copy(target).addScaledVector(direction,distance);x.camera.lookAt(target);x.camera.rotateX(c.rotation.x);x.camera.rotateY(c.rotation.y);x.camera.rotateZ(c.rotation.z);x.camera.updateProjectionMatrix();
   for(const [object,v,cover] of [[x.group,x.asset.value,false],[x.back,x.backdrop.value,true]] as any[]){const f=cover?Math.max(1,size.width/size.height):1;object.position.set(v.position.x*f,v.position.y,v.position.z);object.rotation.set(v.rotation.x,v.rotation.y,v.rotation.z);object.scale.set(v.scale.x*f*(i===0&&!cover?1.15:1),v.scale.y*f,v.scale.z*f);object.visible=v.visibility>.01;}
   for(const a of x.actions){a.action.time=(x.asset.value.animations[a.key]?.progress??0)*a.clip.duration;}x.mixer.update(0);
   const dpr=gl.getPixelRatio();if(x.target.width!==Math.round(size.width*dpr)||x.target.height!==Math.round(size.height*dpr))x.target.setSize(Math.round(size.width*dpr),Math.round(size.height*dpr));
   gl.setRenderTarget(x.target);gl.render(x.scene,x.camera);
  });
  gl.setRenderTarget(null);
  const u=output.current.uniforms;
  // Bind live resources to the actual material, including after React scroll updates.
  if(textures.current){u.tNoise.value=textures.current.noise;u.tMudNormal.value=textures.current.mud;}
  document.documentElement.dataset.shaderTextures=JSON.stringify({noise:u.tNoise.value?.image?.width??0,mud:u.tMudNormal.value?.image?.width??0});
  u.tCurrent.value=loaded.current[0].target.texture;u.tNext.value=loaded.current[1].target.texture;u.uProgress.value=current.current.transition;u.uAspect.value=size.width/size.height;u.uResolution.value.set(size.width,size.height);
  const fixed=new URLSearchParams(location.search).has('frame');u.uTime.value=fixed?0:clock.elapsedTime;u.uMouse.value.set(.5-p.sx*.5,.5+p.sy*.5);
  const heroCamera=loaded.current[0].camera;heroCamera.updateMatrixWorld();u.uProjectionView.value.multiplyMatrices(heroCamera.projectionMatrix,heroCamera.matrixWorldInverse);
  u.uPosition.value=current.current.paper-1;
  if(pipeline.current){pipeline.current.bloom.enabled=current.current.transition>0&&current.current.transition<1;pipeline.current.composer.render();}
  if(!fixed&&((current.current.transition>0&&current.current.transition<1)||(current.current.paper>0&&current.current.paper<1)))invalidate();
 },1);
 return <mesh frustumCulled={false}><planeGeometry args={[2,2]}/><shaderMaterial ref={output} uniforms={uniforms} vertexShader={vertex} fragmentShader={sceneFragment} depthTest={false} depthWrite={false}/></mesh>;
}
export default function SceneStage({motion}:{motion:MotionState}){
 const [active,setActive]=useState(false),[ready,setReady]=useState(false);const onReady=useRef(()=>setReady(true)),onFailure=useRef(()=>setActive(false));
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{const c=document.createElement('canvas');const ctx=c.getContext('webgl2');const enabled=!!ctx&&!media.matches&&!new URLSearchParams(location.search).has('fallback');ctx?.getExtension('WEBGL_lose_context')?.loseContext();setActive(enabled);document.documentElement.dataset.scene=enabled?'loading':'fallback'};update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[]);
 if(!active)return null;
 return <div className="webgl-stage" style={{opacity:ready?1:0}} aria-hidden="true"><Canvas frameloop="demand" dpr={[1,1.5]} gl={{antialias:false,alpha:false,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.NoToneMapping;gl.domElement.addEventListener('webglcontextlost',onFailure.current)}}><Renderer motion={motion} onReady={onReady.current} onFailure={onFailure.current}/></Canvas></div>;
}
