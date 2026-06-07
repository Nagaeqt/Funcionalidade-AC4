# 💳 PowerGym - Funcionalidade AC4

## Pagamento de Treinos Agendados

### 📚 Disciplina
Software Product: Analysis, Specification, Project & Implementation

### 🎓 Curso
Análise e Desenvolvimento de Sistemas (ADS)

### 🏫 Instituição
Faculdade Impacta

### 👨‍🎓 Aluno
Lucas Ryan Lima Malmagro

### 🆔 RA
2401867

---

# 📖 Sobre o Projeto

A Funcionalidade AC4 faz parte do projeto PowerGym, um sistema web desenvolvido para gerenciamento de treinos, personal trainers, agendamentos e pagamentos.

Nesta etapa foi implementado o módulo de pagamento de treinos agendados, permitindo que o usuário visualize seus agendamentos, realize pagamentos e acompanhe o histórico financeiro dentro da plataforma.

---

# 🎯 Objetivo da Funcionalidade

Permitir que usuários realizem o pagamento de treinos previamente agendados com personal trainers cadastrados no sistema.

---

# ⚙️ Funcionalidades Implementadas

## Registro de Pagamento

O usuário pode:

- Selecionar um agendamento existente
- Visualizar os dados do treino
- Escolher a forma de pagamento
- Confirmar o pagamento

---

## Formas de Pagamento

O sistema permite:

- PIX
- Cartão
- Dinheiro

---

## Histórico de Pagamentos

Após a confirmação, o pagamento é registrado e exibido em uma lista contendo:

- Nome do Personal Trainer
- Data do treino
- Horário do treino
- Valor pago
- Forma de pagamento
- Status do pagamento
- Data de pagamento

---

## Controle Administrativo

Foi implementado um modo administrador para gerenciamento dos registros de pagamento.

O administrador pode:

- Entrar em modo administrativo
- Excluir pagamentos cadastrados
- Gerenciar registros financeiros

---

## Integração com Agendamentos

A funcionalidade utiliza os dados cadastrados na AC3.

Cada pagamento está vinculado a:

- Usuário
- Personal Trainer
- Agendamento realizado

---

# 🗄️ Banco de Dados

Tabela utilizada:

```sql
pagamentos_treino
```

Campos principais:

```sql
id
usuario_id
agendamento_id
valor_pago
forma_pagamento
status_pagamento
data_pagamento
```

---

# 🛠️ Tecnologias Utilizadas

## Front-end

- HTML5
- CSS3
- JavaScript

## Back-end

- Node.js
- Express.js

## Banco de Dados

- PostgreSQL

## Controle de Versão

- Git
- GitHub

---

# 📂 Estrutura da Funcionalidade

```txt
frontend/
 ├── pagamentos.html
 ├── js/
 │    └── pagamentos.js

backend/
 ├── controllers/
 │    └── pagamentoController.js
 ├── routes/
 │    └── pagamentoRoutes.js
```

---

# 🔄 Fluxo da Funcionalidade

```txt
Usuário
     ↓
Seleciona Agendamento
     ↓
Escolhe Forma de Pagamento
     ↓
Confirma Pagamento
     ↓
Registro no Banco de Dados
     ↓
Exibição no Histórico
```

---

# 📊 Funcionalidades do Projeto PowerGym

## AC1 - Gerenciamento de Treinos

- Cadastro de treinos
- Edição de treinos
- Exclusão de treinos
- Histórico de treinos
- Evolução física

## AC2 - Cadastro de Personal Trainer

- Cadastro de personal trainers
- Listagem de profissionais
- Informações de contato
- Upload de imagem
- Controle administrativo

## AC3 - Agendamento de Treinos

- Seleção de personal trainer
- Escolha de data
- Escolha de horário
- Cálculo automático de valores
- Histórico de agendamentos

## AC4 - Pagamento de Treinos

- Registro de pagamentos
- Formas de pagamento
- Histórico financeiro
- Controle administrativo
- Integração com agendamentos

---

# 👨‍💻 Autor

Lucas Ryan Lima Malmagro

RA: 2401867

Faculdade Impacta - ADS

---

# 📄 Licença

Este projeto está licenciado sob a licença MIT.
