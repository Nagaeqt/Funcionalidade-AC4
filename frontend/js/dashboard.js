async function carregarPerfil() {
  redirecionarSeNaoLogado();

  const token = pegarToken();
  const mensagem = document.getElementById("mensagem");
  const nomeUsuario = document.getElementById("nome-usuario");

  try {
    const resposta = await fetch(`${API_URL}/auth/perfil`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem || "Sessão inválida.";
      removerToken();

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);

      return;
    }

    const usuario = dados.usuario;

    nomeUsuario.textContent = usuario.nome || pegarUsuarioNome() || "Usuário";
    mensagem.textContent = `Logado como: ${usuario.email}`;

    document.getElementById("perfil-nome").value = usuario.nome || "";
    document.getElementById("perfil-email").value = usuario.email || "";
    document.getElementById("perfil-objetivo").value = usuario.objetivo || "";
    document.getElementById("perfil-peso").value = usuario.peso_corporal || "";
    document.getElementById("perfil-altura").value = usuario.altura || "";

    if (typeof salvarUsuario === "function") {
      salvarUsuario(usuario);
    }
  } catch (erro) {
    mensagem.textContent = "Erro ao carregar dados do usuário.";
  }
}

function validarPerfil({ nome, email, peso_corporal, altura }) {
  if (!nome.trim()) {
    return "Informe o nome.";
  }

  if (!email.trim() || !email.includes("@")) {
    return "Informe um e-mail válido.";
  }

  if (peso_corporal !== "" && Number(peso_corporal) < 0) {
    return "O peso corporal não pode ser negativo.";
  }

  if (altura !== "" && Number(altura) < 0) {
    return "A altura não pode ser negativa.";
  }

  return "";
}

async function atualizarPerfil(event) {
  event.preventDefault();

  const token = pegarToken();
  const mensagem = document.getElementById("mensagem-perfil");

  const perfil = {
    nome: document.getElementById("perfil-nome").value,
    email: document.getElementById("perfil-email").value,
    objetivo: document.getElementById("perfil-objetivo").value,
    peso_corporal: document.getElementById("perfil-peso").value,
    altura: document.getElementById("perfil-altura").value
  };

  const erroValidacao = validarPerfil(perfil);

  if (erroValidacao) {
    mensagem.textContent = erroValidacao;
    return;
  }

  mensagem.textContent = "Salvando perfil...";

  try {
    const resposta = await fetch(`${API_URL}/auth/perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(perfil)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem || "Erro ao atualizar perfil.";
      return;
    }

    mensagem.textContent = "Perfil atualizado com sucesso!";
    document.getElementById("nome-usuario").textContent = dados.usuario.nome || "Usuário";

    if (typeof salvarUsuario === "function") {
      salvarUsuario(dados.usuario);
    }
  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
}

function inicializarDashboard() {
  carregarPerfil();

  const formPerfil = document.getElementById("form-perfil");
  if (formPerfil) {
    formPerfil.addEventListener("submit", atualizarPerfil);
  }

  if (typeof iniciarTreinos === "function") {
    iniciarTreinos();
  }
}
