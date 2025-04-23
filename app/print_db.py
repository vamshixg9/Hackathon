from app import app
from models import db, User, Attendance, OTPLog

with app.app_context():
    print("Users:")
    for user in User.query.all():
        print(user)

    print("\nAttendance Records:")
    for record in Attendance.query.all():
        print(record)

    print("\nOTP Logs:")
    for otp in OTPLog.query.all():
        print(otp)
