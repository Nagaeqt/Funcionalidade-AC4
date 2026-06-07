const pool = require("../config/db");

const cadastrarPersonalTrainer = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const {
      nome,
      especializacao,
      localizacao,
      descricao,
      valor_aula,
      telefone,
      foto
    } = req.body;

    if (!nome || !especializacao || !localizacao || !descricao || !valor_aula || !telefone || !foto) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos obrigatórios do personal trainer."
      });
    }

    const resultado = await pool.query(
      `INSERT INTO personal_trainers (
        usuario_id,
        nome,
        especializacao,
        localizacao,
        descricao,
        valor_aula,
        telefone,
        foto
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        usuario_id,
        nome,
        especializacao,
        localizacao,
        descricao,
        valor_aula,
        telefone,
        foto
      ]
    );

    res.status(201).json({
      mensagem: "Personal trainer cadastrado com sucesso!",
      personal: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao cadastrar personal trainer.",
      erro: error.message
    });
  }
};

const listarPersonalTrainers = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado = await pool.query(
      `SELECT *
       FROM personal_trainers
       WHERE usuario_id = $1
       ORDER BY data_criacao DESC, id DESC`,
      [usuario_id]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar personal trainers.",
      erro: error.message
    });
  }
};

const excluirPersonalTrainer = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const personalId = req.params.id;

    const resultado = await pool.query(
      `DELETE FROM personal_trainers
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [personalId, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Personal trainer não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Personal trainer excluído com sucesso!"
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao excluir personal trainer.",
      erro: error.message
    });
  }
};

module.exports = {
  cadastrarPersonalTrainer,
  listarPersonalTrainers,
  excluirPersonalTrainer
};