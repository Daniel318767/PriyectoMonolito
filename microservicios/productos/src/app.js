const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'productos' });
});

app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al consultar productos'
    });
  }
});


// POST - Crear un producto
app.post('/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  if (!nombre || precio === undefined || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({
      error: 'Nombre y precio válido son obligatorios'
    });
  }
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT - Actualizar un producto
app.put('/productos/:id', async (req, res) => {
  const { nombre, precio } = req.body;
  const { id } = req.params;
  if (!nombre || precio === undefined || !Number.isFinite(Number(precio)) || Number(precio) < 0) {
    return res.status(400).json({
      error: 'Nombre y precio válido son obligatorios'
    });
  }
  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, precio = $2 WHERE id = $3 RETURNING *',
      [nombre, precio, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE - Eliminar un producto
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM productos WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado', producto: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});


app.get('/productos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar producto' });
  }
});

module.exports = app;
