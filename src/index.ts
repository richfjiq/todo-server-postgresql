import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { pool } from './db';

interface Task {
  date: string | Date;
  id?: string;
  progress: string;
  title: string;
  user_email: string;
}

dotenv.config();
const PORT = process.env.PORT ?? 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/todos/:userEmail', async (req: Request, res: Response) => {
  const { userEmail } = req.params;

  try {
    const todos = await pool.query(
      'SELECT * FROM todos WHERE user_email = $1',
      [userEmail]
    );
    res.status(201).json(todos.rows);
  } catch (error) {
    console.error(error);
  }
});

app.post('/todos', async (req: Request, res: Response) => {
  const { user_email, title, progress, date } = req.body as Task;
  const id = uuidv4();

  console.log(user_email, title, progress, date);
  try {
    const todos = await pool.query(
      `INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5)`,
      [id, user_email, title, progress, date]
    );
    res.status(200).json({ message: 'Todo posted.' });
  } catch (error) {
    console.error(error);
  }
});

app.put('/todos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_email, title, progress, date } = req.body as Task;

  try {
    const editTodo = await pool.query(
      'UPDATE todos SET user_email = $1, title = $2, progress = $3, date = $4 WHERE id = $5',
      [user_email, title, progress, date, id]
    );
    res.status(200).json(editTodo);
  } catch (error) {
    console.error(error);
  }
});

app.delete('/todos/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deleteTodo = await pool.query('DELETE FROM todos WHERE id = $1', [
      id,
    ]);
    res.status(200).json(deleteTodo);
  } catch (error) {
    console.error(error);
  }
});

app.post('/todos/signup', async (req, res) => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    const signup = await pool.query(
      `INSERT INTO users (email, hashed_password) VALUES($1, $2)`,
      [email, hashedPassword]
    );

    const token = jwt.sign({ email }, process.env.SECRET_JWT ?? '', {
      expiresIn: '1d',
    });

    res.status(200).json({ email, token });
  } catch (error) {
    res.status(403).json({ message: 'Email already exists.' });
    console.error(error);
  }
});

app.post('/todos/login', async (req, res) => {
  const { email, password } = req.body;

  try {
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
