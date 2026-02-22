from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit
import mysql.connector
from datetime import datetime, timedelta
import bcrypt
import os

app = Flask(__name__)

# CORS Configuration for Production
allowed_origins = [
    'http://localhost:5173',
    'https://*.vercel.app',
    os.getenv('FRONTEND_URL', 'http://localhost:5173')
]

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

jwt = JWTManager(app)
socketio = SocketIO(app, 
                    cors_allowed_origins=allowed_origins,
                    async_mode='eventlet')

# Database connection - Production Ready
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'KU@2002'),
    'database': os.getenv('DB_NAME', 'taskflow_db'),
    'port': int(os.getenv('DB_PORT', '3306'))
}

db = mysql.connector.connect(**db_config)

# Helper function to log activity
def log_activity(user_id, task_id, action, description):
    try:
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO activity_log (user_id, task_id, action, description) VALUES (%s, %s, %s, %s)',
            (user_id, task_id, action, description)
        )
        db.commit()
        cursor.close()
    except Exception as e:
        print(f"Error logging activity: {str(e)}")

# ============================================
# AUTH ROUTES
# ============================================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')

        if not email or not password or not full_name:
            return jsonify({'error': 'All fields required'}), 400

        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        
        if cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Email already registered'}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        cursor.execute(
            'INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s)',
            (email, hashed_password.decode('utf-8'), full_name)
        )
        db.commit()
        user_id = cursor.lastrowid
        cursor.close()

        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            'message': 'User registered successfully',
            'token': access_token,
            'user': {
                'id': user_id,
                'email': email,
                'full_name': full_name
            }
        }), 201

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        cursor.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401

        access_token = create_access_token(identity=str(user['id']))
        
        return jsonify({
            'message': 'Login successful',
            'token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'avatar': user.get('avatar')
            }
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500


# ============================================
# TASK ROUTES
# ============================================

@app.route('/api/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        user_id = get_jwt_identity()
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            'SELECT * FROM tasks WHERE user_id = %s ORDER BY created_at DESC',
            (user_id,)
        )
        tasks = cursor.fetchall()
        cursor.close()
        return jsonify({'tasks': tasks}), 200
    except Exception as e:
        print(f"Error fetching tasks: {str(e)}")
        return jsonify({'error': 'Failed to fetch tasks'}), 500


@app.route('/api/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        title = data.get('title')
        description = data.get('description', '')
        priority = data.get('priority', 'medium')
        status = data.get('status', 'todo')
        due_date = data.get('due_date')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        cursor = db.cursor(dictionary=True)
        cursor.execute(
            'INSERT INTO tasks (user_id, title, description, priority, status, due_date) VALUES (%s, %s, %s, %s, %s, %s)',
            (user_id, title, description, priority, status, due_date)
        )
        db.commit()
        
        task_id = cursor.lastrowid
        cursor.execute('SELECT * FROM tasks WHERE id = %s', (task_id,))
        new_task = cursor.fetchone()
        cursor.close()
        
        log_activity(user_id, task_id, 'created', f'Created task: {title}')
        
        try:
            socketio.emit('task_created', new_task, broadcast=True)
        except Exception as e:
            print(f"Socket emit error: {e}")
        
        return jsonify({
            'message': 'Task created successfully',
            'task': new_task
        }), 201
        
    except Exception as e:
        print(f"Error creating task: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT * FROM tasks WHERE id = %s AND user_id = %s', (task_id, user_id))
        task = cursor.fetchone()
        
        if not task:
            cursor.close()
            return jsonify({'error': 'Task not found'}), 404
        
        title = data.get('title', task['title'])
        description = data.get('description', task['description'])
        priority = data.get('priority', task['priority'])
        status = data.get('status', task['status'])
        due_date = data.get('due_date', task['due_date'])
        
        changes = []
        if status != task['status']:
            changes.append(f"Status: {task['status']} → {status}")
        if priority != task['priority']:
            changes.append(f"Priority: {task['priority']} → {priority}")
        if title != task['title']:
            changes.append(f"Title changed")
        
        cursor.execute(
            'UPDATE tasks SET title = %s, description = %s, priority = %s, status = %s, due_date = %s WHERE id = %s',
            (title, description, priority, status, due_date, task_id)
        )
        db.commit()
        
        cursor.execute('SELECT * FROM tasks WHERE id = %s', (task_id,))
        updated_task = cursor.fetchone()
        cursor.close()
        
        if changes:
            log_activity(user_id, task_id, 'updated', f'Updated task: {", ".join(changes)}')
        
        return jsonify({
            'message': 'Task updated successfully',
            'task': updated_task
        }), 200
        
    except Exception as e:
        print(f"Error updating task: {str(e)}")
        return jsonify({'error': 'Failed to update task'}), 500


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        user_id = get_jwt_identity()
        
        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT title FROM tasks WHERE id = %s AND user_id = %s', (task_id, user_id))
        task = cursor.fetchone()
        
        if not task:
            cursor.close()
            return jsonify({'error': 'Task not found'}), 404
        
        task_title = task['title']
        
        cursor.execute('DELETE FROM tasks WHERE id = %s AND user_id = %s', (task_id, user_id))
        db.commit()
        cursor.close()
        
        log_activity(user_id, None, 'deleted', f'Deleted task: {task_title}')
        
        return jsonify({'message': 'Task deleted successfully'}), 200
        
    except Exception as e:
        print(f"Error deleting task: {str(e)}")
        return jsonify({'error': 'Failed to delete task'}), 500


# ============================================
# USER SETTINGS ROUTES
# ============================================

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user_profile(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        full_name = data.get('full_name', '').strip()
        email = data.get('email', '').strip()
        
        if not full_name or not email:
            return jsonify({'error': 'Full name and email required'}), 400
        
        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT id FROM users WHERE email = %s AND id != %s', (email, user_id))
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            return jsonify({'error': 'Email already in use'}), 400
        
        cursor.execute('UPDATE users SET full_name = %s, email = %s WHERE id = %s', (full_name, email, user_id))
        db.commit()
        cursor.close()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        print(f"❌ Profile update error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/auth/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current and new password required'}), 400
        
        if len(new_password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        cursor = db.cursor(dictionary=True)
        cursor.execute('SELECT password_hash FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user:
            cursor.close()
            return jsonify({'error': 'User not found'}), 404
        
        if not bcrypt.checkpw(current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            cursor.close()
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', (hashed.decode('utf-8'), current_user_id))
        db.commit()
        cursor.close()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        print(f"❌ Password change error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>/preferences', methods=['PUT'])
@jwt_required()
def update_preferences(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({'message': 'Preferences updated successfully'}), 200
        
    except Exception as e:
        print(f"❌ Preferences update error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/users/<int:user_id>/avatar', methods=['POST'])
@jwt_required()
def upload_avatar(user_id):
    try:
        current_user_id = int(get_jwt_identity())
        
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        avatar_data = data.get('avatar')
        
        cursor = db.cursor(dictionary=True)
        cursor.execute('UPDATE users SET avatar = %s WHERE id = %s', (avatar_data, user_id))
        db.commit()
        
        cursor.execute('SELECT avatar FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        cursor.close()
        
        return jsonify({
            'message': 'Avatar updated successfully',
            'avatar': user['avatar']
        }), 200
        
    except Exception as e:
        print(f"❌ Avatar upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ============================================
# ACTIVITY LOG ROUTES
# ============================================

@app.route('/api/activity', methods=['GET'])
@jwt_required()
def get_activity():
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        
        cursor = db.cursor(dictionary=True)
        cursor.execute('''
            SELECT a.*, t.title as task_title 
            FROM activity_log a
            LEFT JOIN tasks t ON a.task_id = t.id
            WHERE a.user_id = %s
            ORDER BY a.created_at DESC
            LIMIT %s
        ''', (user_id, limit))
        
        activities = cursor.fetchall()
        cursor.close()
        
        return jsonify({'activities': activities}), 200
        
    except Exception as e:
        print(f"Error fetching activity: {str(e)}")
        return jsonify({'error': 'Failed to fetch activity'}), 500


# ============================================
# WEBSOCKET EVENTS
# ============================================

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200


# ============================================
# RUN APP
# ============================================

if __name__ == '__main__':
    print("🚀 Starting TaskFlow backend...")
    print(f"📍 Server: http://127.0.0.1:{os.getenv('PORT', 5000)}")
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)