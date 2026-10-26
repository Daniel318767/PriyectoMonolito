CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL
);

INSERT INTO usuarios (nombre, email) VALUES
('Ana Torres', 'ana@correo.com'),
('Luis Pérez', 'luis@correo.com'),
('Carlos Mendoza', 'carlos@correo.com');

INSERT INTO productos (nombre, precio) VALUES
('Laptop', 2500.00),
('Teclado', 120.00),
('Mouse', 80.00);

INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 1);
