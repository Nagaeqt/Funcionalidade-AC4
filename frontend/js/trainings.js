let todosTreinos = [];
let treinoEmEdicaoId = null;
let treinoPendenteExclusaoId = null;

function formatarValor(valor, unidade = "") {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }

  const numero = Number(valor);

  if (!Number.isNaN(numero)) {
    return `${parseFloat(valor)}${unidade}`;
  }

  return `${valor}${unidade}`;
}

function formatarData(data) {
  if (!data) return "-";
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function obterTreinoPorId(id) {
  return todosTreinos.find((treino) => Number(treino.id) === Number(id));
}

function atualizarStatusEdicao(texto) {
  const status = document.getElementById("status-edicao");
  if (status) {
    status.textContent = texto;
  }
}

function validarTreino(treino) {
  if (!treino.data_treino || !treino.dia_da_semana || !treino.tipo_de_treino || !treino.foco_do_treino || !treino.exercicio) {
    return "Preencha data, dia, tipo, foco e exercício.";
  }

  if (treino.carga !== "" && Number(treino.carga) < 0) {
    return "A carga não pode ser negativa.";
  }

  if (treino.series !== "" && Number(treino.series) <= 0) {
    return "Séries devem ser maiores que zero.";
  }

  if (treino.repeticoes !== "" && Number(treino.repeticoes) <= 0) {
    return "Repetições devem ser maiores que zero.";
  }

  if (treino.tempo_descanso !== "" && Number(treino.tempo_descanso) < 0) {
    return "O tempo de descanso não pode ser negativo.";
  }

  if (treino.peso_corporal !== "" && Number(treino.peso_corporal) < 0) {
    return "O peso corporal não pode ser negativo.";
  }

  if (treino.altura !== "" && Number(treino.altura) < 0) {
    return "A altura não pode ser negativa.";
  }

  return "";
}

function destacarTreinoEmEdicao() {
  document.querySelectorAll(".treino-card").forEach((card) => {
    card.classList.remove("treino-card--editing");
  });

  if (!treinoEmEdicaoId) return;

  const card = document.querySelector(`[data-treino-id="${treinoEmEdicaoId}"]`);
  if (card) {
    card.classList.add("treino-card--editing");
  }
}

function calcularMaisFrequente(lista, chave) {
  if (!lista.length) return "-";

  const contador = {};

  lista.forEach((item) => {
    const valor = item[chave];
    if (!valor) return;
    contador[valor] = (contador[valor] || 0) + 1;
  });

  let maiorValor = "-";
  let maiorQuantidade = 0;

  Object.entries(contador).forEach(([valor, quantidade]) => {
    if (quantidade > maiorQuantidade) {
      maiorQuantidade = quantidade;
      maiorValor = valor;
    }
  });

  return maiorValor;
}

function atualizarMetricas(lista) {
  const totalTreinos = document.getElementById("total-treinos");
  const ultimoTreino = document.getElementById("ultimo-treino");
  const focoAtual = document.getElementById("foco-atual");
  const exercicioFrequente = document.getElementById("exercicio-frequente");

  totalTreinos.textContent = `${lista.length} treino(s)`;

  if (!lista.length) {
    ultimoTreino.textContent = "Nenhum";
    focoAtual.textContent = "-";
    exercicioFrequente.textContent = "-";
    return;
  }

  const ultimo = [...lista].sort((a, b) => new Date(b.data_treino) - new Date(a.data_treino))[0];

  ultimoTreino.textContent = `${ultimo.tipo_de_treino} • ${formatarData(ultimo.data_treino)}`;
  focoAtual.textContent = calcularMaisFrequente(lista, "foco_do_treino");
  exercicioFrequente.textContent = calcularMaisFrequente(lista, "exercicio");
}

function aplicarFiltros() {
  const busca = (document.getElementById("busca-treino").value || "").toLowerCase().trim();
  const filtroDia = document.getElementById("filtro-dia").value;
  const filtroFoco = document.getElementById("filtro-foco").value;

  const filtrados = todosTreinos.filter((treino) => {
    const correspondeBusca =
      !busca ||
      (treino.tipo_de_treino || "").toLowerCase().includes(busca) ||
      (treino.exercicio || "").toLowerCase().includes(busca) ||
      (treino.foco_do_treino || "").toLowerCase().includes(busca) ||
      (treino.observacoes || "").toLowerCase().includes(busca);

    const correspondeDia = !filtroDia || treino.dia_da_semana === filtroDia;
    const correspondeFoco = !filtroFoco || treino.foco_do_treino === filtroFoco;

    return correspondeBusca && correspondeDia && correspondeFoco;
  });

  renderizarTreinos(filtrados);
  renderizarGrafico(filtrados);
}

function renderizarTreinos(lista) {
  const listaTreinos = document.getElementById("lista-treinos");

  if (!lista.length) {
    listaTreinos.innerHTML = `<p class="info-session">Nenhum treino encontrado com os filtros atuais.</p>`;
    return;
  }

  listaTreinos.innerHTML = lista.map((treino) => `
    <div class="treino-card ${Number(treino.id) === Number(treinoEmEdicaoId) ? "treino-card--editing" : ""}" data-treino-id="${treino.id}">
      <div class="treino-topo">
        <div>
          <h4>${treino.tipo_de_treino} • ${treino.dia_da_semana}</h4>
          <span class="treino-badge">${treino.foco_do_treino}</span>
        </div>
        ${Number(treino.id) === Number(treinoEmEdicaoId) ? `<span class="editing-pill">Editando</span>` : ""}
      </div>

      <div class="treino-grid">
        <p><strong>Data do treino:</strong> ${formatarData(treino.data_treino)}</p>
        <p><strong>Exercício:</strong> ${formatarValor(treino.exercicio)}</p>
        <p><strong>Carga:</strong> ${formatarValor(treino.carga, " kg")}</p>
        <p><strong>Séries:</strong> ${formatarValor(treino.series)}</p>
        <p><strong>Repetições:</strong> ${formatarValor(treino.repeticoes)}</p>
        <p><strong>Tempo de descanso:</strong> ${formatarValor(treino.tempo_descanso, " s")}</p>
        <p><strong>Peso corporal:</strong> ${formatarValor(treino.peso_corporal, " kg")}</p>
        <p><strong>Altura:</strong> ${formatarValor(treino.altura, " cm")}</p>
        <p><strong>Observações:</strong> ${formatarValor(treino.observacoes)}</p>
      </div>

      <p class="treino-data">
        <strong>Registrado em:</strong>
        ${new Date(treino.data_registro).toLocaleString("pt-BR")}
        ${treino.data_atualizacao ? ` • <strong>Atualizado em:</strong> ${new Date(treino.data_atualizacao).toLocaleString("pt-BR")}` : ""}
      </p>

      <div class="acoes-treino">
        <button class="btn-acao editar" onclick="editarTreino(${treino.id})">Editar</button>
        <button class="btn-acao excluir" onclick="abrirModalExclusao(${treino.id})">Excluir</button>
      </div>
    </div>
  `).join("");

  destacarTreinoEmEdicao();
}

function renderizarGrafico(lista) {
  const grafico = document.getElementById("grafico-carga");
  const graficoVazio = document.getElementById("grafico-vazio");

  const comCarga = [...lista]
    .filter((treino) => treino.carga !== null && treino.carga !== undefined && treino.carga !== "")
    .sort((a, b) => new Date(a.data_treino) - new Date(b.data_treino))
    .slice(-6);

  if (!comCarga.length) {
    grafico.innerHTML = "";
    graficoVazio.style.display = "block";
    return;
  }

  graficoVazio.style.display = "none";

  const maiorCarga = Math.max(...comCarga.map((treino) => Number(treino.carga)));

  grafico.innerHTML = comCarga.map((treino) => {
    const altura = maiorCarga > 0 ? Math.max((Number(treino.carga) / maiorCarga) * 100, 12) : 12;
    const legenda = `${treino.exercicio || treino.tipo_de_treino}`;

    return `
      <div class="grafico-item">
        <div class="grafico-barra-wrap">
          <div class="grafico-barra" style="height:${altura}%"></div>
        </div>
        <span class="grafico-valor">${formatarValor(treino.carga, " kg")}</span>
        <span class="grafico-legenda" title="${legenda}">${legenda}</span>
      </div>
    `;
  }).join("");
}

async function cadastrarOuAtualizarTreino(event) {
  event.preventDefault();

  const token = pegarToken();
  const mensagem = document.getElementById("mensagem-treino");

  const treino = {
    data_treino: document.getElementById("data_treino").value,
    dia_da_semana: document.getElementById("dia_da_semana").value,
    tipo_de_treino: document.getElementById("tipo_de_treino").value.trim(),
    foco_do_treino: document.getElementById("foco_do_treino").value,
    exercicio: document.getElementById("exercicio").value.trim(),
    carga: document.getElementById("carga").value,
    series: document.getElementById("series").value,
    repeticoes: document.getElementById("repeticoes").value,
    tempo_descanso: document.getElementById("tempo_descanso").value,
    peso_corporal: document.getElementById("peso_corporal").value,
    altura: document.getElementById("altura").value,
    observacoes: document.getElementById("observacoes").value.trim()
  };

  const erroValidacao = validarTreino(treino);

  if (erroValidacao) {
    mensagem.textContent = erroValidacao;
    return;
  }

  mensagem.textContent = treinoEmEdicaoId ? "Atualizando treino..." : "Salvando treino...";

  try {
    const resposta = await fetch(
      treinoEmEdicaoId ? `${API_URL}/treinos/${treinoEmEdicaoId}` : `${API_URL}/treinos`,
      {
        method: treinoEmEdicaoId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(treino)
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem || "Erro ao salvar treino.";
      return;
    }

    mensagem.textContent = treinoEmEdicaoId
      ? "Treino atualizado com sucesso!"
      : "Treino cadastrado com sucesso!";

    limparFormularioTreino();
    await carregarTreinos();
  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
}

async function carregarTreinos() {
  const token = pegarToken();
  const listaTreinos = document.getElementById("lista-treinos");

  try {
    const resposta = await fetch(`${API_URL}/treinos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      listaTreinos.innerHTML = `<p class="info-session">${dados.mensagem || "Erro ao carregar treinos."}</p>`;
      return;
    }

    todosTreinos = dados;
    atualizarMetricas(todosTreinos);
    aplicarFiltros();
  } catch (erro) {
    listaTreinos.innerHTML = `<p class="info-session">Erro ao conectar com o servidor.</p>`;
  }
}

function editarTreino(id) {
  const treino = obterTreinoPorId(id);
  if (!treino) return;

  treinoEmEdicaoId = treino.id;

  document.getElementById("data_treino").value = treino.data_treino || "";
  document.getElementById("dia_da_semana").value = treino.dia_da_semana || "";
  document.getElementById("tipo_de_treino").value = treino.tipo_de_treino || "";
  document.getElementById("foco_do_treino").value = treino.foco_do_treino || "";
  document.getElementById("exercicio").value = treino.exercicio || "";
  document.getElementById("carga").value = treino.carga || "";
  document.getElementById("series").value = treino.series || "";
  document.getElementById("repeticoes").value = treino.repeticoes || "";
  document.getElementById("tempo_descanso").value = treino.tempo_descanso || "";
  document.getElementById("peso_corporal").value = treino.peso_corporal || "";
  document.getElementById("altura").value = treino.altura || "";
  document.getElementById("observacoes").value = treino.observacoes || "";

  document.querySelector(".btn-treino").textContent = "Atualizar treino";
  document.getElementById("mensagem-treino").textContent = "Editando treino selecionado...";
  atualizarStatusEdicao("Modo edição");

  aplicarFiltros();
  window.location.hash = "#treinos";
}

function limparFormularioTreino() {
  treinoEmEdicaoId = null;
  document.getElementById("form-treino").reset();
  document.querySelector(".btn-treino").textContent = "Salvar treino";
  document.getElementById("mensagem-treino").textContent = "";
  atualizarStatusEdicao("Modo cadastro");
  aplicarFiltros();
}

function abrirModalExclusao(id) {
  treinoPendenteExclusaoId = id;
  document.getElementById("modal-exclusao").classList.remove("hidden");
}

function fecharModalExclusao() {
  treinoPendenteExclusaoId = null;
  document.getElementById("modal-exclusao").classList.add("hidden");
}

async function confirmarExclusaoTreino() {
  if (!treinoPendenteExclusaoId) return;

  const token = pegarToken();

  try {
    const resposta = await fetch(`${API_URL}/treinos/${treinoPendenteExclusaoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.mensagem || "Erro ao excluir treino.");
      return;
    }

    if (Number(treinoEmEdicaoId) === Number(treinoPendenteExclusaoId)) {
      limparFormularioTreino();
    }

    fecharModalExclusao();
    await carregarTreinos();
  } catch (erro) {
    alert("Erro ao conectar com o servidor.");
  }
}

function iniciarTreinos() {
  const formTreino = document.getElementById("form-treino");
  const buscaTreino = document.getElementById("busca-treino");
  const filtroDia = document.getElementById("filtro-dia");
  const filtroFoco = document.getElementById("filtro-foco");
  const btnCancelarExclusao = document.getElementById("btn-cancelar-exclusao");
  const btnConfirmarExclusao = document.getElementById("btn-confirmar-exclusao");

  if (formTreino) {
    formTreino.addEventListener("submit", cadastrarOuAtualizarTreino);
  }

  if (buscaTreino) buscaTreino.addEventListener("input", aplicarFiltros);
  if (filtroDia) filtroDia.addEventListener("change", aplicarFiltros);
  if (filtroFoco) filtroFoco.addEventListener("change", aplicarFiltros);
  if (btnCancelarExclusao) btnCancelarExclusao.addEventListener("click", fecharModalExclusao);
  if (btnConfirmarExclusao) btnConfirmarExclusao.addEventListener("click", confirmarExclusaoTreino);

  atualizarStatusEdicao("Modo cadastro");
  carregarTreinos();
}