async function fazerLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const mensagem = document.getElementById("mensagem");

  mensagem.textContent = "Entrando...";

  try {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem || "Erro no login.";
      return;
    }

    salvarToken(dados.token);
    salvarUsuario(dados.usuario);

    mensagem.textContent = "Login realizado!";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);

  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
}

async function fazerCadastro(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const objetivo = document.getElementById("objetivo").value;
  const plano_id = document.getElementById("plano_id").value;

  const mensagem = document.getElementById("mensagem");

  mensagem.textContent = "Criando conta...";

  try {
    const resposta = await fetch(`${API_URL}/auth/cadastro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        email,
        senha,
        objetivo,
        plano_id: plano_id ? Number(plano_id) : null
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem || "Erro no cadastro.";
      return;
    }

    mensagem.textContent = "Conta criada com sucesso!";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);

  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
}

async function recuperarSenha(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const mensagem = document.getElementById("mensagem");

  mensagem.textContent = "Enviando solicitação...";

  try {
    const resposta = await fetch(`${API_URL}/auth/recuperar-senha`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.mensagem || "Erro ao recuperar senha.";
      return;
    }

    mensagem.textContent = dados.mensagem;

  } catch (erro) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
  }
}

function logout() {
  removerToken();
  localStorage.removeItem("usuarioNome");
  localStorage.removeItem("usuarioEmail");

  window.location.href = "index.html";
}