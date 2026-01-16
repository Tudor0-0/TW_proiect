from flask import Flask, request, jsonify, send_from_directory
import json
import os
import socket

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_url_path='', static_folder=BASE_DIR)
DB_FILE = os.path.join(BASE_DIR, 'users.json')

# --- DATABASE HELPERS ---
def load_users():
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_users(users_list):
    with open(DB_FILE, 'w') as f:
        json.dump(users_list, f, indent=4)

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

# --- PAGE ROUTES ---
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/main.html')
def main_page():
    return send_from_directory(BASE_DIR, 'main.html')

# --- API ROUTES ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    users = load_users()
    
    # Check if email exists
    for user in users:
        if user.get('email') == data.get('email'):
            return jsonify({"success": False, "message": "Email is already registered!"})
    
    users.append(data)
    save_users(users)
    print(f"[REGISTER] New user: {data.get('username')}")
    return jsonify({"success": True, "message": "Account created successfully!"})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    users = load_users()
    
    print(f"[LOGIN] Attempt: {data.get('email')}")
    
    for user in users:
        if user.get('email') == data.get('email') and user.get('password') == data.get('password'):
            return jsonify({"success": True, "user": user})
            
    return jsonify({"success": False, "message": "Invalid email or password."})

# --- START SERVER ---
if __name__ == '__main__':
    local_ip = get_local_ip()
    print("------------------------------------------------")
    print(f" SERVER RUNNING. ACCESS IT HERE:")
    print(f" LOCAL PC:   http://localhost:8000")
    print(f" NETWORK:    http://{local_ip}:8000")
    print("------------------------------------------------")
    app.run(host='0.0.0.0', debug=True, port=8000)