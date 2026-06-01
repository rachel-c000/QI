let cooldown = false;

// start the camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(function(stream) {
    document.getElementById('video').srcObject = stream;
    document.getElementById('status').textContent = 'Hold your card up to the camera';
    startScan();
  })
  .catch(function() {
    document.getElementById('status').textContent = 'Camera unavailable — use buttons below';
  });

// scan loop
function startScan() {
  var video = document.getElementById('video');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  setInterval(function() {
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
    if (cooldown) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      console.log('scanned:', code.data);
      try {
        var val = JSON.parse(code.data).value;
        if (val >= 0 && val <= 10) {
          confirm(val);
        }
      } catch(e) {
        console.log('could not parse qr data:', code.data);
      }
    }

  }, 200);
}

// called by scan or button tap
function confirm(val) {
  if (cooldown) return;
  cooldown = true;

  sessionStorage.setItem(EMOTION_KEY, val);

  document.getElementById('status').textContent = 'Got it';
  document.getElementById('val').textContent = val;
  document.getElementById('scanned').style.display = 'block';

  setTimeout(function() {
    window.location.href = NEXT_PAGE;
  }, 1500);
}