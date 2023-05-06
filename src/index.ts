import dotenv from 'dotenv';
import express from 'express';

import { pool } from './db';

dotenv.config();
const PORT = process.env.PORT ?? 8080;
const app = express();

app.get('/todos', async (req, res) => {
  try {
    const todos = await pool.query('SELECT * FROM todos');
    res.status(201).json(todos.rows);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
