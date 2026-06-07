const pool = require("../config/db");

const cadastrarTreino = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const {
      dia_da_semana,
      tipo_de_treino,
      foco_do_treino,
      exercicio,
      carga,
      series,
      repeticoes,
      tempo_descanso,
      peso_corporal,
      altura,
      observacoes,
      data_treino
    } = req.body;

    if (!dia_da_semana || !tipo_de_treino || !foco_do_treino || !exercicio || !data_treino) {
      return res.status(400).json({
        mensagem: "Preencha os campos obrigatórios do treino, incluindo a data do treino."
      });
    }

    const resultado = await pool.query(
      `INSERT INTO treinos (
        usuario_id,
        dia_da_semana,
        tipo_de_treino,
        foco_do_treino,
        exercicio,
        carga,
        series,
        repeticoes,
        tempo_descanso,
        peso_corporal,
        altura,
        observacoes,
        data_treino
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        usuario_id,
        dia_da_semana,
        tipo_de_treino,
        foco_do_treino,
        exercicio,
        carga || null,
        series || null,
        repeticoes || null,
        tempo_descanso || null,
        peso_corporal || null,
        altura || null,
        observacoes || null,
        data_treino
      ]
    );

    res.status(201).json({
      mensagem: "Treino cadastrado com sucesso!",
      treino: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao cadastrar treino.",
      erro: error.message
    });
  }
};

const listarTreinos = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const resultado = await pool.query(
      `SELECT *
       FROM treinos
       WHERE usuario_id = $1
       ORDER BY data_treino DESC, COALESCE(data_atualizacao, data_registro) DESC, id DESC`,
      [usuario_id]
    );

    res.status(200).json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao listar treinos.",
      erro: error.message
    });
  }
};

const atualizarTreino = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const treinoId = req.params.id;

    const {
      dia_da_semana,
      tipo_de_treino,
      foco_do_treino,
      exercicio,
      carga,
      series,
      repeticoes,
      tempo_descanso,
      peso_corporal,
      altura,
      observacoes,
      data_treino
    } = req.body;

    const treinoExiste = await pool.query(
      "SELECT id FROM treinos WHERE id = $1 AND usuario_id = $2",
      [treinoId, usuario_id]
    );

    if (treinoExiste.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Treino não encontrado."
      });
    }

    const resultado = await pool.query(
      `UPDATE treinos
       SET dia_da_semana = $1,
           tipo_de_treino = $2,
           foco_do_treino = $3,
           exercicio = $4,
           carga = $5,
           series = $6,
           repeticoes = $7,
           tempo_descanso = $8,
           peso_corporal = $9,
           altura = $10,
           observacoes = $11,
           data_treino = $12,
           data_atualizacao = CURRENT_TIMESTAMP
       WHERE id = $13 AND usuario_id = $14
       RETURNING *`,
      [
        dia_da_semana,
        tipo_de_treino,
        foco_do_treino,
        exercicio,
        carga || null,
        series || null,
        repeticoes || null,
        tempo_descanso || null,
        peso_corporal || null,
        altura || null,
        observacoes || null,
        data_treino,
        treinoId,
        usuario_id
      ]
    );

    res.status(200).json({
      mensagem: "Treino atualizado com sucesso!",
      treino: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao atualizar treino.",
      erro: error.message
    });
  }
};

const excluirTreino = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const treinoId = req.params.id;

    const resultado = await pool.query(
      `DELETE FROM treinos
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [treinoId, usuario_id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Treino não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Treino excluído com sucesso!"
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao excluir treino.",
      erro: error.message
    });
  }
};

module.exports = {
  cadastrarTreino,
  listarTreinos,
  atualizarTreino,
  excluirTreino
};