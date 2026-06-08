if (window.location.pathname.includes('video.html')) throw new Error('stop');

var cooldown = false;

var detector = new AR.Detector();

navigator.mediaDevices.getUserMedia({ video: true })
  .then(function(stream) {
    document.getElementById('video').srcObject = stream;
    document.getElementById('video').play();
    startScan();
  })
  .catch(function() {
    var status = document.getElementById('status');
    if (status) status.textContent = 'camera unavailable — tap a number below';
  });

function startScan() {
  var video  = document.getElementById('video');
  var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d', { willReadFrequently: true });

  setInterval(function() {
    if (cooldown) return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var markers   = detector.detect(imageData);

    if (markers.length > 0) {
      var id = markers[0].id;
      console.log('aruco detected, id:', id);
      if (id >= 0 && id <= 10) {
        choose(id);
      }
    }

  }, 200);
}

function choose(val) {
  if (cooldown) return;
  cooldown = true;

  var btns = document.querySelectorAll('.number-row a');
  btns.forEach(function(b) { b.classList.remove('selected'); });
  if (btns[val]) btns[val].classList.add('selected');

  var line = document.getElementById('scan-line');
  if (line) line.style.background = '#5cdb95';

  var status = document.getElementById('status');
  if (status) status.textContent = 'got it — moving on...';

  sessionStorage.setItem(EMOTION_KEY, val);

  setTimeout(function() {
    window.location.href = NEXT_PAGE;
  }, 900);
}