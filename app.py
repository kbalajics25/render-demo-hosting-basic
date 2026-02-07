from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# In-memory task storage (in production, use a database)
tasks = [
    {
        'id': 1,
        'text': 'Learn Python Flask',
        'completed': False,
        'createdAt': datetime.now().isoformat()
    },
    {
        'id': 2,
        'text': 'Build REST API',
        'completed': True,
        'createdAt': datetime.now().isoformat()
    },
    {
        'id': 3,
        'text': 'Connect Frontend to Backend',
        'completed': False,
        'createdAt': datetime.now().isoformat()
    }
]

# Counter for generating new task IDs
next_id = 4


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify({
        'success': True,
        'tasks': tasks,
        'total': len(tasks)
    })


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task by ID"""
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if task:
        return jsonify({
            'success': True,
            'task': task
        })
    else:
        return jsonify({
            'success': False,
            'error': 'Task not found'
        }), 404


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    global next_id
    
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({
            'success': False,
            'error': 'Task text is required'
        }), 400
    
    new_task = {
        'id': next_id,
        'text': data['text'],
        'completed': data.get('completed', False),
        'createdAt': datetime.now().isoformat()
    }
    
    tasks.append(new_task)
    next_id += 1
    
    return jsonify({
        'success': True,
        'task': new_task,
        'message': 'Task created successfully'
    }), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        return jsonify({
            'success': False,
            'error': 'Task not found'
        }), 404
    
    data = request.get_json()
    
    if 'text' in data:
        task['text'] = data['text']
    if 'completed' in data:
        task['completed'] = data['completed']
    
    return jsonify({
        'success': True,
        'task': task,
        'message': 'Task updated successfully'
    })


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    global tasks
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    
    if not task:
        return jsonify({
            'success': False,
            'error': 'Task not found'
        }), 404
    
    tasks = [t for t in tasks if t['id'] != task_id]
    
    return jsonify({
        'success': True,
        'message': 'Task deleted successfully'
    })


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get task statistics"""
    total = len(tasks)
    completed = sum(1 for t in tasks if t['completed'])
    pending = total - completed
    
    return jsonify({
        'success': True,
        'stats': {
            'total': total,
            'completed': completed,
            'pending': pending,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 2)
        }
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    print("🚀 Starting Task Manager API...")
    print("📍 Server running on http://localhost:5000")
    print("📚 API Documentation available at http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
