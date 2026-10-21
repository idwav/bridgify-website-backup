(()=>{
 const host=document.querySelector('#home'),T=window.THREE;if(!host||!T)return;
 let renderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})}catch{return}
 const canvas=renderer.domElement;canvas.className='hero-three-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(),globe=new T.Group();scene.add(globe);camera.position.z=3000;camera.near=1;camera.far=6000;
 const sphere=new T.SphereGeometry(1,96,64);
 const surface=new T.Mesh(sphere,new T.MeshPhongMaterial({color:0x130b09,specular:0x7c3020,shininess:14}));globe.add(surface);
 const light=new T.DirectionalLight(0xff7845,3);light.position.set(-900,1000,800);scene.add(light,new T.AmbientLight(0x4a1b12,.8));
 const network=new T.Group();globe.add(network);
 const ico=new T.IcosahedronGeometry(1.005,12),wire=new T.LineSegments(new T.WireframeGeometry(ico),new T.LineBasicMaterial({color:0xc46a3d,transparent:true,opacity:.38}));network.add(wire);
 const dots=new T.Points(ico,new T.PointsMaterial({color:0xffb380,size:2.5,sizeAttenuation:false,transparent:true,opacity:.8}));network.add(dots);
 const rim=new T.Mesh(new T.SphereGeometry(1.007,96,64),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{intensity:{value:1}},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;uniform float intensity;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),7.);gl_FragColor=vec4(vec3(1.,.3,.09)*intensity,f*.95);}' }));globe.add(rim);
 const haze=new T.Mesh(new T.SphereGeometry(1.014,96,64),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.BackSide,vertexShader:'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 n;void main(){float a=pow(max(0.,1.-abs(n.z)),5.);gl_FragColor=vec4(1.,.2,.035,a*.07);}' }));globe.add(haze);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let visible=true,raf=0,last=0,elapsed=0;
 function resize(){const {width:w,height:h}=host.getBoundingClientRect();renderer.setSize(w,h,false);camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();const mobile=w<700,r=mobile?w*1.25:Math.max(h*.9,w*.54);globe.scale.setScalar(r);globe.position.set(mobile?w*.62:w*.58,-h*.53,0);render();}
 function render(){network.rotation.y=elapsed*.000035;network.rotation.z=.23;rim.material.uniforms.intensity.value=1+.1*Math.sin(elapsed*.0005);renderer.render(scene,camera);host.classList.add('hero-three-ready')}
 function tick(t){raf=0;if(!visible||document.hidden||host.classList.contains('paused')||reduced.matches){last=0;return}if(last)elapsed+=Math.min(t-last,60);last=t;render();raf=requestAnimationFrame(tick)}
 function start(){if(!raf)raf=requestAnimationFrame(tick)}
 new ResizeObserver(resize).observe(host);new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0;last=0}}).observe(host);
 document.addEventListener('visibilitychange',start);document.querySelector('#motion')?.addEventListener('click',()=>requestAnimationFrame(start));reduced.addEventListener('change',()=>{render();start()});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);host.classList.remove('hero-three-ready')});canvas.addEventListener('webglcontextrestored',()=>{resize();start()});resize();start();
})();
