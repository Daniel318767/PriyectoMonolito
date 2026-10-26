const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'usuarios' });
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al consultar usuarios'
    });
  }
});


// POST - Crear un usuario
app.post('/usuarios', async (req, res) => {
  const { nombre, email } = req.body;
  if (!nombre || !email) {
    return res.status(400).json({
      error: 'Nombre y email son obligatorios'
    });
  }
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *',
      [nombre, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT - Actualizar un usuario
app.put('/usuarios/:id', async (req, res) => {
  const { nombre, email } = req.body;
  const { id } = req.params;
  if (!nombre || !email) {
    return res.status(400).json({
      error: 'Nombre y email son obligatorios'
    });
  }
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *',
      [nombre, email, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE - Eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado', usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'No se puede eliminar porque tiene pedidos asociados'
      });
    }
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});


app.get('/usuarios/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar usuario' });
  }
});

module.exports = app;
