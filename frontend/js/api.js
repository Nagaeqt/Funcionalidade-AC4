const API_URL = "http://localhost:3000";

/* ================= TOKEN ================= */

function salvarToken(token) {
  localStorage.setItem("token", token);
}

function pegarToken() {
  return localStorage.getItem("token");
}

function removerToken() {
  localStorage.removeItem("token");
}

/* ================= USUÁRIO ================= */

function salvarUsuario(usuario) {
  localStorage.setItem("usuarioNome", usuario.nome);
  localStorage.setItem("usuarioEmail", usuario.email);
}

function pegarUsuarioNome() {
  return localStorage.getItem("usuarioNome");
}

function redirecionarSeNaoLogado() {
  const token = pegarToken();

  if (!token) {
    window.location.href = "index.html";
  }
}

/* ================= HEADERS ================= */

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + pegarToken()
  };
}

/* ================= PERSONAL TRAINERS ================= */

async function listarPersonaisAPI() {
  const response = await fetch(`${API_URL}/personal-trainers`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar personais");
  }

  return await response.json();
}

async function cadastrarPersonalAPI(dados) {
  const response = await fetch(`${API_URL}/personal-trainers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.mensagem || "Erro ao cadastrar personal");
  }

  return await response.json();
}

async function excluirPersonalAPI(id) {
  const response = await fetch(`${API_URL}/personal-trainers/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Erro ao excluir personal");
  }

  return await response.json();
}

/* ================= AGENDAMENTOS ================= */

async function listarAgendamentosAPI() {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar agendamentos");
  }

  return await response.json();
}

async function cadastrarAgendamentoAPI(dados) {
  const response = await fetch(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.mensagem || "Erro ao cadastrar agendamento");
  }

  return await response.json();
}

async function excluirAgendamentoAPI(id) {
  const response = await fetch(`${API_URL}/agendamentos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Erro ao cancelar agendamento");
  }

  return await response.json();
}

/* ================= PAGAMENTOS ================= */

async function listarPagamentosAPI() {
  const response = await fetch(`${API_URL}/pagamentos`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar pagamentos");
  }

  return await response.json();
}

async function registrarPagamentoAPI(dados) {
  const response = await fetch(`${API_URL}/pagamentos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dados)
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.mensagem || "Erro ao registrar pagamento");
  }

  return await response.json();
}

async function excluirPagamentoAPI(id) {
  const response = await fetch(`${API_URL}/pagamentos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const erro = await response.json();
    throw new Error(erro.mensagem || "Erro ao excluir pagamento");
  }

  return await response.json();
}