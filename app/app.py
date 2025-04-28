from flask import Flask, request, jsonify, session, render_template, redirect, url_for
from authenticate import authenticate
from send_otp import send_otp
from validate import validate_otp  # You'll write this soon
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Attendance, OTPLog
import openpyxl
from openpyxl.styles import Font
from flask import send_file
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter


app = Flask(__name__)
CORS(app)
app.secret_key = os.urandom(24)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'database.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email.endswith('@morabu.com'):
        return jsonify({'success': False, 'message': 'Invalid email domain'}), 400

    if not authenticate(email, password):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
    
     # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        # Insert user with dummy hash (replace later with real hash)
        user = User(email=email, password_hash="placeholder_hashed_pw", role="employee", name="Unknown")
        db.session.add(user)
        db.session.commit()

    # Send OTP
    otp = send_otp('diksha@morabu.com', 'uzqgy48b', email)
    session['otp'] = otp
    session['email'] = email

    # Save OTP in OTPLog (optional but useful)
    otp_entry = OTPLog(user_id=user.id, otp_code=otp)
    db.session.add(otp_entry)
    db.session.commit()

    return jsonify({'success': True, 'message': 'OTP sent to your email'}), 200


@app.route("/verify_otp", methods=["POST"])
def verify_otp():
    data = request.json
    entered_otp = data["otp"]
    saved_otp = session.get("otp")
    if entered_otp == saved_otp:
        return jsonify(success=True, message="OTP verified. Redirecting...")
    else:
        return jsonify(success=False, message="Incorrect OTP.")
    


@app.route("/user")
def user():
    return render_template("user.html")

@app.route("/tickets")
def tickets():
    return render_template("tickets.html")

@app.route("/list")
def list_items():
    return render_template("list.html")


@app.route("/home")
def home():  # ← WRONG function name or return
    user_email = session.get('email')  # Example of retrieving the logged-in user's email
    user = User.query.filter_by(email=user_email).first()
    if user:
        # Get the attendance records of the user, maybe limit it to a certain date range or show all
        logs = Attendance.query.filter_by(user_id=user.id).all()
        return render_template("home.html", logs=logs)  # Passing the logs to the template
    return redirect(url_for('index'))

@app.route('/timelogs')
def timelogs():
    user_email = session.get('email')  # Retrieve logged-in user's email
    user = User.query.filter_by(email=user_email).first()
    
    if user:
        # Get attendance records specific to the user
        logs = Attendance.query.filter_by(user_id=user.id).all()
        return render_template("timelogs.html", logs=logs)  # Pass logs to template
    return redirect(url_for('index'))

from datetime import timedelta

def calculate_total_hours(checkin, checkout):
    if checkin and checkout:
        total = checkout - checkin
        hours, remainder = divmod(total.total_seconds(), 3600)
        minutes = remainder // 60
        return f"{int(hours):02}:{int(minutes):02}"
    return "Active" if checkin and not checkout else ""

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    attendance_records = Attendance.query.all()

    attendance_data = [
        {
            "Date": record.date.strftime("%Y-%m-%d"),
            "ClockIn": record.checkin_time.strftime("%H:%M") if record.checkin_time else "",
            "ClockOut": record.checkout_time.strftime("%H:%M") if record.checkout_time else "",
            "TotalHrs": calculate_total_hours(record.checkin_time, record.checkout_time),
            "Location": record.location or ""
        }
        for record in attendance_records
    ]

    return jsonify({"attendance": attendance_data})


