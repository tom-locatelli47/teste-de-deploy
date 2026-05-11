const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "app_db",
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 10000,
});

// Teste de conexão com o banco
pool.on("error", (err) => {
  console.error("Erro na conexão com o banco:", err);
});

async function healthCheck(req, res) {
  try {
    await pool.query("SELECT 1");
    res.json({
      message: "API e banco estão rodando!",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Health check do banco falhou:", err);
    res.status(503).json({
      error: "Banco indisponível",
      timestamp: new Date().toISOString(),
    });
  }
}

// Rota de saúde da API
app.get("/health", healthCheck);
app.get("/api/health", healthCheck);

// Rota para listar usuários
app.get("/api/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Rota para criar usuário
app.post("/api/usuarios", async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *",
      [nome, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Rota para obter usuário por ID
app.get("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// Rota para deletar usuário
app.delete("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao deletar usuário:", err);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
