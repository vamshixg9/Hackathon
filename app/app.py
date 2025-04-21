from flask import Flask, request, jsonify, session, render_template
from authenticate import authenticate
from send_otp import send_otp
from validate import validate_otp  # You'll write this soon
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
app.secret_key = os.urandom(24)

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

    otp = send_otp('diksha@morabu.com','uzqgy48b', email)
    session['otp'] = otp
    session['email'] = email

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

@app.route("/dashboard")
def dashboard():  # ← WRONG function name or return
    return render_template("dashboard.html")

if __name__ == '__main__':
    app.run(debug=True)