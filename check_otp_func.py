import smtplib
import random
from email.mime.text import MIMEText

def authenticate_user(email_input: str, password_input: str) -> bool:
    """
    Perform basic user authentication.
    """
    try:
        with smtplib.SMTP("morabu.com", 587) as server:
            server.starttls()
            server.login(email_input, password_input)
            return True
    except Exception as e:
        print(f"[!] SMTP login failed: {e}")
        return False


def send_otp_email(sender_email: str, sender_password: str, receiver_email: str) -> str | None:
    """
    Sends a one-time password (OTP) to the receiver via SMTP.
    """
    otp = str(random.randint(100000, 999999))

    subject = "Your OTP Code"
    body = f"Your one-time password (OTP) is: {otp}"
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP("morabu.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        print(f"[✓] OTP sent to {receiver_email}")
        return otp
    except Exception as e:
        print(f"[x] Failed to send OTP: {e}")
        return None
    

def validate(code, user_entered):
    return code == user_entered
