const pool = require("../config/db");

const listarPlanos = async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM planos ORDER BY id");
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar planos.",
      erro: error.message
    });
  }
};

const listarUnidades = async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM unidades ORDER BY id");
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar unidades.",
      erro: error.message
    });
  }
};

const listarTreinos = async (req, res) => {
  try {
    const resultado = await pool.query("SELECT * FROM treinos ORDER BY id");
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar treinos.",
      erro: error.message
    });
  }
};

module.exports = {
  listarPlanos,
  listarUnidades,
  listarTreinos
};