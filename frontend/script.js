document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000';

    const authOptions = document.getElementById('authOptions');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const addTaskForm = document.getElementById('addTaskForm');
    const tasksContainer = document.getElementById('tasksContainer');
    const tasksList = document.getElementById('tasksList');

    // Exibe o formulário de registro e oculta o de login
    document.getElementById('showRegisterForm').addEventListener('click', () => {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Exibe o formulário de login e oculta o de registro
    document.getElementById('showLoginForm').addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(registerForm);
        const registerData = {
            name: formData.get('registerName'),
            password: formData.get('registerPassword')
        };

        try {
            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });
            const data = await response.json();
            if(data.error){
                alert(data.error);
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error registering user. Please try again.');
        }
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(loginForm);
        const loginData = {
            name: formData.get('loginName'),
            password: formData.get('loginPassword')
        };

        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();

            // Esconde os botões de autenticação e mostra o formulário de adicionar tarefa e a lista de tarefas
            if(data.error) {
                alert(data.error);
                authOptions.style.display = 'block';
                addTaskForm.style.display = 'none';
                tasksContainer.style.display = 'none';
                
            }
            else{
                authOptions.style.display = 'none';
                addTaskForm.style.display = 'block';
                tasksContainer.style.display = 'block';
                await listTasks(loginData.name); // Lista as tarefas ao fazer login
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Error logging in. Please try again.');
        }
    });

    addTaskForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const formData = new FormData(addTaskForm);
        const taskData = {
            name: loginForm.loginName.value, // Pega o nome do usuário do formulário de login
            task: formData.get('taskDescription')
        };

        try {
            const response = await fetch(`${apiUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });
            const data = await response.json();
            alert(data.error);
            await listTasks(taskData.name); // Atualiza a lista de tarefas após adicionar uma nova
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Error adding task. Please try again.');
        }
    });

    async function listTasks(username) {
        try {
            const response = await fetch(`${apiUrl}/tasks/${username}`);
            const tasks = await response.json();

            // Limpa a lista de tarefas antes de atualizá-la
            tasksList.innerHTML = '';

            // Adiciona cada tarefa na lista
            tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-item');
                taskItem.textContent = task;
                tasksList.appendChild(taskItem);
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Error fetching tasks. Please try again.');
        }
    }
});
