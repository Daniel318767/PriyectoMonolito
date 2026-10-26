const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

afterAll(async () => {
  await pool.end();
});

test('GET /health debe responder correctamente', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body.servicio).toBe('usuarios');
});

test('GET /usuarios debe devolver una lista', async () => {
  const response = await request(app).get('/usuarios');
  expect(response.statusCode).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
  expect(response.body.length).toBeGreaterThan(0);
});

test('GET /usuarios/1 debe devolver un usuario existente', async () => {
  const response = await request(app).get('/usuarios/1');
  expect(response.statusCode).toBe(200);
  expect(response.body.id).toBe(1);
});

test('GET /usuarios/9999 debe responder 404', async () => {
  const response = await request(app).get('/usuarios/9999');
  expect(response.statusCode).toBe(404);
  expect(response.body.error).toBe('Usuario no encontrado');
});
