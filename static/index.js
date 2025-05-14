async function sendOTP() {
  const email = document.getElementById("emailInput").value;
  const resultEl = document.getElementById("result");

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.success) {
      resultEl.innerText = `✅ OTP sent to ${email}: ${data.otp}`;
    } else {
      resultEl.innerText = `❌ Error: ${data.error}`;
    }
  } catch (err) {
    resultEl.innerText = `❌ Request failed: ${err.message}`;
  }
}

