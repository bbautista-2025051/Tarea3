-- =========================================================
-- Script de inicializacion de base de datos
-- Aplicacion de administracion de clientes
-- =========================================================

-- 1) Crear la base de datos
-- IMPORTANTE: este comando debe ejecutarse conectado a la base
-- "postgres" (u otra), NO se puede ejecutar CREATE DATABASE dentro
-- de un bloque transaccional junto a otros comandos.
-- Ejecutar por separado si tu cliente psql no lo permite en el mismo script.

CREATE DATABASE aplicacion_clientes;

-- Luego de crear la base, conectate a ella, por ejemplo:
-- \c aplicacion_clientes

-- =========================================================
-- 2) Crear la tabla clientes
-- =========================================================

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    codigo_cliente VARCHAR(50) NOT NULL UNIQUE,
    nombre_cliente VARCHAR(150) NOT NULL,
    direccion_cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_codigo_cliente ON clientes (codigo_cliente);

-- =========================================================
-- 3) Datos de prueba (opcionales)
-- =========================================================

INSERT INTO clientes (codigo_cliente, nombre_cliente, direccion_cliente, telefono)
VALUES
    ('CLI-001', 'Juan Perez', 'Zona 10, Ciudad de Guatemala', '502-2222-1111'),
    ('CLI-002', 'Maria Lopez', 'Zona 4, Mixco', '502-3333-4444'),
    ('CLI-003', 'Carlos Ramirez', 'Zona 1, Antigua Guatemala', '502-5555-6666')
ON CONFLICT (codigo_cliente) DO NOTHING;
