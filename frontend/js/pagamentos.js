let agendamentosDisponiveis = [];
let pagamentosRealizados = [];

const ADMIN_USUARIO_PAGAMENTO = "admin";
const ADMIN_SENHA_PAGAMENTO = "admin123";
const CHAVE_ADMIN_PAGAMENTO_ATIVO = "powergym_admin_pagamento_ativo";

function inicializarPagamentos() {
  redirecionarSeNaoLogado();

  criarPainelAdminPagamentos();
  atualizarInterfaceAdminPagamentos();

  carregarAgendamentosParaPagamento();
  carregarPagamentos();

  const selectAgendamento = document.getElementById("agendamento_id");
  const form = document.getElementById("form-pagamento");

  if (selectAgendamento) {
    selectAgendamento.addEventListener("change", preencherDadosAgendamento);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      registrarPagamento();
    });
  }
}

function criarPainelAdminPagamentos() {
  const listaPagamentos = document.getElementById("lista-pagamentos");
  if (!listaPagamentos) return;

  const section = listaPagamentos.closest(".section");
  if (!section) return;

  const sectionHeader = section.querySelector(".section-header");
  if (!sectionHeader) return;

  if (document.getElementById("btn-admin-pagamento")) return;

  const painel = document.createElement("div");
  painel.className = "admin-painel";

  painel.innerHTML = `
    <button type="button" id="btn-admin-pagamento" class="btn-admin" onclick="autenticarAdminPagamentos()" title="Acesso administrativo">
      ⚙
    </button>

    <button type="button" id="btn-sair-admin-pagamento" class="btn-sair-admin hidden" onclick="sairModoAdminPagamentos()">
      Sair do modo admin
    </button>
  `;

  sectionHeader.appendChild(painel);

  const status = document.createElement("div");
  status.id = "status-admin-pagamento";
  status.className = "status-admin hidden";

  section.insertBefore(status, listaPagamentos);
}

function autenticarAdminPagamentos() {
  const usuario = prompt("Usuário admin:");
  if (usuario === null) return;

  const senha = prompt("Senha:");
  if (senha === null) return;

  if (usuario === ADMIN_USUARIO_PAGAMENTO && senha === ADMIN_SENHA_PAGAMENTO) {
    localStorage.setItem(CHAVE_ADMIN_PAGAMENTO_ATIVO, "true");
    atualizarInterfaceAdminPagamentos();
    renderizarPagamentos();
    alert("Modo admin ativado.");
  } else {
    alert("Acesso negado.");
  }
}

function sairModoAdminPagamentos() {
  localStorage.removeItem(CHAVE_ADMIN_PAGAMENTO_ATIVO);
  atualizarInterfaceAdminPagamentos();
  renderizarPagamentos();
}

function adminPagamentosEstaAtivo() {
  return localStorage.getItem(CHAVE_ADMIN_PAGAMENTO_ATIVO) === "true";
}

function atualizarInterfaceAdminPagamentos() {
  const btnAdmin = document.getElementById("btn-admin-pagamento");
  const btnSairAdmin = document.getElementById("btn-sair-admin-pagamento");
  const statusAdmin = document.getElementById("status-admin-pagamento");

  const ativo = adminPagamentosEstaAtivo();

  if (btnAdmin) btnAdmin.classList.toggle("hidden", ativo);
  if (btnSairAdmin) btnSairAdmin.classList.toggle("hidden", !ativo);

  if (statusAdmin) {
    if (ativo) {
      statusAdmin.textContent = "Modo administrador ativado. A exclusão de pagamentos está liberada.";
      statusAdmin.className = "status-admin ativo";
    } else {
      statusAdmin.textContent = "";
      statusAdmin.className = "status-admin hidden";
    }
  }
}

