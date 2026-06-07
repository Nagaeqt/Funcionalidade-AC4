const express = require("express");
const router = express.Router();

const {
  listarPlanos,
  listarUnidades,
  listarTreinos
} = require("../controllers/academyController");

router.get("/planos", listarPlanos);
router.get("/unidades", listarUnidades);
router.get("/treinos", listarTreinos);

module.exports = router;