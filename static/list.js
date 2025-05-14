document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Assuming the token is stored in localStorage/sessionStorage
    const token = localStorage.getItem('authToken'); // Or use sessionStorage

    // Load tasks on page load
    fetch('/api/todos', {
        headers: {
            'Authorization': `Bearer ${token}` // Add token to the request headers
        }
    })
        .then(res => res.json())
        .then(data => data.todos.forEach(renderTodo));

    // Submit new task
    todoForm.addEventListener('submit', e => {
        e.preventDefault();
        const content = todoInput.value.trim();
        if (!content) return;

        fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Add token to the request headers
            },
            body: JSON.stringify({ content })
        })
        .then(res => res.json())
        .then(data => {
            renderTodo(data.todo);
            todoInput.value = '';
        });
    });

    // Render a task
    function renderTodo(todo) {
        const li = document.createElement('li');
        li.classList.toggle('done', todo.is_done);
        li.dataset.id = todo.id;

        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.addEventListener('click', () => toggleTodo(todo.id, li));

        const span = document.createElement('span');
        span.textContent = todo.content;

        li.appendChild(circle);
        li.appendChild(span);
        todoList.appendChild(li);
    }

    // Toggle task status
    function toggleTodo(id, li) {
        fetch(`/api/todos/${id}/toggle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` // Add token to the request headers
            }
        })
            .then(res => res.json())
            .then(data => {
                li.classList.toggle('done', data.todo.is_done);
            });
    }
});
