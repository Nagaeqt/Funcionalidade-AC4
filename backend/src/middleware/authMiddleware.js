const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token não fornecido." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ mensagem: "Token inválido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado." });
  }
};

module.exports = verificarToken;