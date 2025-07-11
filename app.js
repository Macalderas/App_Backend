import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';

const app = express();
app.use(cors());
app.use(express.json());

// Cambia aquí por tu usuario y contraseña reales de MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2014',
  database: 'sistema_asistencia'
});

// RUTA PARA REGISTRAR PROFESOR
app.post('/profesores', (req, res) => {
  const { correo, password, nivel, grados } = req.body;

  const query = 'INSERT INTO profesores (correo, password, nivel, grados) VALUES (?, ?, ?, ?)';
  db.query(query, [correo, password, nivel, grados.join(',')], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar' });
    res.status(201).json({ mensaje: 'Profesor registrado correctamente' });
  });
});

// RUTA PARA LOGIN DE PROFESOR
app.post('/profesores/login', (req, res) => {
  const { correo, password } = req.body;

  const query = 'SELECT * FROM profesores WHERE correo = ? AND password = ?';
  db.query(query, [correo, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en login' });
    if (results.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const profesor = results[0];
    profesor.grados = profesor.grados.split(',');
    res.json(profesor);
  });
});

// INICIAR SERVIDOR
app.listen(3000, () => {
  console.log('Servidor backend escuchando en puerto 3000');
});
