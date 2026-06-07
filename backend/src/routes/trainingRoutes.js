const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/authMiddleware");
const {
  cadastrarTreino,
  listarTreinos,
  atualizarTreino,
  excluirTreino
} = require("../controllers/trainingController");

router.get("/", verificarToken, listarTreinos);
router.post("/", verificarToken, cadastrarTreino);
router.put("/:id", verificarToken, atualizarTreino);
router.delete("/:id", verificarToken, excluirTreino);

module.exports = router;
