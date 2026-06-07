const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/authMiddleware");

const {
  cadastrar,
  login,
  recuperarSenha,
  buscarPerfil,
  atualizarPerfil
} = require("../controllers/authController");

router.post("/cadastro", cadastrar);
router.post("/login", login);
router.post("/recuperar-senha", recuperarSenha);

router.get("/perfil", verificarToken, buscarPerfil);
router.put("/perfil", verificarToken, atualizarPerfil);

module.exports = router;