async function carregarAgendamentosParaPagamento() {
  try {
    agendamentosDisponiveis = await listarAgendamentosAPI();

    const pagamentos = await listarPagamentosAPI();
    const idsPagos = pagamentos.map((pagamento) => Number(pagamento.agendamento_id));

    agendamentosDisponiveis = agendamentosDisponiveis.filter(
      (agendamento) => !idsPagos.includes(Number(agendamento.id))
    );

    const select = document.getElementById("agendamento_id");
    if (!select) return;

    select.innerHTML = '<option value="">Selecione um agendamento</option>';

    agendamentosDisponiveis.forEach((agendamento) => {
      const option = document.createElement("option");
      option.value = agendamento.id;
      option.textContent = `${agendamento.personal_nome} - ${formatarData(agendamento.data_agendamento)} - ${formatarMoeda(agendamento.valor_total)}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    mostrarMensagemPagamento("Erro ao carregar agendamentos.", true);
  }
}

async function carregarPagamentos() {
  try {
    pagamentosRealizados = await listarPagamentosAPI();
    renderizarPagamentos();
  } catch (error) {
    console.error(error);
    mostrarMensagemPagamento("Erro ao carregar pagamentos.", true);
  }
}

function preencherDadosAgendamento() {
  const agendamentoId = document.getElementById("agendamento_id").value;

  const personalInput = document.getElementById("pagamento_personal");
  const dataInput = document.getElementById("pagamento_data");
  const horarioInput = document.getElementById("pagamento_horario");
  const valorInput = document.getElementById("pagamento_valor");

  const agendamento = agendamentosDisponiveis.find(
    (item) => String(item.id) === String(agendamentoId)
  );

  if (!agendamento) {
    personalInput.value = "";
    dataInput.value = "";
    horarioInput.value = "";
    valorInput.value = "";
    return;
  }

  personalInput.value = agendamento.personal_nome;
  dataInput.value = formatarData(agendamento.data_agendamento);
  horarioInput.value = `${formatarHora(agendamento.horario_inicio)} até ${formatarHora(agendamento.horario_fim)}`;
  valorInput.value = formatarMoeda(agendamento.valor_total);
}

async function registrarPagamento() {
  const agendamentoId = document.getElementById("agendamento_id").value;
  const formaPagamento = document.getElementById("forma_pagamento").value;

  if (!agendamentoId || !formaPagamento) {
    mostrarMensagemPagamento("Selecione o agendamento e a forma de pagamento.", true);
    return;
  }

  const agendamento = agendamentosDisponiveis.find(
    (item) => String(item.id) === String(agendamentoId)
  );

  if (!agendamento) {
    mostrarMensagemPagamento("Agendamento inválido.", true);
    return;
  }

  try {
    await registrarPagamentoAPI({
      agendamento_id: agendamento.id,
      valor_pago: agendamento.valor_total,
      forma_pagamento: formaPagamento
    });

    document.getElementById("form-pagamento").reset();
    limparCamposPagamento();

    mostrarMensagemPagamento("Pagamento registrado com sucesso!");

    await carregarAgendamentosParaPagamento();
    await carregarPagamentos();
  } catch (error) {
    console.error(error);
    mostrarMensagemPagamento(error.message || "Erro ao registrar pagamento.", true);
  }
}

function limparCamposPagamento() {
  document.getElementById("pagamento_personal").value = "";
  document.getElementById("pagamento_data").value = "";
  document.getElementById("pagamento_horario").value = "";
  document.getElementById("pagamento_valor").value = "";
}

function renderizarPagamentos() {
  const container = document.getElementById("lista-pagamentos");
  const adminAtivo = adminPagamentosEstaAtivo();

  if (!container) return;

  if (pagamentosRealizados.length === 0) {
    container.innerHTML = '<p class="info-session">Nenhum pagamento registrado.</p>';
    return;
  }

  container.innerHTML = "";

  pagamentosRealizados.forEach((pagamento) => {
    const card = document.createElement("div");
    card.className = "treino-card pagamento-card";

    const fotoPersonal = pagamento.personal_foto
      ? `<img src="${pagamento.personal_foto}" alt="Foto de ${pagamento.personal_nome}" class="pagamento-foto-personal" />`
      : "";

    const iconePagamento = obterIconePagamento(pagamento.forma_pagamento);

    card.innerHTML = `
      <div class="pagamento-card-layout">
        <div class="pagamento-card-esquerda">
          ${fotoPersonal}

          <h4>${pagamento.personal_nome}</h4>

          <span class="pagamento-selo-pago">
            PAGO ✅
          </span>

          <div class="pagamento-forma">
            <span class="pagamento-icone">${iconePagamento}</span>
            <span>${pagamento.forma_pagamento}</span>
          </div>

          <div class="pagamento-valor-destaque">
            <span>Valor pago</span>
            <strong>${formatarMoeda(pagamento.valor_pago)}</strong>
          </div>
        </div>

        <div class="pagamento-card-direita">
          <div class="treino-grid">
            <p><strong>Especialização:</strong> ${pagamento.personal_especializacao || "Não informado"}</p>
            <p><strong>Localização:</strong> ${pagamento.personal_localizacao || "Não informado"}</p>
            <p><strong>Telefone:</strong> ${pagamento.personal_telefone || "Não informado"}</p>
            <p><strong>Data do treino:</strong> ${formatarData(pagamento.data_agendamento)}</p>
            <p><strong>Horário:</strong> ${formatarHora(pagamento.horario_inicio)} até ${formatarHora(pagamento.horario_fim)}</p>
            <p><strong>Quantidade:</strong> ${pagamento.quantidade_aulas || "-"} aula(s)</p>
            <p><strong>Valor por aula:</strong> ${formatarMoeda(pagamento.valor_unitario || 0)}</p>
            <p><strong>Valor total:</strong> ${formatarMoeda(pagamento.valor_total || pagamento.valor_pago)}</p>
            <p><strong>Data do pagamento:</strong> ${formatarDataHora(pagamento.data_pagamento)}</p>
          </div>

          <p class="treino-data">
            <strong>Observações do treino:</strong> ${pagamento.observacoes || "Sem observações"}
          </p>

          <div class="acoes-treino">
            <button type="button" class="btn-acao editar" onclick="verComprovantePagamento(${pagamento.id})">
              Ver Comprovante
            </button>

            ${
              adminAtivo
                ? `
                  <button type="button" class="btn-acao excluir" onclick="confirmarExclusaoPagamento(${pagamento.id})">
                    Excluir pagamento
                  </button>
                `
                : ""
            }
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function obterIconePagamento(formaPagamento) {
  const forma = String(formaPagamento || "").toLowerCase();

  if (forma.includes("pix")) return "🔷";
  if (forma.includes("crédito") || forma.includes("credito")) return "💳";
  if (forma.includes("débito") || forma.includes("debito")) return "💳";
  if (forma.includes("dinheiro")) return "💵";

  return "💰";
}

function verComprovantePagamento(id) {
  const pagamento = pagamentosRealizados.find((item) => Number(item.id) === Number(id));

  if (!pagamento) {
    alert("Pagamento não encontrado.");
    return;
  }

  alert(
    `COMPROVANTE DE PAGAMENTO\n\n` +
    `Personal: ${pagamento.personal_nome}\n` +
    `Data do treino: ${formatarData(pagamento.data_agendamento)}\n` +
    `Horário: ${formatarHora(pagamento.horario_inicio)} até ${formatarHora(pagamento.horario_fim)}\n` +
    `Forma de pagamento: ${pagamento.forma_pagamento}\n` +
    `Valor pago: ${formatarMoeda(pagamento.valor_pago)}\n` +
    `Status: PAGO\n` +
    `Data do pagamento: ${formatarDataHora(pagamento.data_pagamento)}`
  );
}

async function confirmarExclusaoPagamento(id) {
  if (!adminPagamentosEstaAtivo()) {
    alert("Apenas admin pode excluir pagamentos.");
    return;
  }

  const confirmar = confirm("Tem certeza que deseja excluir este pagamento?");

  if (!confirmar) return;

  try {
    await excluirPagamentoAPI(id);
    mostrarMensagemPagamento("Pagamento excluído com sucesso!");
    await carregarAgendamentosParaPagamento();
    await carregarPagamentos();
  } catch (error) {
    console.error(error);
    mostrarMensagemPagamento(error.message || "Erro ao excluir pagamento.", true);
  }
}

function mostrarMensagemPagamento(texto, erro = false) {
  const mensagem = document.getElementById("mensagem-pagamento");
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

function formatarDataHora(data) {
  if (!data) return "-";

  const objetoData = new Date(data);

  return objetoData.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}