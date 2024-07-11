const express = require('express');
const fs = require('fs').promises;
const cors = require('cors'); 
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const dbFilePath = './db.json';

// Inicializa o banco de dados se o arquivo não existir
const initializeDatabase = async () => {
    try {
        await fs.access(dbFilePath);
    } catch (err) {
        // Se o arquivo não existe, cria ele com uma estrutura inicial vazia
        const initialData = {
            users: []
        };
        await fs.writeFile(dbFilePath, JSON.stringify(initialData));
    }
};

// Lê o banco de dados do arquivo
const readDatabase = async () => {
    const data = await fs.readFile(dbFilePath);
    return JSON.parse(data);
};

// Salva o banco de dados no arquivo
const saveDatabase = async (data) => {
    await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2));
};

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Lê o banco de dados atual
        const db = await readDatabase();

        // Verifica se o nome de usuário já existe
        if (db.users.some(user => user.name === name)) {
            return res.status(400).json({ error: 'Nome de usuário já existe. Escolha outro.' });
        }

        // Adiciona o novo usuário ao banco de dados
        db.users.push({ name, password, tasks: [] });

        // Salva o banco de dados atualizado no arquivo
        await saveDatabase(db);

        res.status(201).json({ message: 'Usuário registrado com sucesso.' });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        res.status(500).json({ error: 'Erro interno ao processar solicitação.' });
    }
});

// Rota para autenticar um usuário
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // Lê o banco de dados atual
        const db = await readDatabase();

        // Verifica se as credenciais são válidas
        const user = db.users.find(user => user.name === name && user.password === password);
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        res.status(200).json({ message: 'Login bem sucedido.' });
    } catch (err) {
        console.error('Erro ao autenticar usuário:', err);
        res.status(500).json({ error: 'Erro interno ao processar solicitação.' });
    }
});

// Rota para adicionar uma nova tarefa para um usuário
app.post('/tasks', async (req, res) => {
    const { name, task } = req.body;

    try {
        // Lê o banco de dados atual
        const db = await readDatabase();

        // Encontra o usuário pelo nome
        const userIndex = db.users.findIndex(user => user.name === name);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Adiciona a nova tarefa ao usuário
        db.users[userIndex].tasks.push(task);

        // Salva o banco de dados atualizado no arquivo
        await saveDatabase(db);

        res.status(201).json({ message: 'Tarefa adicionada com sucesso.' });
    } catch (err) {
        console.error('Erro ao adicionar tarefa:', err);
        res.status(500).json({ error: 'Erro interno ao processar solicitação.' });
    }
});

// Rota para listar todas as tarefas de um usuário
app.get('/tasks/:name', async (req, res) => {
    const { name } = req.params;

    try {
        // Lê o banco de dados atual
        const db = await readDatabase();

        // Encontra o usuário pelo nome
        const user = db.users.find(user => user.name === name);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Retorna todas as tarefas do usuário
        const userTasks = user.tasks;

        res.status(200).json(userTasks);
    } catch (err) {
        console.error('Erro ao listar tarefas:', err);
        res.status(500).json({ error: 'Erro interno ao processar solicitação.' });
    }
});

// Inicializa o servidor e o banco de dados
initializeDatabase().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Erro ao inicializar o servidor:', err);
});
