const flame = document.getElementById("flame");
const music = document.getElementById("birthdayMusic");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const context = new AudioContext();
      const mic = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      function detectBlow() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        if (avg > 80) { // blow detected
          flame.style.display = "none";
          music.play().catch(() => {});
        }
        requestAnimationFrame(detectBlow);
      }
      detectBlow();
    })
    .catch(() => console.log("Mic access denied"));
}
