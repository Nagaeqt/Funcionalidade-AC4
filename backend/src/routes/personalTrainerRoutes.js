const express = require("express");
const router = express.Router();

const verificarToken = require("../middleware/authMiddleware");
const {
  cadastrarPersonalTrainer,
  listarPersonalTrainers,
  excluirPersonalTrainer
} = require("../controllers/personalTrainerController");

router.get("/", verificarToken, listarPersonalTrainers);
router.post("/", verificarToken, cadastrarPersonalTrainer);
router.delete("/:id", verificarToken, excluirPersonalTrainer);

module.exports = router;