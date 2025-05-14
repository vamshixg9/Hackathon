from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100))
    department = db.Column(db.String(100))
    role = db.Column(db.String(20), default='employee')
    created_at = db.Column(db.DateTime, default=datetime.now)

    manager_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    office_id = db.Column(db.Integer, db.ForeignKey('offices.id'), nullable=True)

    employee_id = db.Column(db.BigInteger, unique=True, nullable=True)  # <-- Add this here

    manager = db.relationship('User', remote_side=[id], backref='team_members')
    office = db.relationship('Office', backref='employees', foreign_keys=[office_id])

    attendance_records = db.relationship('Attendance', back_populates='user')

    def __repr__(self):
        return f"<User {self.email} | {self.role}>"


from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


class WebAuthnCredential(db.Model):
    __tablename__ = 'webauthn_credentials'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    credential_id = db.Column(db.String(255), unique=True, nullable=False)
    public_key = db.Column(db.Text, nullable=False)
    sign_count = db.Column(db.Integer, default=0)
    transports = db.Column(db.String(100))  # optional
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='webauthn_credentials')


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    checkin_time    = db.Column(db.DateTime, nullable=True)
    checkout_time   = db.Column(db.DateTime, nullable=True)
    location        = db.Column(db.String(256))
    qr_token        = db.Column(db.String(256))  # For verifying QR check-in/out
    date            = db.Column(db.Date, default=date.today)

    # New fields
    office_id       = db.Column(db.Integer, db.ForeignKey('offices.id'), nullable=True)
    checkin_lat     = db.Column(db.Float)
    checkin_lng     = db.Column(db.Float)
    checkout_lat    = db.Column(db.Float)
    checkout_lng    = db.Column(db.Float)

    user = db.relationship('User', back_populates='attendance_records')
    office          = db.relationship('Office', backref='attendance_records')
    @property
    def total_hours(self):
        if self.checkin_time and self.checkout_time:
            duration = self.checkout_time - self.checkin_time
            return round(duration.total_seconds() / 3600, 2)
        return 0.0

    def __repr__(self):
        return f"<Attendance User {self.user_id} on {self.date}>"

class OTPLog(db.Model):
    __tablename__ = 'otp_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    otp_code = db.Column(db.String(10))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_used = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<OTPLog User {self.user_id} | Used: {self.is_used}>"


class Office(db.Model):
    __tablename__ = 'offices'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    radius_meters = db.Column(db.Float, default=100.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    admin = db.relationship('User', backref='offices', foreign_keys=[admin_id])


class Timesheet(db.Model):
    __tablename__ = 'timesheets'

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    period_start  = db.Column(db.Date, nullable=False)
    period_end    = db.Column(db.Date, nullable=False)
    total_hours   = db.Column(db.Float, nullable=False)
    status        = db.Column(db.String(20), default='pending')  # e.g. pending/approved
    generated_at  = db.Column(db.DateTime, default=datetime.utcnow)

    user          = db.relationship('User', backref='timesheets')

class Ticket(db.Model):
    __tablename__ = 'tickets'

    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title         = db.Column(db.String(200), nullable=False)
    description   = db.Column(db.Text, nullable=False)
    status        = db.Column(db.String(20), default='open')  # open/in_progress/closed
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, onupdate=datetime.utcnow)
    assigned_to   = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    user          = db.relationship('User', foreign_keys=[user_id], backref='tickets')
    assignee      = db.relationship('User', foreign_keys=[assigned_to])


class ToDo(db.Model):
    __tablename__ = 'todos'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.String(255), nullable=False)
    is_done = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='todos')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'is_done': self.is_done,
            'created_at': self.created_at.isoformat()
        }
