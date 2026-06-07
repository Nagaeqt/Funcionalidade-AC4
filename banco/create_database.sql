CREATE TABLE treinos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    data_treino DATE NOT NULL,
    dia_da_semana VARCHAR(20) NOT NULL,
    tipo_de_treino VARCHAR(100) NOT NULL,
    foco_do_treino VARCHAR(100) NOT NULL,
    exercicio VARCHAR(150) NOT NULL,
    carga NUMERIC(10,2),
    series INTEGER,
    repeticoes INTEGER,
    tempo_descanso INTEGER,
    peso_corporal NUMERIC(10,2),
    altura NUMERIC(10,2),
    observacoes TEXT,
    data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_treinos_usuario
      FOREIGN KEY (usuario_id)
      REFERENCES usuarios(id)
      ON DELETE CASCADE
);
-- =========================================
-- TABELA: PERSONAL TRAINERS
-- =========================================

CREATE TABLE personal_trainers (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,

    nome VARCHAR(150) NOT NULL,
    especializacao VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    valor_aula NUMERIC(10,2) NOT NULL,
    telefone VARCHAR(30) NOT NULL,

    foto TEXT NOT NULL, -- base64 da imagem

    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_personal_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);
