Morabu Hackathon April 2025

- flask-cors
- flash_sqlalchemy
- flask-sqlalchemy-erd
- openpyxl
- reportlab
- weasyprint
- python-dotenv sqlalchemy psycopg2
- geopy
- webauthn
- fido2



generating an ER diag : 
1. eralchemy -i sqlite:///database.db -o schema.er
2. eralchemy -i schema.er -o schema.pdf


HOSTING : 
✅ What You Need to Do Now
You are likely still running Flask on port 5000, so ngrok must tunnel to that.

🔁 Step-by-step:
1. Start Flask like this (in app.py or CLI):
python
コピーする
編集する
app.run(host="0.0.0.0", port=5000)
Then run:

bash
コピーする
編集する
python app.py
2. Restart ngrok to target port 5000:
In a new terminal, run:

bash
コピーする
編集する
ngrok http 5000
You should now see output like:

nginx
コピーする
編集する
Forwarding  https://xxxxxxxx.ngrok-free.app -> http://localhost:5000
3. Visit This HTTPS URL on Your Phone
Copy the https://...ngrok-free.app URL and open it on your Android browser.





