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
