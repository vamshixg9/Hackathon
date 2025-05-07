document.addEventListener("DOMContentLoaded", function () {
  const qrModal = document.getElementById("qr-modal");
  const qrClose = document.getElementById("qr-close");
  const qrCodeContainer = document.getElementById("qr-code");
  const checkinButton = document.getElementById("checkin-card");
  const checkoutButton = document.getElementById("checkout-card");


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
  if (checkoutButton) {
    checkoutButton.addEventListener("click", generateAndShowQR);
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
      const checkinCard = document.getElementById('checkin-card');
      const checkoutCard = document.getElementById('checkout-card');
      const checkinStatus = document.getElementById('clockin-status');
      const checkoutStatus = document.getElementById('clockout-status');

      if (data.checked_in && !data.checkout_time) {
        // ✅ Checked in but not yet out
        checkinCard.classList.add('disabled');
        checkoutCard.classList.remove('disabled');
        checkinStatus.innerText = `Checked in at ${formatTime(data.checkin_time)}`;
        checkoutStatus.innerText = "Not checked out";
        startTimer(data.checkin_time);
      } else if (data.checkout_time) {
        // ✅ Fully completed session
        checkinCard.classList.remove('disabled');
        checkoutCard.classList.add('disabled');
        checkinStatus.innerText = "Not checked in";
        checkoutStatus.innerText = `Checked out at ${formatTime(data.checkout_time)}`;
        stopTimer();
      } else {
        // ❌ No check-in yet today
        checkinCard.classList.remove('disabled');
        checkoutCard.classList.add('disabled');
        checkinStatus.innerText = "Not checked in";
        checkoutStatus.innerText = "Not checked out";
        stopTimer();
      }
    });
}

function formatTime(datetimeStr) {
  const d = new Date(datetimeStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

