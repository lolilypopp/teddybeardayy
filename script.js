const flame = document.getElementById("flame");
const music = document.getElementById("birthdayMusic");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const context = new AudioContext();
      const mic = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      let blown = false;

      function detectBlow() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;

        if (avg > 85 && !blown) {
          blown = true;
          flame.style.transition = "opacity 0.5s ease";
          flame.style.opacity = "0";
          setTimeout(() => flame.style.display = "none", 600);

          // restart the audio context for safety
          if (context.state === "suspended") context.resume();

          // play the soft happy birthday music
          music.volume = 0.5;
          music.play().catch(err => console.log("Playback blocked:", err));
        }

        requestAnimationFrame(detectBlow);
      }

      detectBlow();
    })
    .catch(err => console.log("Mic access denied:", err));
} else {
  console.log("getUserMedia not supported on this browser.");
}  spawnConfetti();
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
