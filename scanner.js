let cooldown = false;

navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => {
    document.getElementById('video').srcObject = stream;
    startScan();
  })
  .catch(() => {
    document.getElementById('status').textContent = 'Camera unavailable — use buttons below';
  });

function startScan() {
  const video = document.getElementById('video');
  const temp = document.createElement('canvas');
  const ctx = temp.getContext('2d');

  setInterval(() => {
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    if (cooldown) return;

    temp.width = video.videoWidth;
    temp.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = ctx.getImageData(0, 0, temp.width, temp.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      try {
        const val = JSON.parse(code.data).value;
        if (val >= 0 && val <= 10) {
          confirm(val);
        }
      } catch(e) {}
    }
  }, 200);
}

function confirm(val) {
  if (cooldown) return;
  cooldown = true;

  sessionStorage.setItem(EMOTION_KEY, val);

  document.getElementById('status').textContent = 'Got it';
  document.getElementById('val').textContent = val;
  document.getElementById('scanned').style.display = 'block';

  setTimeout(() => {
    window.location.href = NEXT_PAGE;
  }, 1500);
}