const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "powergym_segredo";

const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, objetivo, plano_id } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "Nome, e-mail e senha são obrigatórios."
      });
    }

    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        mensagem: "Já existe uma conta com esse e-mail."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, objetivo, plano_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, objetivo, plano_id, peso_corporal, altura`,
      [nome, email, senhaHash, objetivo || null, plano_id || null]
    );

    res.status(201).json({
      mensagem: "Conta criada com sucesso!",
      usuario: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao cadastrar usuário.",
      erro: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "Informe e-mail e senha."
      });
    }

    const resultado = await pool.query(
      `SELECT id, nome, email, senha, objetivo, plano_id, peso_corporal, altura
       FROM usuarios
       WHERE email = $1`,
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const usuario = resultado.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    delete usuario.senha;

    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao realizar login.",
      erro: error.message
    });
  }
};

const recuperarSenha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        mensagem: "Informe o e-mail."
      });
    }

    const resultado = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "E-mail não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Solicitação recebida. Em um sistema real, um link seria enviado para o e-mail informado."
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao processar recuperação de senha.",
      erro: error.message
    });
  }
};

const buscarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      `SELECT id, nome, email, objetivo, plano_id, peso_corporal, altura, criado_em
       FROM usuarios
       WHERE id = $1`,
      [usuarioId]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado."
      });
    }

    res.status(200).json({
      mensagem: "Perfil carregado com sucesso.",
      usuario: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao carregar perfil.",
      erro: error.message
    });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nome, email, objetivo, peso_corporal, altura } = req.body;

    if (!nome || !email) {
      return res.status(400).json({
        mensagem: "Nome e e-mail são obrigatórios."
      });
    }

    const emailEmUso = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1 AND id <> $2",
      [email, usuarioId]
    );

    if (emailEmUso.rows.length > 0) {
      return res.status(409).json({
        mensagem: "Esse e-mail já está sendo usado por outro usuário."
      });
    }

    const resultado = await pool.query(
      `UPDATE usuarios
       SET nome = $1,
           email = $2,
           objetivo = $3,
           peso_corporal = $4,
           altura = $5
       WHERE id = $6
       RETURNING id, nome, email, objetivo, plano_id, peso_corporal, altura`,
      [
        nome,
        email,
        objetivo || null,
        peso_corporal || null,
        altura || null,
        usuarioId
      ]
    );

    res.status(200).json({
      mensagem: "Perfil atualizado com sucesso!",
      usuario: resultado.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      mensagem: "Erro ao atualizar perfil.",
      erro: error.message
    });
  }
};

module.exports = {
  cadastrar,
  login,
  recuperarSenha,
  buscarPerfil,
  atualizarPerfil
};
