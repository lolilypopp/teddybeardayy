const flame = document.getElementById("flame");
const music = document.getElementById("birthdayMusic");

// ensure the audio can play when triggered later
music.volume = 0.4; // softer background volume

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const context = new AudioContext();
      const mic = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      mic.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let blown = false;

      function detectBlow() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;

        if (avg > 80 && !blown) { // detect blow only once
          blown = true;
          flame.style.display = "none";

          // start the background music safely
          music.play().then(() => {
            console.log("Music playing 🎵");
          }).catch(err => {
            console.log("Playback blocked, enabling tap fallback:", err);
            document.body.addEventListener("click", () => music.play(), { once: true });
          });
        }

        requestAnimationFrame(detectBlow);
      }
      detectBlow();
    })
    .catch(() => console.log("Mic access denied"));
}
