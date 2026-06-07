let listaPersonais = [];

const ADMIN_USUARIO = 'admin';
const ADMIN_SENHA = 'admin123';
const CHAVE_ADMIN_ATIVO = 'powergym_admin_ativo';

function inicializarPersonalTrainer() {
  redirecionarSeNaoLogado();

  atualizarInterfaceAdmin();
  carregarPersonaisDoBanco();

  const form = document.getElementById('form-personal-trainer');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nome = document.getElementById('personal_nome').value.trim();
      const especializacao = document.getElementById('personal_especializacao').value.trim();
      const valor = document.getElementById('personal_valor_aula').value.trim();
      const telefone = document.getElementById('personal_telefone').value.trim();
      const localizacao = document.getElementById('personal_localizacao').value.trim();
      const descricao = document.getElementById('personal_descricao').value.trim();
      const fotoInput = document.getElementById('personal_foto');

      if (!nome || !especializacao || !valor || !telefone || !localizacao || !descricao) {
        mostrarMensagem('Preencha todos os campos obrigatórios.', true);
        return;
      }

      if (!fotoInput.files || !fotoInput.files[0]) {
        mostrarMensagem('Selecione uma imagem para o personal trainer.', true);
        return;
      }

      const arquivo = fotoInput.files[0];

      if (!arquivo.type.startsWith('image/')) {
        mostrarMensagem('O arquivo selecionado precisa ser uma imagem.', true);
        return;
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        mostrarMensagem('A imagem é muito grande. Escolha uma foto de até 5MB.', true);
        return;
      }

      try {
        const fotoBase64 = await converterImagemRedimensionada(arquivo, 500, 650, 0.82);

        await cadastrarPersonalAPI({
          nome,
          especializacao,
          valor_aula: valor,
          telefone,
          localizacao,
          descricao,
          foto: fotoBase64
        });

        mostrarMensagem('Personal cadastrado no banco com sucesso!');
        limparFormularioPersonalTrainer();
        carregarPersonaisDoBanco();
      } catch (error) {
        console.error(error);
        mostrarMensagem(error.message || 'Erro ao cadastrar personal.', true);
      }
    });
  }
}

async function carregarPersonaisDoBanco() {
  try {
    listaPersonais = await listarPersonaisAPI();
    renderizarPersonais();
  } catch (error) {
    console.error(error);
    mostrarMensagem('Erro ao carregar personais do banco.', true);
  }
}

function renderizarPersonais() {
  const container = document.getElementById('lista-personais');
  const adminAtivo = adminEstaAtivo();

  if (!container) return;

  if (listaPersonais.length === 0) {
    container.innerHTML = '<p class="info-session">Nenhum personal cadastrado no banco.</p>';
    return;
  }

  container.innerHTML = '';

  listaPersonais.forEach((personal) => {
    const card = document.createElement('div');
    card.className = 'card-personal';

    card.innerHTML = `
      <img src="${personal.foto}" alt="Foto de ${personal.nome}" class="personal-img" />

      <div class="personal-info">
        <h3>${personal.nome}</h3>
        <p><strong>Especialização:</strong> ${personal.especializacao}</p>
        <p><strong>Localização:</strong> ${personal.localizacao || 'Não informado'}</p>
        <p>${personal.descricao}</p>
        <p><strong>Valor:</strong> R$ ${Number(personal.valor_aula).toFixed(2)}</p>

        <div class="acoes-personal">
          <button type="button" class="btn-contato" onclick="abrirAgendamento(${personal.id})">
            Agendar treino
          </button>

          ${adminAtivo ? `
            <button type="button" class="btn-excluir" onclick="confirmarExclusaoPersonal(${personal.id})">
              Excluir
            </button>
          ` : ''}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function abrirAgendamento(personalId) {
  window.location.href = `agendamentos.html?personal_id=${personalId}`;
}

async function confirmarExclusaoPersonal(id) {
  if (!adminEstaAtivo()) {
    alert('Apenas admin pode excluir.');
    return;
  }

  const confirmar = confirm('Excluir este personal?');

  if (!confirmar) return;

  try {
    await excluirPersonalAPI(id);
    carregarPersonaisDoBanco();
  } catch (error) {
    console.error(error);
    mostrarMensagem('Erro ao excluir personal.', true);
  }
}

function autenticarAdmin() {
  const usuario = prompt('Usuário admin:');
  if (usuario === null) return;

  const senha = prompt('Senha:');
  if (senha === null) return;

  if (usuario === ADMIN_USUARIO && senha === ADMIN_SENHA) {
    localStorage.setItem(CHAVE_ADMIN_ATIVO, 'true');
    atualizarInterfaceAdmin();
    renderizarPersonais();
    alert('Modo admin ativado.');
  } else {
    alert('Acesso negado.');
  }
}

function sairModoAdmin() {
  localStorage.removeItem(CHAVE_ADMIN_ATIVO);
  atualizarInterfaceAdmin();
  renderizarPersonais();
}

function adminEstaAtivo() {
  return localStorage.getItem(CHAVE_ADMIN_ATIVO) === 'true';
}

function atualizarInterfaceAdmin() {
  const btnAdmin = document.getElementById('btn-admin');
  const btnSairAdmin = document.getElementById('btn-sair-admin');
  const statusAdmin = document.getElementById('status-admin');
  const ativo = adminEstaAtivo();

  if (btnAdmin) btnAdmin.classList.toggle('hidden', ativo);
  if (btnSairAdmin) btnSairAdmin.classList.toggle('hidden', !ativo);

  if (statusAdmin) {
    if (ativo) {
      statusAdmin.textContent = 'Modo administrador ativado.';
      statusAdmin.className = 'status-admin ativo';
    } else {
      statusAdmin.textContent = '';
      statusAdmin.className = 'status-admin hidden';
    }
  }
}

function limparFormularioPersonalTrainer() {
  const form = document.getElementById('form-personal-trainer');
  if (form) form.reset();
}

function mostrarMensagem(texto, erro = false) {
  const mensagem = document.getElementById('mensagem-personal');
  if (!mensagem) return;

  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#ff8f8f' : '#7CFC98';

  setTimeout(() => {
    mensagem.textContent = '';
  }, 3000);
}

function converterImagemRedimensionada(file, maxWidth, maxHeight, qualidade = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        let largura = img.width;
        let altura = img.height;
        const proporcaoOriginal = largura / altura;

        if (largura > maxWidth || altura > maxHeight) {
          if (largura / maxWidth > altura / maxHeight) {
            largura = maxWidth;
            altura = Math.round(maxWidth / proporcaoOriginal);
          } else {
            altura = maxHeight;
            largura = Math.round(maxHeight * proporcaoOriginal);
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = largura;
        canvas.height = altura;

        ctx.drawImage(img, 0, 0, largura, altura);

        resolve(canvas.toDataURL('image/jpeg', qualidade));
      };

      img.onerror = function () {
        reject(new Error('Não foi possível carregar a imagem.'));
      };

      img.src = e.target.result;
    };

    reader.onerror = function () {
      reject(new Error('Não foi possível ler o arquivo da imagem.'));
    };

    reader.readAsDataURL(file);
  });
}