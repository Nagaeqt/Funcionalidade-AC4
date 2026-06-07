const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/authMiddleware");

const {
  registrarPagamento,
  listarPagamentos,
  excluirPagamento
} = require("../controllers/pagamentoController");

router.get("/", verificarToken, listarPagamentos);

router.post("/", verificarToken, registrarPagamento);

router.delete("/:id", verificarToken, excluirPagamento);

module.exports = router;