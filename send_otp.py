from check_otp_func import send_otp_email

def send_otp(admin_mail, admin_password, user_email):
    return send_otp_email(admin_mail, admin_password, user_email)
