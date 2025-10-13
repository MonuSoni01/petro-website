/* ============= Lights Setup ============= */
const container = document.getElementById("petroLightStrip");
function makeLights(){
  container.innerHTML="";
  const count = Math.floor(window.innerWidth / 50);
  for(let i=0;i<count;i++){
    const bulb=document.createElement("div");
    bulb.className="petro-light";
    bulb.style.animationDelay=(Math.random()*2).toFixed(2)+"s";
    container.appendChild(bulb);
  }
}
makeLights();
window.addEventListener("resize", makeLights);

/* ============= Auto Hide on Scroll ============= */
let lastScroll = 0;
const lights = document.getElementById("petroLights");
window.addEventListener("scroll", ()=>{
  const current = window.scrollY;
  if(current > lastScroll && current > 10){
    lights.classList.add("hide");
  } else {
    lights.classList.remove("hide");
  }
  lastScroll = current;
});

/* ============= Small Crackers ============= */
const canvas=document.getElementById("petroSparkCanvas");
const ctx=canvas.getContext("2d");
let W=canvas.width=window.innerWidth;
let H=canvas.height=window.innerHeight;
window.addEventListener("resize",()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;});

const COLORS=["#FFD43B","#108082","#FF4D4D","#00FFF5","#ffffff"];
let sparks=[];
function createSpark(x,y){
  for(let i=0;i<12;i++){
    const ang=Math.random()*Math.PI*2;
    const spd=Math.random()*2+0.5;
    sparks.push({
      x:x+Math.random()*8-4,
      y:y+Math.random()*8-4,
      vx:Math.cos(ang)*spd,
      vy:Math.sin(ang)*spd,
      life:1,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      size:Math.random()*2+1
    });
  }
}
function animateSparks(){
  ctx.clearRect(0,0,W,H);
  for(let i=sparks.length-1;i>=0;i--){
    const s=sparks[i];
    s.x+=s.vx;
    s.y+=s.vy;
    s.vy+=0.08;
    s.life-=0.02;
    if(s.life<=0){sparks.splice(i,1);continue;}
    ctx.globalAlpha=s.life;
    ctx.fillStyle=s.color;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
  requestAnimationFrame(animateSparks);
}
animateSparks();

/* ============= Rockets ============= */
const rCanvas=document.getElementById("petroRocketCanvas");
const rctx=rCanvas.getContext("2d");
rCanvas.width=W; rCanvas.height=H;
window.addEventListener("resize",()=>{rCanvas.width=W; rCanvas.height=H;});

let rockets=[];
function launchRocket(){
  const x=Math.random()*W*0.8 + W*0.1;
  rockets.push({
    x,
    y:H,
    vy:-(5+Math.random()*3),
    color:COLORS[Math.floor(Math.random()*COLORS.length)],
    trail:[]
  });
}
function animateRockets(){
  rctx.clearRect(0,0,W,H);
  if(Math.random()<0.015) launchRocket();

  rockets.forEach((r,i)=>{
    r.y+=r.vy;
    r.vy+=0.05; // gravity
    r.trail.push({x:r.x,y:r.y,life:1});
    if(r.trail.length>20) r.trail.shift();

    // draw trail
    for(let t of r.trail){
      rctx.globalAlpha=t.life;
      rctx.fillStyle=r.color;
      rctx.beginPath();
      rctx.arc(t.x,t.y,2,0,Math.PI*2);
      rctx.fill();
      t.life-=0.05;
    }

    // draw rocket
    rctx.globalAlpha=1;
    rctx.fillStyle=r.color;
    rctx.fillRect(r.x-1,r.y-8,2,8);

    // explode
    if(r.vy>0){
      createSpark(r.x,r.y);
      rockets.splice(i,1);
    }
  });

  requestAnimationFrame(animateRockets);
}
animateRockets();