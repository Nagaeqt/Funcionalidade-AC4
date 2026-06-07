let personaisDisponiveis = [];
let listaAgendamentos = [];

function inicializarAgendamentos() {
  redirecionarSeNaoLogado();

  carregarPersonaisParaAgendamento();
  carregarAgendamentosDoBanco();

  const selectPersonal = document.getElementById("personal_id");
  const quantidadeAulas = document.getElementById("quantidade_aulas");
  const form = document.getElementById("form-agendamento");

  if (selectPersonal) {
    selectPersonal.addEventListener("change", calcularValorAgendamento);
  }

  if (quantidadeAulas) {
    quantidadeAulas.addEventListener("input", calcularValorAgendamento);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      cadastrarAgendamento();
    });
  }
}

function pegarPersonalIdDaUrl() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("personal_id");
}

async function carregarPersonaisParaAgendamento() {
  try {
    personaisDisponiveis = await listarPersonaisAPI();

    const select = document.getElementById("personal_id");

    if (!select) return;

    select.innerHTML = '<option value="">Selecione um personal</option>';

    personaisDisponiveis.forEach((personal) => {
      const option = document.createElement("option");
      option.value = personal.id;
      option.textContent = `${personal.nome} - R$ ${Number(personal.valor_aula).toFixed(2)}`;
      select.appendChild(option);
    });

    const personalIdUrl = pegarPersonalIdDaUrl();

    if (personalIdUrl) {
      select.value = personalIdUrl;
      calcularValorAgendamento();
    }
  } catch (error) {
    console.error(error);
    mostrarMensagemAgendamento("Erro ao carregar personais.", true);
  }
}

async function carregarAgendamentosDoBanco() {
  try {
    listaAgendamentos = await listarAgendamentosAPI();
    renderizarAgendamentos();
  } catch (error) {
    console.error(error);
    mostrarMensagemAgendamento("Erro ao carregar agendamentos.", true);
  }
}

function calcularValorAgendamento() {
  const personalId = document.getElementById("personal_id").value;
  const quantidade = Number(document.getElementById("quantidade_aulas").value);

  const valorUnitarioInput = document.getElementById("valor_unitario");
  const valorTotalInput = document.getElementById("valor_total");

  const personal = personaisDisponiveis.find((p) => String(p.id) === String(personalId));

  if (!personal || !quantidade || quantidade < 1) {
    valorUnitarioInput.value = "R$ 0,00";
    valorTotalInput.value = "R$ 0,00";
    return;
  }

  const valorUnitario = Number(personal.valor_aula);
  const valorTotal = valorUnitario * quantidade;

  valorUnitarioInput.value = formatarMoeda(valorUnitario);
  valorTotalInput.value = formatarMoeda(valorTotal);
}

async function cadastrarAgendamento() {
  const personalId = document.getElementById("personal_id").value;
  const dataAgendamento = document.getElementById("data_agendamento").value;
  const horarioInicio = document.getElementById("horario_inicio").value;
  const quantidadeAulas = Number(document.getElementById("quantidade_aulas").value);
  const observacoes = document.getElementById("observacoes_agendamento").value.trim();

  if (!personalId || !dataAgendamento || !horarioInicio || !quantidadeAulas) {
    mostrarMensagemAgendamento("Preencha todos os campos obrigatórios.", true);
    return;
  }

  if (quantidadeAulas < 1) {
    mostrarMensagemAgendamento("A quantidade de aulas precisa ser pelo menos 1.", true);
    return;
  }

  const personal = personaisDisponiveis.find((p) => String(p.id) === String(personalId));

  if (!personal) {
    mostrarMensagemAgendamento("Personal trainer inválido.", true);
    return;
  }

  const valorUnitario = Number(personal.valor_aula);
  const valorTotal = valorUnitario * quantidadeAulas;
  const horarioFim = calcularHorarioFim(horarioInicio, quantidadeAulas);

  const novoAgendamento = {
    personal_id: personal.id,
    data_agendamento: dataAgendamento,
    horario_inicio: horarioInicio,
    horario_fim: horarioFim,
    quantidade_aulas: quantidadeAulas,
    duracao_aula: 60,
    valor_unitario: valorUnitario,
    valor_total: valorTotal,
    observacoes
  };

  try {
    await cadastrarAgendamentoAPI(novoAgendamento);

    document.getElementById("form-agendamento").reset();
    document.getElementById("valor_unitario").value = "R$ 0,00";
    document.getElementById("valor_total").value = "R$ 0,00";

    mostrarMensagemAgendamento("Agendamento realizado com sucesso!");
    carregarAgendamentosDoBanco();
  } catch (error) {
    console.error(error);
    mostrarMensagemAgendamento(error.message || "Erro ao cadastrar agendamento.", true);
  }
}

