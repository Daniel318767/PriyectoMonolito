const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

afterAll(async () => {
  await pool.end();
});

test('GET /health debe responder correctamente', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body.servicio).toBe('pedidos');
});

test('GET /pedidos debe devolver una lista', async () => {
  const response = await request(app).get('/pedidos');
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(0);
});

test('POST /pedidos debe crear un pedido válido', async () => {
  let pedidoId;
  try {
    const response = await request(app)
      .post('/pedidos')
      .send({ usuario_id: 1, producto_id: 1, cantidad: 1 });
    pedidoId = response.body.id;
    expect(response.statusCode).toBe(201);
    expect(pedidoId).toBeDefined();
  } finally {
    if (pedidoId) {
      await pool.query('DELETE FROM pedidos WHERE id = $1', [pedidoId]);
    }
  }
});

test('POST /pedidos debe rechazar un usuario inexistente', async () => {
  const response = await request(app)
    .post('/pedidos')
    .send({ usuario_id: 9999, producto_id: 1, cantidad: 1 });
  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBe('El usuario o producto indicado no existe');
});

test('POST /pedidos debe rechazar un producto inexistente', async () => {
  const response = await request(app)
    .post('/pedidos')
    .send({ usuario_id: 1, producto_id: 9999, cantidad: 1 });
  expect(response.statusCode).toBe(400);
  expect(response.body.error).toBe('El usuario o producto indicado no existe');
});
