const request = require('supertest');
const app = require('../src/app');

test('GET /health debe responder correctamente', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body.estado).toBe('ok');
});

test('GET /usuarios debe devolver usuarios', async () => {
  const response = await request(app).get('/usuarios');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});

test('GET /productos debe devolver productos', async () => {
  const response = await request(app).get('/productos');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});

test('GET /pedidos debe devolver pedidos', async () => {
  const response = await request(app).get('/pedidos');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});
