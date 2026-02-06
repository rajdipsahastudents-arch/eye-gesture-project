const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const nextBtn = document.getElementById("next");

playBtn.onclick = () => alert("Play Triggered!");
pauseBtn.onclick = () => alert("Pause Triggered!");
nextBtn.onclick = () => alert("Next Triggered!");

canvas.width = 360;
canvas.height = 270;

/* Camera */
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
    await faceMesh.send({ image: video });
  },
  width: 360,
  height: 270,
});
camera.start();

/* Hands */
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});
hands.setOptions({
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  if (results.multiHandLandmarks.length) {
    const lm = results.multiHandLandmarks[0];

    const openPalm = lm[8].y < lm[6].y && lm[12].y < lm[10].y;
    const fist = lm[8].y > lm[6].y;
    const point = lm[8].y < lm[6].y && lm[12].y > lm[10].y;

    if (openPalm) {
      playBtn.click();
      status.innerText = "✋ Open Palm → Play";
    }
    if (fist) {
      pauseBtn.click();
      status.innerText = "✊ Fist → Pause";
    }
    if (point) {
      nextBtn.click();
      status.innerText = "👉 Point → Next";
    }
  }
});

/* Face (Blink Detection) */
const faceMesh = new FaceMesh({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

faceMesh.onResults(results => {
  if (results.multiFaceLandmarks.length) {
    const face = results.multiFaceLandmarks[0];
    const leftEye = face[159].y - face[145].y;

    if (leftEye < 0.005) {
      status.innerText = "👁️ Blink → Click";
      playBtn.click();
    }
  }
});
