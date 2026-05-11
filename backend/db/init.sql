-- Script de inicialização do banco de dados

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO usuarios (nome, email) VALUES 
  ('João Silva', 'joao@example.com'),
  ('Maria Santos', 'maria@example.com'),
  ('Pedro Oliveira', 'pedro@example.com')
ON CONFLICT DO NOTHING;
