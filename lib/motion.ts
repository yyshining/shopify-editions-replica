export const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
export type MotionState={scroll:number;transition:number;rail:number;sidekick:number;paper:number;theme:'light'|'dark'};
export function getMotion(scroll:number,height:number,mobile=false):MotionState{
 const s=Math.max(0,scroll)/Math.max(1,height);
 return {scroll:s,transition:clamp((s-.65)/.8),rail:clamp((s-.1)/.55),sidekick:clamp((s-1.45)/1.75),paper:clamp((s-(mobile?2.5:2.8))/.55),theme:s>(mobile?2.85:3.1)?'light':'dark'};
}
export function chooseQuality(webgl:boolean,reduced:boolean,mobile:boolean){return !webgl||reduced?'static':mobile?'mobile':'full'}
