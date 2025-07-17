import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import dotenv from 'dotenv';  

dotenv.config();              
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


app.get('/', (req, res) => {
  res.send('Backend en línea 🚀');
});


// Registrar profesor
app.post('/profesores', (req, res) => {
  const { correo, password, nivel, grados } = req.body;
  const query = 'INSERT INTO profesores (correo, password, nivel, grados) VALUES (?, ?, ?, ?)';
  db.query(query, [correo, password, nivel, grados.join(',')], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar' });
    res.status(201).json({ mensaje: 'Profesor registrado correctamente' });
  });
});

// Login profesor
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

// Validar contraseña de profesor (para confirmar acciones como eliminar)
app.post('/profesores/validar', (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos' });
  }

  const query = 'SELECT * FROM profesores WHERE correo = ? AND password = ?';
  db.query(query, [correo, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error del servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    res.json({ mensaje: 'Validación exitosa' });
  });
});



// Registrar alumno
app.post('/alumnos', (req, res) => {
  const { nombre, grado, correoProfesor } = req.body;
  const query = 'INSERT INTO alumnos (nombre, grado, correo_profesor, asistencias, uniforme) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [nombre, grado, correoProfesor, JSON.stringify([]), JSON.stringify([])], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar alumno' });
    res.status(201).json({ mensaje: 'Alumno registrado correctamente', id: result.insertId });
  });
});

// Obtener alumnos de un profesor
app.get('/alumnos', (req, res) => {
  const correoProfesor = req.query.correo;
  if (!correoProfesor) return res.status(400).json({ error: 'Falta correo de profesor' });

  const query = 'SELECT * FROM alumnos WHERE correo_profesor = ?';
  db.query(query, [correoProfesor], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener alumnos' });

    const alumnos = results.map(a => ({
      ...a,
      asistencias: a.asistencias ? JSON.parse(a.asistencias) : [],
      uniforme: a.uniforme ? JSON.parse(a.uniforme) : []
    }));

    res.json(alumnos);
  });
});


// Actualizar asistencias de alumno
app.put('/alumnos/:id/asistencia', (req, res) => {
  const id = req.params.id;
  const { asistencias } = req.body;
  if (!Array.isArray(asistencias)) return res.status(400).json({ error: 'Asistencias debe ser arreglo' });

  const query = 'UPDATE alumnos SET asistencias = ? WHERE id = ?';
  db.query(query, [JSON.stringify(asistencias), id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar asistencia' });
    res.json({ mensaje: 'Asistencia actualizada correctamente' });
  });
});


app.put('/alumnos/:id/uniforme', (req, res) => {
  const id = req.params.id;
  const { uniforme } = req.body;
  if (!Array.isArray(uniforme)) return res.status(400).json({ error: 'Uniforme debe ser un arreglo' });

  const query = 'UPDATE alumnos SET uniforme = ? WHERE id = ?';
  db.query(query, [JSON.stringify(uniforme), id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar uniforme' });
    res.json({ mensaje: 'Uniforme actualizado correctamente' });
  });
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});