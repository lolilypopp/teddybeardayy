const cake = document.getElementById('cake');
const flame = document.getElementById('flame');
const message = document.getElementById('message');
const micBtn = document.getElementById('micBtn');
const resetBtn = document.getElementById('resetBtn');
const music = document.getElementById('music');

let audioUnlocked = false;
let micStarted = false;
let listening = false;
let audioCtx, analyser, stream;
let prevMax = 0;

function unlockAudio() {
  if (audioUnlocked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.start(0); o.stop(0);
  } catch(e) { console.warn('unlock audio failed', e); }
  audioUnlocked = true;
}

document.body.addEventListener('click', () => {
  unlockAudio();
  if (!micStarted) micStarted = true;
});

function extinguish() {
  if (cake.classList.contains('extinguished')) return;
  cake.classList.add('extinguished');
  message.style.display = 'block';
  fadeInMusic();
  spawnConfetti();
}

function relight() {
  cake.classList.remove('extinguished');
  message.style.display = 'none';
  try { music.pause(); music.currentTime = 0; } catch(e) {}
}

cake.addEventListener('click', extinguish);
cake.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter') extinguish(); });
resetBtn.addEventListener('click', relight);

micBtn.addEventListener('click', ()=>{ if (listening) stopMic(); else startMic(); });

async function startMic(){
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    listening = true;
    micBtn.textContent = '🔊 Listening... (tap to stop)';
    detectBlow();
  } catch(e) {
    console.warn('mic error', e);
    micBtn.textContent = 'Mic blocked';
    setTimeout(()=> micBtn.textContent='🎤 Use mic', 1500);
  }
}

function stopMic(){
  listening = false;
  micBtn.textContent='🎤 Use mic';
  if (stream) stream.getTracks().forEach(t=>t.stop());
  if (audioCtx) audioCtx.close();
  stream = null; audioCtx = null;
}

function detectBlow(){
  const buffer = new Uint8Array(analyser.fftSize);
  const loop = ()=>{
    if (!listening) return;
    analyser.getByteTimeDomainData(buffer);
    let max = 0;
    for (let i=0;i<buffer.length;i++){
      const v = Math.abs(buffer[i]-128);
      if (v>max) max = v;
    }
    if (max > Math.max(22, prevMax*0.9 + 8)){
      extinguish();
      stopMic();
      return;
    }
    prevMax = Math.max(prevMax*0.98, max);
    requestAnimationFrame(loop);
  };
  loop();
}

function fadeInMusic(){
  try{
    music.volume = 0;
    const p = music.play();
    if (p) p.catch(()=>{});
    let vol = 0;
    const id = setInterval(()=>{
      vol = Math.min(1, vol + 0.02);
      music.volume = vol;
      if (vol>=1) clearInterval(id);
    },120);
  }catch(e){console.warn(e);}
}

function spawnConfetti(){
  for(let i=0;i<40;i++){
    const el = document.createElement('div');
    el.style.position='fixed';
    el.style.left=(45+Math.random()*10-5)+'%';
    el.style.top=(40+Math.random()*10-5)+'%';
    el.style.width='10px'; el.style.height='14px';
    el.style.background=['#F2C94C','#F2994A','#D87B6B','#8CC48B'][Math.floor(Math.random()*4)];
    el.style.opacity='0.95';
    el.style.transform='rotate('+Math.random()*360+'deg)';
    el.style.borderRadius='2px';
    el.style.zIndex=9999;
    el.style.transition='transform 1500ms linear, top 1200ms ease-out, opacity 1200ms linear';
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.top=(100+Math.random()*20)+'%'; el.style.opacity='0'; },50);
    setTimeout(()=>el.remove(),1600);
  }
}});
