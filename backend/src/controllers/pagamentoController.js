const pool = require("../config/db");

const registrarPagamento = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const {
      agendamento_id,
      valor_pago,
      forma_pagamento
    } = req.body;

    if (!agendamento_id || !valor_pago || !forma_pagamento) {
      return res.status(400).json({
        mensagem: "Preencha todos os campos obrigatórios do pagamento."
      });
    }

    const agendamentoExiste = await pool.query(
      `SELECT id, valor_total
       FROM agendamentos_treino
       WHERE id = $1 AND usuario_id = $2`,
      [agendamento_id, usuario_id]
    );

    if (agendamentoExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Agendamento não encontrado."
      });
    }

    const pagamentoExistente = await pool.query(
      `SELECT id
       FROM pagamentos_treino
       WHERE agendamento_id = $1 AND usuario_id = $2`,
      [agendamento_id, usuario_id]
    );

    if (pagamentoExistente.rows.length > 0) {
      return res.status(400).json({
        mensagem: "Este agendamento já possui pagamento registrado."
      });
    }

    const resultado = await pool.query(
      `INSERT INTO pagamentos_treino (
        usuario_id,
        agendamento_id,
        valor_pago,
        forma_pagamento,
        status_pagamento
      )
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *`,
      [
        usuario_id,
        agendamento_id,
        valor_pago,
        forma_pagamento,
        "pago"
      ]
    );

    res.status(201).json({
      mensagem: "Pagamento registrado com sucesso!",
      pagamento: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao registrar pagamento.",
      erro: error.message
    });
  }
};

const listarPagamentos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado = await pool.query(
      `SELECT
          pg.id,
          pg.usuario_id,
          pg.agendamento_id,
          pg.valor_pago,
          pg.forma_pagamento,
          pg.status_pagamento,
          pg.data_pagamento,
          a.data_agendamento,
          a.horario_inicio,
          a.horario_fim,
          a.quantidade_aulas,
          a.valor_unitario,
          a.valor_total,
          a.observacoes,
          p.nome AS personal_nome,
          p.especializacao AS personal_especializacao,
          p.localizacao AS personal_localizacao,
          p.telefone AS personal_telefone,
          p.foto AS personal_foto
       FROM pagamentos_treino pg
       JOIN agendamentos_treino a ON pg.agendamento_id = a.id
       JOIN personal_trainers p ON a.personal_id = p.id
       WHERE pg.usuario_id = $1
       ORDER BY pg.data_pagamento DESC, pg.id DESC`,
      [usuario_id]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar pagamentos.",
      erro: error.message
    });
  }
};

const excluirPagamento = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const pagamentoId = req.params.id;

    const resultado = await pool.query(
      `DELETE FROM pagamentos_treino
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [pagamentoId, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Pagamento não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Pagamento excluído com sucesso!"
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao excluir pagamento.",
      erro: error.message
    });
  }
};

module.exports = {
  registrarPagamento,
  listarPagamentos,
  excluirPagamento
};