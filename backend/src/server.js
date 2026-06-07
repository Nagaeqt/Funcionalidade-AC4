require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const academyRoutes = require("./routes/academyRoutes");
const authRoutes = require("./routes/authRoutes");
const trainingRoutes = require("./routes/trainingRoutes");
const personalTrainerRoutes = require("./routes/personalTrainerRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/academy", academyRoutes);
app.use("/auth", authRoutes);
app.use("/treinos", trainingRoutes);
app.use("/personal-trainers", personalTrainerRoutes);
app.use("/agendamentos", agendamentoRoutes);
app.use("/pagamentos", pagamentoRoutes);

app.get("/", (req, res) => {
  res.json({ mensagem: "API PowerGym funcionando!" });
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      mensagem: "Banco conectado com sucesso",
      hora_servidor: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao conectar no banco",
      detalhe: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});