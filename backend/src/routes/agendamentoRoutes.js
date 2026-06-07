const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/authMiddleware");

const {
  cadastrarAgendamento,
  listarAgendamentos,
  excluirAgendamento
} = require("../controllers/agendamentoController");

router.get("/", verificarToken, listarAgendamentos);
router.post("/", verificarToken, cadastrarAgendamento);
router.delete("/:id", verificarToken, excluirAgendamento);

module.exports = router;