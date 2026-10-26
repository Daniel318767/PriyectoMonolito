const express = require('express');
const pool = require('./db');

const app = express();

async function validarReferencias(usuarioId, productoId) {
  const [usuario, producto] = await Promise.all([
    fetch(`${process.env.USUARIOS_URL}/usuarios/${usuarioId}`),
    fetch(`${process.env.PRODUCTOS_URL}/productos/${productoId}`)
  ]);

  if (usuario.status === 404 || producto.status === 404) {
    return false;
  }

  if (!usuario.ok || !producto.ok) {
    throw new Error('Error al consultar Usuarios o Productos');
  }

  return true;
}


app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'pedidos' });
});

app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al consultar pedidos'
    });
  }
});

// POST - Crear un pedido
app.post('/pedidos', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  if (![usuario_id, producto_id, cantidad].every(valor => Number.isInteger(Number(valor)) && Number(valor) > 0)) {
    return res.status(400).json({
      error: 'usuario_id, producto_id y cantidad deben ser enteros positivos'
    });
  }

  try {
    const referenciasValidas = await validarReferencias(usuario_id, producto_id);
    if (!referenciasValidas) {
      return res.status(400).json({
        error: 'El usuario o producto indicado no existe'
      });
    }

    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, producto_id, cantidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
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
    const referenciasValidas = await validarReferencias(usuario_id, producto_id);
    if (!referenciasValidas) {
      return res.status(400).json({
        error: 'El usuario o producto indicado no existe'
      });
    }

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
