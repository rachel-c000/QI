if (window.location.pathname.includes('video.html')) throw new Error('stop');

var cooldown = false;
var scanInterval = null;
var cameraStream = null;

var lastSeenValue = null;
var consecutiveCount = 0;
var REQUIRED_CONSECUTIVE = 5;

let detector;

// NEW: border progress tracker
let progressStep = 0;

// -------------------- CAMERA SETUP --------------------
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
  .then(function(stream) {
    cameraStream = stream;
    document.getElementById('video').srcObject = stream;
    document.getElementById('video').play();

    if ('BarcodeDetector' in window) {
      detector = new BarcodeDetector({ formats: ['qr_code'] });
      startScan();
    } else {
      document.getElementById('status').textContent =
        'QR scanning not supported in this browser';
    }
  })
  .catch(function() {
    var status = document.getElementById('status');
    if (status) status.textContent = '';
  });

// -------------------- SCANNING LOOP --------------------
function startScan() {
  var video = document.getElementById('video');
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  scanInterval = setInterval(async function() {

    if (cooldown) return;
    if (!detector) return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const codes = await detector.detect(video);

      const ring = document.getElementById('scan-ring');

      if (codes.length > 0) {
        const value = codes[0].rawValue;

        console.log("QR detected:", value);

        const status = document.getElementById('status');
        if (status) status.textContent = "reading: " + value;

        if (!isNaN(value) && value >= 0 && value <= 10) {

          if (value === lastSeenValue) {
            consecutiveCount++;
          } else {
            lastSeenValue = value;
            consecutiveCount = 1;
          }

          status.textContent =
            `locking: ${consecutiveCount} / ${REQUIRED_CONSECUTIVE}`;

          // ---------------- BORDER PROGRESS ----------------
          progressStep = consecutiveCount;

          updateBorderProgress();

          // ---------------- COMPLETE ----------------
          if (consecutiveCount >= REQUIRED_CONSECUTIVE) {

            resetBorder();

            consecutiveCount = 0;
            lastSeenValue = null;

            choose(Number(value));
          }

        } else {
          resetScanState();
        }

      } else {
        resetScanState();
        const status = document.getElementById('status');
        if (status) status.textContent = 'hold QR code up to camera';
      }

    } catch (err) {
      console.log(err);
    }

  }, 200);
}

// -------------------- BORDER ANIMATION --------------------
function updateBorderProgress() {
  const ring = document.getElementById('scan-ring');
  if (!ring) return;

  const progress = Math.min(progressStep / REQUIRED_CONSECUTIVE, 1);

  if (progress <= 0.25) {
    ring.style.clipPath = `inset(0 ${100 - progress * 400}% 100% 0)`;
  } 
  else if (progress <= 0.5) {
    ring.style.clipPath = `inset(0 0 ${100 - (progress - 0.25) * 400}% 0)`;
  } 
  else if (progress <= 0.75) {
    ring.style.clipPath = `inset(${100 - (progress - 0.5) * 400}% 0 0 0)`;
  } 
  else {
    ring.style.clipPath = `inset(0 0 0 ${100 - (progress - 0.75) * 400}%)`;
  }
}

// -------------------- RESET SCAN --------------------
function resetScanState() {
  lastSeenValue = null;
  consecutiveCount = 0;
  resetBorder();
}

// -------------------- RESET BORDER --------------------
function resetBorder() {
  progressStep = 0;

  const ring = document.getElementById('scan-ring');
  if (ring) {
    ring.style.clipPath = 'inset(0 100% 100% 0)';
  }
}

// -------------------- CLEAN UP --------------------
function stopEverything() {
  if (scanInterval) clearInterval(scanInterval);
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
  }
}

// -------------------- YOUR FLOW --------------------
function choose(val) {

  cooldown = true;

  var btns = document.querySelectorAll('.number-row a');
  btns.forEach(b => b.classList.remove('selected'));
  if (btns[val]) btns[val].classList.add('selected');

  var line = document.getElementById('scan-line');
  if (line) line.style.background = '#5cdb95';

  var status = document.getElementById('status');
  if (status) status.textContent = 'scanned — moving on...';

  sessionStorage.setItem(EMOTION_KEY, val);

  setTimeout(function() {
    stopEverything();
    window.location.href = NEXT_PAGE;
  }, 900);
}