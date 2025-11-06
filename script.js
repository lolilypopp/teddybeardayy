const flame = document.getElementById("flame");
const music = document.getElementById("birthdayMusic");

let micStarted = false;

document.body.addEventListener("click", () => {
  if (micStarted) return;
  micStarted = true;

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const mic = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        mic.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        function detectBlow() {
          analyser.getByteFrequencyData(data);
          const avg = data.reduce((a, b) => a + b) / data.length;

          if (avg > 85) { // detected blowing
            flame.style.display = "none";
            if (music.paused) {
              music.play().catch(e => console.log("Autoplay blocked:", e));
            }
          }

          requestAnimationFrame(detectBlow);
        }

        detectBlow();
      })
      .catch(err => console.log("Mic error:", err));
  }
});
