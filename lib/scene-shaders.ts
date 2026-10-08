// Adapted from official Background-CGKUhMwd.js, uI and hI, captured 2026-09-08.
// Wrapper and endpoint handling are local; see motion-audit implementation notes.
export const sceneFragment = `
varying vec2 vUv;
uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform sampler2D tMudNormal;
uniform sampler2D tNoise;
uniform float uProgress;
uniform float uAspect;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uIsHero;
uniform float uIsFallback;
uniform mat4 uProjectionView;
uniform vec3 uFadeCenterPoint;
uniform float uDarken;

// Sample pre-computed noise texture (normalized to [-1, 1])
float sampleNoise(vec2 uv) {
  return texture2D(tNoise, uv).r * 2.0 - 1.0;
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void transitionImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if(uProgress<=0.0){outputColor=texture2D(tCurrent,uv);return;}
  if(uProgress>=1.0){outputColor=texture2D(tNext,uv);return;}
  bool isHero = uIsHero > 0.5;
  bool isFallback = uIsFallback > 0.5;

  // Progress smoothing differs between modes
  float progress = isHero ? smoothstep(0.0, 1.5, uProgress) : uProgress;

  // Project 3D fade center point to screen space (fallback uses fixed center)
  vec2 sceneCenter;
  if (isFallback) {
    sceneCenter = vec2(0.5, 0.65);
  } else {
    vec4 clipPos = uProjectionView * vec4(uFadeCenterPoint, 1.0);
    sceneCenter = (clipPos.xy / clipPos.w) * 0.5 + 0.5;
  }

  // UV transformation (fancy mode has zoom effect centered on 3D scene origin)
  vec2 currentUV = uv;
  vec2 nextUV = uv;
  if (isHero) {
    currentUV = (uv - sceneCenter) * (1.0 - smoothstep(0.2, 1.0, uProgress) * 0.1) + sceneCenter;
    nextUV = (uv - sceneCenter) * (1.0 + smoothstep(0.8, 0.0, uProgress) * 0.1) + sceneCenter;
  } else {
    if (isFallback) {
      currentUV.y -= easeInOutCubic(uProgress) * 0.1;
      nextUV.y += easeInOutCubic(1.0-uProgress) * 0.1;
    }
  }

  vec4 current = texture2D(tCurrent, currentUV);
  vec4 next = texture2D(tNext, nextUV);

  // Edge detection using hardware derivatives (fwidth) - only compute during transitions
  vec3 currentEdges = vec3(0.0);
  vec3 nextEdges = vec3(0.0);
  if (uProgress > 0.01 && uProgress < 0.99 || uDarken > 0.001) {
    float currentLuma = dot(current.rgb, vec3(0.299, 0.587, 0.114));
    currentEdges = vec3(fwidth(currentLuma) * mix(5.0, 10.0, progress));
    float nextLuma = dot(next.rgb, vec3(0.299, 0.587, 0.114));
    nextEdges = vec3(fwidth(nextLuma) * mix(5.0, 10.0, 1.0 - progress));
  }

  // Mud normal offset
  vec3 mudNormal = texture2D(tMudNormal, uv * 2.0).rgb;
  float mudStrength = isHero ? mix(0.2, 0.4, 0.5 + 0.5 * sin(uTime - uv.x * 10.0))
                              : mix(0.3, 0.6, 0.5 + 0.5 * sin(uTime - uv.x * 10.0));
  float mudOffset = (mudNormal.r - 0.5) * mudStrength;

  // Noise (sampled from pre-computed texture)
  vec2 aspectUv = vec2(uv.x * uAspect, uv.y) + vec2(0.0, uTime * 0.02);
  float noiseSpeed = isHero ? 0.07 : 0.05;
  float currentNoise = sampleNoise(aspectUv * 0.25 - uTime * noiseSpeed * 0.125);

  // Mask center (hero uses 3D scene center with mouse influence)
  vec2 maskCenter = isHero ? mix(sceneCenter, uMouse, 0.1) : vec2(0.5);

  // Threshold calculation
  float threshold;
  if (isHero) {
    // Aspect-correct the distance for circular (not oval) reveal
    float dist = length((uv - maskCenter) * vec2(uAspect, 1.0)) * 0.8;
    threshold = mix(dist, uv.x, smoothstep(0.6, -0.4, abs(uv.x-sceneCenter.x)) * mix(0.0, 0.4, smoothstep(0.05, 0.5, progress)));
    threshold = mix(threshold, 0.0, smoothstep(0.9, 1.0, uProgress));
  } else {
    float ease = mix(progress * progress * (3.0 - 2.0 * progress), progress, 0.25);
    threshold = mix(uv.y, uv.x, smoothstep(0.6, -0.4, abs(uv.x-0.5)) * 0.5);
    progress = ease; // Use eased progress for simple mode
  }
  threshold = threshold * 2.0 - 1.0;
  threshold = threshold / 1.2 + currentNoise * 0.2 + mudOffset;
  threshold = threshold * 0.5 + 0.5;

  float edge = progress - threshold;
  float aa = fwidth(edge) * 10.0;
  float blendFactor = smoothstep(-aa, aa, edge);

  // Edge mixing
  current = mix(current, vec4(currentEdges, 1.0), smoothstep(0.0, 0.5, progress));
  next = mix(next, vec4(nextEdges, 1.0), smoothstep(0.2, 0.8, 1.0 - progress));

  if (uDarken > 0.001) {
    current = mix(current, vec4(0.02 * uDarken + currentEdges * 0.1, 1.0), uDarken);
  }

  outputColor = mix(current, next, blendFactor);

  // Glow effect
  float glowStrength = isHero ? mix(40.0, 8.0, smoothstep(0.05, 0.25, progress)) : mix(2.0, 10.0, 0.5);
  float glowThreshold = isHero ? glowStrength * 0.001 : 0.003;
  float glowFactor = smoothstep(0.0, glowThreshold, abs(edge));
  float glowMult = isHero ? mix(glowStrength * 0.5, glowStrength, 0.5 + 0.5 * currentNoise * sin(uTime + uv.x * 10.0))
                          : mix(2.0, 10.0, 0.5 + 0.5 * currentNoise * sin(uTime + uv.x * 10.0));
  outputColor = mix(outputColor, outputColor * glowMult, 1.0 - glowFactor);
}




uniform float uPosition; // -1 = fully out, 0 = fully covering, 1 = fully out (other side)

uniform vec3 uColor;


// Sample pre-computed noise texture (normalized to [-1, 1])
void paperImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  // Early out if overlay is fully off-screen (|position| >= 1)
  if (abs(uPosition) >= 1.0) {
    outputColor = inputColor;
    return;
  }

  // Mud texture for organic variation
  vec3 mudNormal = texture2D(tMudNormal, uv * 2.0).rgb;
  float mudOffset = (mudNormal.r - 0.5) * mix(0.3, 0.6, 0.5 + 0.5 * sin(uTime - uv.x * 10.0)) * 0.1;

  // Noise (sampled from pre-computed texture)
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUv = vec2(uv.x * aspect, uv.y) + vec2(0.0, uTime * 0.02);
  float noiseValue = sampleNoise(aspectUv * 0.375 - uTime * 0.00625);

  // Diagonal/curved wipe pattern
  float threshold = mix(uv.y, uv.x, smoothstep(0.6, -0.4, abs(uv.x - 0.4)) * 0.5);
  threshold = threshold * 2.0 - 1.0;
  threshold = threshold / 1.2 + noiseValue * 0.2 + mudOffset;
  threshold = threshold * 0.5 + 0.5;

  // Map position from -1 to 1 range:
  // -1 = wipe coming in (progress 0), 0 = fully visible (progress 1), 1 = wipe going out (progress 0 reversed)
  float progress;
  float thresholdFinal = threshold;
  if (uPosition <= 0.0) {
    // -1 to 0: wipe in (progress goes from 0 to 1)
    progress = uPosition + 1.0;
  } else {
    // 0 to 1: wipe out (progress goes from 1 to 0, with reversed threshold)
    progress = 1.0 - uPosition;
    thresholdFinal = 1.0 - threshold;
  }

  // Sharp edge transition
  float edge = progress - thresholdFinal;
  float aa = fwidth(edge) * 10.0;
  float alpha = smoothstep(-aa, aa, edge);

  // Glow at edge
  float glowFactor = smoothstep(0.0, 0.005, abs(edge));
  vec3 color = pow(uColor, vec3(2.2));
  color = mix(color, color * mix(2.0, 4.0, 0.5 + 0.5 * sin(uTime + uv.x * 10.0)), 1.0 - glowFactor);

  outputColor = vec4(mix(inputColor.rgb, color, alpha), 1.0);
}


void main(){vec4 scene;transitionImage(vec4(0.),vUv,scene);paperImage(scene,vUv,gl_FragColor);}
`;
