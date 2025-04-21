import smtplib
import random
from email.mime.text import MIMEText

# Configuration
smtp_server = "morabu.com"
port = 587
sender_email = "diksha@morabu.com"
sender_password = "uzqgy48b"
receiver_email = "v_dheravath@morabu.com"  # Can be same as sender for testing

# Generate 6-digit OTP
otp = random.randint(100000, 999999)

# Create email
subject = "Your OTP Code"
body = f"Your one-time password (OTP) is: {otp}"
msg = MIMEText(body)
msg["Subject"] = subject
msg["From"] = sender_email
msg["To"] = receiver_email

# Send email
try:
    with smtplib.SMTP(smtp_server, port) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, msg.as_string())
    print(f"✅ OTP sent successfully: {otp}")
except Exception as e:
    print(f"❌ Failed to send OTP: {e}")
