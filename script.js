const database = firebase.initializeApp({
  apiKey: "AIzaSyA637A7ladgHCJP7jysuayB8lXPlIW-eIc",
  authDomain: "todolist-b6b01.firebaseapp.com",
  databaseURL: "https://todolist-b6b01-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "todolist-b6b01",
  storageBucket: "todolist-b6b01.appspot.com",
  messagingSenderId: "123858676861",
  appId: "1:123858676861:web:bfe71ecb18e02515bf5514",
  measurementId: "G-X4D59LVLLY"
}).database();
const todosRef = database.ref('todos');

let todos = [];
let isLoading = true;
let errorMessage = null;
const errorMessageElement = document.getElementById('error');

async function addTodo(todoText) {
  try {
    const newTodoRef = await todosRef.push({ text: todoText, completed: false });
    return { id: newTodoRef.key, text: todoText, completed: false };
  } catch (error) {
    console.error("Error adding todo:", error);
    showError("Error adding todo");
    return null;
  }
}

async function getTodos() {
  try {
    showLoading();
    const snapshot = await todosRef.once('value');
    const todosData = snapshot.val();
    if (todosData) {
      todos = Object.entries(todosData).map(([id, todo]) => ({ id, ...todo }));
    }
    renderTodoList();
  } catch (error) {
    console.error("Error getting todos:", error);
    showError("Error fetching todos");
  } finally {
    hideLoading();
  }
}

async function deleteTodo(todoId) {
  try {
    await todosRef.child(todoId).remove();
    todos = todos.filter(todo => todo.id !== todoId);
    renderTodoList();
    updateCounter();
  } catch (error) {
    console.error("Error deleting todo:", error);
    showError("Error deleting todo");
  }
}

async function toggleTodo(todoId, completed) {
  try {
    await todosRef.child(todoId).update({ completed });
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex !== -1) {
      todos[todoIndex].completed = completed;
    }
    renderTodoList();
  } catch (error) {
    console.error("Error updating todo:", error);
    showError("Error updating todo");
  }
}

function renderTodoList() {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';

  if (isLoading) {
    document.getElementById('loading').style.display = 'block';
  }
  else {
    document.getElementById('loading').style.display = 'none';

    if (errorMessage) {
      errorMessageElement.textContent = errorMessage;
      errorMessageElement.style.display = 'block';
    }
    else {
      todos.forEach(todo => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input me-2';
        checkbox.id = todo.id;
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
          toggleTodo(todo.id, checkbox.checked);
          updateCounter();
        });
        listItem.appendChild(checkbox);

        const label = document.createElement('label');
        label.htmlFor = todo.id;
        if (todo.completed) {
          label.classList.add('text-decoration-line-through', 'text-success');
        }
        label.textContent = todo.text;
        listItem.appendChild(label);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm float-end';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));
        listItem.appendChild(deleteButton);

        todoList.appendChild(listItem);
      });
    }
    updateCounter();
  }
}

function updateCounter() {
  const itemCount = todos.length;
  const uncheckedCount = todos.filter(todo => !todo.completed).length;
  document.getElementById('item-count').innerText = itemCount;
  document.getElementById('unchecked-count').innerText = uncheckedCount;
}

function showLoading() {
  isLoading = true;
  renderTodoList();
}

function hideLoading() {
  isLoading = false;
  renderTodoList();
}

async function newTodo() {
  const todoText = prompt('Введіть нову справу:');
  if (todoText) {
    try {
      const newTodo = await addTodo(todoText);
      if (newTodo) {
        todos.push(newTodo);
        renderTodoList();
        updateCounter();
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      showError("Error adding todo");
    }
  }
}

async function loadTodos() {
  try {
    showLoading();
    const snapshot = await todosRef.once('value');
    const todosData = snapshot.val();

    if (todosData) {
      todos = Object.entries(todosData).map(([id, todo]) => ({ id, ...todo }));
    } else {
      todos = [];
    }

    renderTodoList();
  } catch (error) {
    console.error("Error getting todos:", error);
    showError("Error fetching todos");
  } finally {
    hideLoading();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const newTodoButton = document.getElementById('newTodoBtn');
  newTodoButton.addEventListener('click', newTodo);
  loadTodos();
});
