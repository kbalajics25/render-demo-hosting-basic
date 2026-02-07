// Task array to store all tasks
let tasks = [];
let currentFilter = 'all';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
});

// Add task function
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    taskInput.value = '';
    
    saveTasksToStorage();
    renderTasks();
    updateStats();
    
    // Add animation
    const taskList = document.getElementById('taskList');
    const lastTask = taskList.lastElementChild;
    if (lastTask) {
        lastTask.style.animation = 'slideIn 0.3s ease-out';
    }
}

// Allow adding tasks with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
});

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active button
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderTasks();
}

// Render tasks based on current filter
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    }
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No tasks to display</p>';
        return;
    }
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})"
            />
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        
        taskList.appendChild(li);
    });
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
}

// Save tasks to localStorage
function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fetch tasks from Python API
async function fetchTasks() {
    const apiResponse = document.getElementById('apiResponse');
    apiResponse.textContent = 'Loading...';
    
    try {
        // const response = await fetch('http://localhost:5000/api/tasks');
        const response = await fetch('https://imprints-task-manager.onrender.com/api/tasks');
        const data = await response.json();
        
        apiResponse.textContent = JSON.stringify(data, null, 2);
        
        // Optionally merge API tasks with local tasks
        if (data.tasks && Array.isArray(data.tasks)) {
            console.log('Fetched tasks from API:', data.tasks);
        }
    } catch (error) {
        apiResponse.textContent = `Error: ${error.message}\n\nMake sure the Python Flask server is running on port 5000.\nRun: python app.py`;
    }
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
