document.addEventListener("DOMContentLoaded", function () {
  const qrModal = document.getElementById("qr-modal");
  const qrClose = document.getElementById("qr-close");
  const qrCodeContainer = document.getElementById("qr-code");
  const checkinButton = document.getElementById("checkin-card");


  let qrInstance = null;

  // Function to open QR modal and generate QR code
  async function generateAndShowQR() {
    try {
      const res = await fetch('/api/generate_qr', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        const token = data.token;

        // Clear any existing QR
        qrCodeContainer.innerHTML = "";

        qrInstance = new QRCode(qrCodeContainer, {
          text: token,
          width: 200,
          height: 200
        });

        qrModal.style.display = "flex";
      } else {
        alert("Failed to generate QR.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while generating QR.");
    }
  }

  // Handle check-in button click
  if (checkinButton) {
    checkinButton.addEventListener("click", generateAndShowQR);
  }

  // Close QR modal
  qrClose.addEventListener("click", () => {
    qrModal.style.display = "none";

    // Optional: Tell server to expire the token if modal is closed
    fetch('/api/expire_qr', { method: 'POST' });
  });
});

let timerInterval = null;

function fetchAttendanceStatus() {
  fetch('/api/user/attendance-status')
    .then(res => res.json())
    .then(data => {
      if (data.checked_in) {
        document.getElementById('checkin-card').classList.add('disabled');
        document.getElementById('checkout-card').classList.remove('disabled');
        document.getElementById('clockin-status').innerText = "Checked in at " + data.checkin_time;
        startTimer(data.checkin_time);
      } else {
        document.getElementById('checkin-card').classList.remove('disabled');
        document.getElementById('checkout-card').classList.add('disabled');
        document.getElementById('clockin-status').innerText = "Not checked in";
        document.getElementById('clockout-status').innerText = "Not checked out";
        stopTimer();
      }

      if (data.checkout_time) {
        document.getElementById('clockout-status').innerText = "Checked out at " + data.checkout_time;
        stopTimer();
      }
    });
}

function startTimer(checkinTimeStr) {
  const checkinTime = new Date(checkinTimeStr);
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const now = new Date();
    const diff = now - checkinTime;
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    document.getElementById('timelog').innerText =
      `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  document.getElementById('timelog').innerText = "00:00:00";
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchAttendanceStatus();
});

