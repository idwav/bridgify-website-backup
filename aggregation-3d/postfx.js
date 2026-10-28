export function installPostFX({T,target,brightMat,blurMat,finalMat,camera}){
 const diffusionA=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType});
 const diffusionB=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType});
 const diffusionMat=new T.ShaderMaterial({vertexShader:blurMat.vertexShader,uniforms:{map:{value:null},direction:{value:new T.Vector2()}},fragmentShader:`uniform sampler2D map;uniform vec2 direction;varying vec2 vUv;void main(){vec3 c=vec3(0.);float total=0.;for(int i=-16;i<=16;i++){float x=float(i);float w=exp(-x*x/72.);c+=texture2D(map,vUv+direction*x).rgb*w;total+=w;}gl_FragColor=vec4(c/total,1.);}`});
 Object.assign(finalMat.uniforms,{diffusionMap:{value:diffusionA.texture},diffusionAmount:{value:0}});
 finalMat.fragmentShader='uniform sampler2D diffusionMap;uniform float diffusionAmount;\n'+finalMat.fragmentShader.replace(')*exposure;', '+texture2D(diffusionMap,vUv).rgb*diffusionAmount)*exposure;');
 let state;target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);target.depthTexture.format=T.DepthFormat;
 brightMat.uniforms.threshold={value:1};brightMat.uniforms.knee={value:.5};
 brightMat.fragmentShader='uniform float threshold;uniform float knee;\n'+brightMat.fragmentShader.replace('clamp(b-.5,0.,1.)','clamp(b-threshold+knee,0.,2.*knee)').replace('max(b-1.,knee*knee*.25)','max(b-threshold,knee*knee*.25)');
 // Avoid shadowing the uniform name in the prefilter's local variable.
 brightMat.fragmentShader=brightMat.fragmentShader.replace('uniform float knee;','uniform float softKnee;').replace('float knee=clamp(b-threshold+knee,0.,2.*knee);','float knee=clamp(b-threshold+softKnee,0.,2.*softKnee);').replace('knee*knee*.25','knee*knee*.25/max(2.*softKnee,.0001)');brightMat.uniforms.softKnee=brightMat.uniforms.knee;brightMat.needsUpdate=true;
 blurMat.uniforms.radius={value:1};blurMat.fragmentShader='uniform float radius;\n'+blurMat.fragmentShader.replace('direction*float(i)','direction*float(i)*radius');blurMat.needsUpdate=true;
 Object.assign(finalMat.uniforms,{depthMap:{value:target.depthTexture},resolution:{value:new T.Vector2()},gaussianBlur:{value:0},grain:{value:0},grainSize:{value:1},depthAmount:{value:0},focusDistance:{value:17},focusRange:{value:3},cameraNear:{value:camera.near},cameraFar:{value:camera.far},vignette:{value:0}});
 const helpers=`
uniform sampler2D depthMap;
uniform vec2 resolution;
uniform float gaussianBlur,grain,grainSize,depthAmount,focusDistance,focusRange,cameraNear,cameraFar,vignette;
float noiseHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 sceneSample(vec2 uv){
 float depth=mix(cameraNear,cameraFar,texture2D(depthMap,uv).r);
 float coc=depthAmount*smoothstep(focusRange*.25,focusRange,abs(depth-focusDistance));
 float radius=max(gaussianBlur,coc);
 if(radius<.01)return texture2D(map,uv).rgb;
 vec3 result=vec3(0.);float weights=0.;
 for(int x=-3;x<=3;x++){for(int y=-3;y<=3;y++){
  vec2 offset=vec2(float(x),float(y));float w=exp(-dot(offset,offset)/4.);
  result+=texture2D(map,uv+offset*radius/resolution).rgb*w;weights+=w;
 }}return result/weights;
}
`;
 // Helpers must follow the map uniform declaration.
 finalMat.fragmentShader=finalMat.fragmentShader.replace('varying vec2 vUv;', 'varying vec2 vUv;\n'+helpers).replace('texture2D(map,vUv).rgb+texture2D(bloom,vUv).rgb*strength','sceneSample(vUv)+texture2D(bloom,vUv).rgb*strength').replace('gl_FragColor=vec4(c,1.);','float edge=smoothstep(.2,.75,length(vUv-.5));c*=1.-edge*vignette*.7;float n=noiseHash(floor(vUv*resolution/max(grainSize,.1)))-.5;c=clamp(c+n*grain,0.,1.);gl_FragColor=vec4(c,1.);');finalMat.needsUpdate=true;
 return{setState(s){state=s},renderDiffusion(pass,source){if(!state||state.diffusionAmount<=0)return;const w=Math.max(1,Math.ceil(target.width/4)),h=Math.max(1,Math.ceil(target.height/4));if(diffusionA.width!==w||diffusionA.height!==h){diffusionA.setSize(w,h);diffusionB.setSize(w,h);}diffusionMat.uniforms.map.value=source;diffusionMat.uniforms.direction.value.set(state.diffusionSpread/target.width/6,0);pass(diffusionMat,diffusionB);diffusionMat.uniforms.map.value=diffusionB.texture;diffusionMat.uniforms.direction.value.set(0,state.diffusionSpread/target.height/6);pass(diffusionMat,diffusionA);},update(){if(!state)return;finalMat.uniforms.diffusionAmount.value=state.diffusionAmount;brightMat.uniforms.threshold.value=state.bloomThreshold;brightMat.uniforms.softKnee.value=state.bloomKnee;blurMat.uniforms.radius.value=state.bloomRadius;for(const key of['gaussianBlur','grain','grainSize','depthAmount','focusDistance','focusRange','vignette'])finalMat.uniforms[key].value=state[key];finalMat.uniforms.resolution.value.set(target.width,target.height);}};
}
