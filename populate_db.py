# populate.py

from datetime import datetime, timedelta, date
from random import choice, randint
from app import db, app
from models import User, Attendance, Office

# Create test user (your credentials)
def create_test_user():
    email = "v_dheravath@morabu.com"
    password = "nn94zka2"
    name = "Vikas Dheravath"
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        print(f"[INFO] User already exists: {email}")
        return existing_user
    else:
        user = User(email=email, password_hash=password, name=name)
        db.session.add(user)
        db.session.commit()
        print(f"[INFO] Created new user: {email}")
        return user

# Create a dummy office (necessary for Attendance.office_id)
def create_dummy_office(admin_user):
    existing = Office.query.first()
    if existing:
        return existing
    office = Office(
        name="Test HQ",
        admin_id=admin_user.id,
        latitude=34.6937,
        longitude=135.5023,
        radius_meters=100
    )
    db.session.add(office)
    db.session.commit()
    print(f"[INFO] Created dummy office: {office.name}")
    return office

# Generate fake check-ins and check-outs
def generate_attendance_records(user, office):
    weekdays_added = 0
    today = datetime.today().date()
    
    # Get the past 20 days excluding today and weekends
    potential_dates = []
    for i in range(1, 21):  # 1 to 20, excluding today
        day = today - timedelta(days=i)
        if day.weekday() < 5:  # 0-4 are weekdays
            potential_dates.append(day)
    
    # Sort dates in ascending order
    potential_dates.sort()

    # Only keep the first 15 weekdays
    selected_dates = potential_dates[:15]

    for record_date in selected_dates:
        # Generate check-in and check-out times for the record
        checkin_time = datetime.combine(record_date, datetime.min.time()) + timedelta(hours=9, minutes=randint(0, 30))
        checkout_time = checkin_time + timedelta(hours=8, minutes=randint(0, 30))

        # Create the attendance record
        attendance = Attendance(
            user_id=user.id,
            checkin_time=checkin_time,
            checkout_time=checkout_time,
            location="Test HQ",
            date=record_date,
            office_id=office.id,
            checkin_lat=office.latitude,
            checkin_lng=office.longitude,
            checkout_lat=office.latitude,
            checkout_lng=office.longitude,
            qr_token=f"TOKEN-{randint(1000, 9999)}"
        )
        db.session.add(attendance)

    db.session.commit()
    print(f"[INFO] Added {len(selected_dates)} attendance records for user {user.email}")
# Execution entrypoint
if __name__ == '__main__':
    with app.app_context():
        db.drop_all()
        db.create_all()

        print("[INFO] Database reset completed.")

        user = create_test_user()
        office = create_dummy_office(user)
        generate_attendance_records(user, office)

        print("[SUCCESS] Test data generation complete.")
