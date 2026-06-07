const pool = require("../config/db");

const cadastrarAgendamento = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const {
      personal_id,
      data_agendamento,
      horario_inicio,
      horario_fim,
      quantidade_aulas,
      duracao_aula,
      valor_unitario,
      valor_total,
      observacoes
    } = req.body;

    if (
      !personal_id ||
      !data_agendamento ||
      !horario_inicio ||
      !horario_fim ||
      !quantidade_aulas ||
      !valor_unitario ||
      !valor_total
    ) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos obrigatórios do agendamento."
      });
    }

    const resultado = await pool.query(
      `INSERT INTO agendamentos_treino (
        usuario_id,
        personal_id,
        data_agendamento,
        horario_inicio,
        horario_fim,
        quantidade_aulas,
        duracao_aula,
        valor_unitario,
        valor_total,
        observacoes,
        status
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        usuario_id,
        personal_id,
        data_agendamento,
        horario_inicio,
        horario_fim,
        quantidade_aulas,
        duracao_aula || 60,
        valor_unitario,
        valor_total,
        observacoes || null,
        "agendado"
      ]
    );

    res.status(201).json({
      mensagem: "Agendamento realizado com sucesso!",
      agendamento: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao cadastrar agendamento.",
      erro: error.message
    });
  }
};

const listarAgendamentos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado = await pool.query(
      `SELECT
          a.id,
          a.usuario_id,
          a.personal_id,
          p.nome AS personal_nome,
          p.especializacao,
          p.localizacao,
          a.data_agendamento,
          a.horario_inicio,
          a.horario_fim,
          a.quantidade_aulas,
          a.duracao_aula,
          a.valor_unitario,
          a.valor_total,
          a.observacoes,
          a.status,
          a.data_criacao
       FROM agendamentos_treino a
       JOIN personal_trainers p ON a.personal_id = p.id
       WHERE a.usuario_id = $1
       ORDER BY a.data_agendamento DESC, a.horario_inicio DESC, a.id DESC`,
      [usuario_id]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar agendamentos.",
      erro: error.message
    });
  }
};

const excluirAgendamento = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const agendamentoId = req.params.id;

    const resultado = await pool.query(
      `DELETE FROM agendamentos_treino
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [agendamentoId, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Agendamento não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Agendamento cancelado com sucesso!"
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao cancelar agendamento.",
      erro: error.message
    });
  }
};

module.exports = {
  cadastrarAgendamento,
  listarAgendamentos,
  excluirAgendamento
};