function calcularHorarioFim(horarioInicio, quantidadeAulas) {
  const [hora, minuto] = horarioInicio.split(":").map(Number);

  const data = new Date();
  data.setHours(hora);
  data.setMinutes(minuto);
  data.setSeconds(0);

  data.setMinutes(data.getMinutes() + quantidadeAulas * 60);

  const horaFim = String(data.getHours()).padStart(2, "0");
  const minutoFim = String(data.getMinutes()).padStart(2, "0");

  return `${horaFim}:${minutoFim}`;
}

function renderizarAgendamentos() {
  const container = document.getElementById("lista-agendamentos");

  if (!container) return;

  if (listaAgendamentos.length === 0) {
    container.innerHTML = '<p class="info-session">Nenhum agendamento realizado.</p>';
    return;
  }

  container.innerHTML = "";

  listaAgendamentos.forEach((agendamento) => {
    const card = document.createElement("div");
    card.className = "treino-card";

    card.innerHTML = `
      <div class="treino-topo">
        <div>
          <h4>${agendamento.personal_nome}</h4>
          <span class="treino-badge">${agendamento.status}</span>
        </div>
      </div>

      <div class="treino-grid">
        <p><strong>Data:</strong> ${formatarData(agendamento.data_agendamento)}</p>
        <p><strong>Horário:</strong> ${formatarHora(agendamento.horario_inicio)} até ${formatarHora(agendamento.horario_fim)}</p>
        <p><strong>Quantidade:</strong> ${agendamento.quantidade_aulas} aula(s)</p>
        <p><strong>Duração:</strong> ${agendamento.quantidade_aulas * 60} minutos</p>
        <p><strong>Valor unitário:</strong> ${formatarMoeda(agendamento.valor_unitario)}</p>
        <p><strong>Valor total:</strong> ${formatarMoeda(agendamento.valor_total)}</p>
      </div>

      <p class="treino-data">
        <strong>Observações:</strong> ${agendamento.observacoes || "Sem observações"}
      </p>

      <div class="acoes-treino">
        <button type="button" class="btn-acao excluir" onclick="excluirAgendamento(${agendamento.id})">
          Cancelar
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

async function excluirAgendamento(id) {
  const confirmar = confirm("Deseja cancelar este agendamento?");

  if (!confirmar) return;

  try {
    await excluirAgendamentoAPI(id);
    carregarAgendamentosDoBanco();
    mostrarMensagemAgendamento("Agendamento cancelado com sucesso!");
  } catch (error) {
    console.error(error);
    mostrarMensagemAgendamento("Erro ao cancelar agendamento.", true);
  }
}

function mostrarMensagemAgendamento(texto, erro = false) {
  const mensagem = document.getElementById("mensagem-agendamento");

  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.style.color = erro ? "#ff8f8f" : "#7CFC98";

  setTimeout(() => {
    mensagem.textContent = "";
  }, 3000);
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function formatarData(data) {
  if (!data) return "-";

  const dataApenas = data.split("T")[0];
  const [ano, mes, dia] = dataApenas.split("-");

  return `${dia}/${mes}/${ano}`;
}

function formatarHora(hora) {
  if (!hora) return "-";

  return hora.substring(0, 5);
}