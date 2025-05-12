
import smtplib
import random
from email.mime.text import MIMEText

def authenticate(email_input: str, password_input: str) -> bool:
    try:
        with smtplib.SMTP("morabu.com", 587) as server:
            server.starttls()
            server.login(email_input, password_input)
            return True
    except smtplib.SMTPAuthenticationError as e:
        print("[!] SMTP Authentication failed.")
        print(f"Code: {e.smtp_code}, Message: {e.smtp_error.decode()}")
        return False
    except Exception as e:
        print(f"[!] Other error: {e}")
        return False