@app.route('/download/excel')
def download_excel():
    records = Attendance.query.all()

    # Assuming you want the first user in the attendance records for now
    # You can modify this to get the specific user by email or other identifiers
    user_email = session.get('email')
    user = User.query.filter_by(email=user_email).first()


    workbook = openpyxl.Workbook()
    sheet = workbook.active
    sheet.title = "Attendance Records"

    # Add Title Row
    title = "MORABU HANSHIN : TIME SHEET"
    sheet.merge_cells('A1:E1')
    title_cell = sheet.cell(row=1, column=1)
    title_cell.value = title
    title_cell.font = Font(size=14, bold=True)

    # Add User's Name on Top
    user_name = user.name if user else "Unknown User"
    sheet.merge_cells('A2:E2')
    user_name_cell = sheet.cell(row=2, column=1)
    user_name_cell.value = f"User: {user_name}"
    user_name_cell.font = Font(size=12, bold=True)

    # Add Headers
    headers = ["Date", "Clock In", "Clock Out", "Location", "Total Hours"]
    for col, header in enumerate(headers, start=1):
        cell = sheet.cell(row=3, column=col)
        cell.value = header
        cell.font = Font(bold=True)

    # Add Data Rows
    for row_idx, record in enumerate(records, start=4):
        sheet.cell(row=row_idx, column=1, value=record.date.strftime("%Y-%m-%d"))
        sheet.cell(row=row_idx, column=2, value=record.checkin_time.strftime("%H:%M") if record.checkin_time else "")
        sheet.cell(row=row_idx, column=3, value=record.checkout_time.strftime("%H:%M") if record.checkout_time else "")
        sheet.cell(row=row_idx, column=4, value=record.location or "")
        sheet.cell(row=row_idx, column=5, value=calculate_total_hours(record.checkin_time, record.checkout_time))

    # Save to memory stream
    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    return send_file(output,
                     download_name="timesheet_モラブ阪神工業株式会社.xlsx",
                     as_attachment=True,
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')



from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import fonts

@app.route('/download/pdf')
def download_pdf():
    records = Attendance.query.all()
    filename = "timesheet_モラブ阪神工業株式会社.pdf"
    pdf_file = BytesIO()

    c = canvas.Canvas(pdf_file, pagesize=letter)

    # Title and User's Name
    c.drawString(200, 750, "MORABU HANSHIN : TIME SHEET")

    # Assuming you want the first user in the attendance records for now
    user_email = session.get('email')
    user = User.query.filter_by(email=user_email).first()


    # User's Name
    user_name = user.name if user else "Unknown User"
    c.drawString(50, 730, f"User: {user_name}")

    # Adjust the y_position for the headers
    y_position = 710

    # Table headers
    c.drawString(50, y_position, "Date")
    c.drawString(150, y_position, "Clock In")
    c.drawString(250, y_position, "Clock Out")
    c.drawString(350, y_position, "Location")
    c.drawString(450, y_position, "Total Hours")

    y_position -= 20  # Move down after headers to avoid overlap

    # Loop through records and add them to the table
    for record in records:
        # Format times as HH:MM for cleaner presentation
        checkin_time = record.checkin_time.strftime('%H:%M') if record.checkin_time else ''
        checkout_time = record.checkout_time.strftime('%H:%M') if record.checkout_time else ''

        # Draw each piece of data in a separate column with sufficient spacing
        c.drawString(50, y_position, str(record.date))  # Date
        c.drawString(150, y_position, checkin_time)  # Clock In (formatted time)
        c.drawString(250, y_position, checkout_time)  # Clock Out (formatted time)
        c.drawString(350, y_position, record.location if record.location else '')  # Location
        c.drawString(450, y_position, str(record.total_hours))  # Total hours

        y_position -= 20  # Move down for the next row

        # If the table is getting too long, add a page break
        if y_position < 100:
            c.showPage()  # Start a new page
            c.setFont("NotoSansCJK-Regular", 12)  # Reset font for new page
            y_position = 750  # Reset y_position for new page
            # Re-add headers on new page
            c.drawString(50, 730, "Date")
            c.drawString(150, 730, "Clock In")
            c.drawString(250, 730, "Clock Out")
            c.drawString(350, 730, "Location")
            c.drawString(450, 730, "Total Hours")

    c.save()

    pdf_file.seek(0)
    return send_file(pdf_file, as_attachment=True, download_name=filename, mimetype='application/pdf')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)


