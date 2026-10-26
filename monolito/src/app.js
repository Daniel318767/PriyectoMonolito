const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ estado: 'ok' });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      estado: 'ok',
      mensaje: 'Conexión con PostgreSQL correcta',
      fecha: result.rows[0].now
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'No se pudo conectar con PostgreSQL'
    });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar usuarios' });
  }
});

app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM product');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar pedidos' });
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


// ==================== PRODUCTOS ====================

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
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'No se puede eliminar un producto asociado a pedidos'
      });
    }
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ==================== PEDIDOS ====================

// POST - Crear un pedido
app.post('/pedidos', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;
  if (![usuario_id, producto_id, cantidad].every(valor => Number.isInteger(Number(valor)) && Number(valor) > 0)) {
    return res.status(400).json({
      error: 'usuario_id, producto_id y cantidad deben ser enteros positivos'
    });
  }
  try {
    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, producto_id, cantidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'El usuario o producto indicado no existe'
      });
    }
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// PUT - Actualizar un pedido
app.put('/pedidos/:id', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;
  const { id } = req.params;
  if (![usuario_id, producto_id, cantidad].every(valor => Number.isInteger(Number(valor)) && Number(valor) > 0)) {
    return res.status(400).json({
      error: 'usuario_id, producto_id y cantidad deben ser enteros positivos'
    });
  }
  try {
    const result = await pool.query(
      'UPDATE pedidos SET usuario_id = $1, producto_id = $2, cantidad = $3 WHERE id = $4 RETURNING *',
      [usuario_id, producto_id, cantidad, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'El usuario o producto indicado no existe'
      });
    }
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

// DELETE - Eliminar un pedido
app.delete('/pedidos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM pedidos WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido eliminado', pedido: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

module.exports = app;
