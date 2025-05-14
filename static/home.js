function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("位置情報の取得はサポートされていません。");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject("位置情報の取得中にエラーが発生しました。");
        },
        { timeout: 10000 }
      );
    }
  });
}


document.addEventListener("DOMContentLoaded", function () {
  const qrModal = document.getElementById("qr-modal");
  const qrClose = document.getElementById("qr-close");
  const qrCodeContainer = document.getElementById("qr-code");
  const checkinButton = document.getElementById("checkin-card");
  const checkoutButton = document.getElementById("checkout-card");

  fetch('/api/user/attendance-logs', {
    method: 'GET',
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        console.error("Failed to load logs:", data.message);
        return;
      }

      const tbody = document.querySelector('.previous-logs table tbody');
      if (!tbody) {
        console.warn("Logs table body not found.");
        return;
      }

      tbody.innerHTML = ""; // Clear previous rows

      data.logs.forEach(log => {
        const row = document.createElement('tr');

        const date = new Date(log.date).toLocaleDateString();
        const checkin = log.checkin_time ? new Date(log.checkin_time).toLocaleTimeString() : "—";
        const checkout = log.checkout_time ? new Date(log.checkout_time).toLocaleTimeString() : "—";
        const total = log.total_hours ? `${log.total_hours} hrs` : "—";

        row.innerHTML = `
            <td>${date}</td>
            <td>${checkin}</td>
            <td>${checkout}</td>
            <td>${total}</td>
            <td></td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Error fetching logs:", err);
    });
  // Recheck attendance status every 10 seconds
  setInterval(fetchAttendanceStatus, 10000);

  let qrInstance = null;
  let pollInterval = null;

  // Function to open QR modal and generate QR code
  async function generateAndShowQR() {
    try {
      const location = await getCurrentLocation();
      const verifyRes = await fetch('/api/verify_location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(location)
      });
  
      const verifyData = await verifyRes.json();
      if (!verifyData.allowed) {
        alert("現在地が正しい勤務地ではありません。");
        return;
      }
  
      // Location approved: proceed to get QR
      const res = await fetch('/api/generate_qr', { method: 'POST' });
      const data = await res.json();
  
      if (data.success) {
        const token = data.token;
        qrCodeContainer.innerHTML = "";
        qrInstance = new QRCode(qrCodeContainer, {
          text: token,
          width: 200,
          height: 200
        });
        qrModal.style.display = "flex";
  
        pollInterval = setInterval(async () => {
          const response = await fetch('/api/check_qr_status');
          const pollData = await response.json();
  
          if (pollData.used) {
            clearInterval(pollInterval);
            qrModal.style.display = "none";
            fetchAttendanceStatus();
          }
        }, 2000);
      } else {
        alert("QRコードの生成に失敗しました。");
      }
  
    } catch (err) {
      console.error(err);
      alert("Error: " + err);
    }
  }
  




  // Block clicks if card is disabled
  function handleCardClick(event) {
    if (event.currentTarget.classList.contains("disabled")) return;
    generateAndShowQR();
  }

  if (checkinButton) {
    checkinButton.addEventListener("click", handleCardClick);
  }
  if (checkoutButton) {
    checkoutButton.addEventListener("click", handleCardClick);
  }

  // Close QR modal
  qrClose.addEventListener("click", () => {
    qrModal.style.display = "none";

    fetch('/api/expire_qr', { method: 'POST' });

    if (pollInterval) clearInterval(pollInterval);

    fetchAttendanceStatus();
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

      const hasCheckin = !!data.checkin_time;
      const hasCheckout = !!data.checkout_time;

      if (!hasCheckin || (hasCheckin && hasCheckout)) {
        checkinCard.classList.remove('disabled');
        checkoutCard.classList.add('disabled');
        checkinStatus.innerText = 'Not checked in';
        checkoutStatus.innerText = 'Not checked out';
        stopTimer();
      } else if (hasCheckin && !hasCheckout) {
        checkinCard.classList.add('disabled');
        checkoutCard.classList.remove('disabled');
        checkinStatus.innerText = `Checked in at ${formatTime(data.checkin_time)}`;
        checkoutStatus.innerText = 'Not checked out';
        startTimer(data.checkin_time);
      }
    })
    .catch(err => {
      console.error("出勤状況の取得に失敗しました：", err);
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

// Fetch status on load
document.addEventListener('DOMContentLoaded', () => {
  fetchAttendanceStatus();
});

