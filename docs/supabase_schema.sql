-- ==========================================
-- Agenda de Louvor - Supabase Schema
-- ==========================================

-- Habilita a extensão para gerar UUIDs (se não estiver ativada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- 1. Tabela: members (Membros da equipe)
-- -----------------------------------------------------
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------
-- 2. Tabela: themes (Temas/Cultos)
-- -----------------------------------------------------
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------
-- 3. Tabela: songs (Músicas)
-- -----------------------------------------------------
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  theme_id UUID REFERENCES themes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------
-- 4. Tabela: scales (Escalas)
-- -----------------------------------------------------
CREATE TABLE scales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  theme TEXT NOT NULL, -- Mantendo texto conforme interface Scale { theme: string }
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -----------------------------------------------------
-- 5. Tabela: scale_songs (Relacionamento: Escala <-> Músicas)
-- -----------------------------------------------------
-- Como uma escala possui várias músicas (e uma música pode estar em várias escalas)
CREATE TABLE scale_songs (
  scale_id UUID REFERENCES scales(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0, -- Para manter a ordem das músicas na escala
  PRIMARY KEY (scale_id, song_id)
);

-- -----------------------------------------------------
-- 6. Tabela: scale_members (Relacionamento: Escala <-> Membros)
-- -----------------------------------------------------
-- Como uma escala possui vários membros
CREATE TABLE scale_members (
  scale_id UUID REFERENCES scales(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (scale_id, member_id)
);

-- ==========================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- ==========================================
-- Habilitando RLS em todas as tabelas
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_members ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Como não temos sistema de login no momento,
-- permitiremos acesso público (para ler, criar, editar e excluir)
CREATE POLICY "Acesso publico para members" ON members FOR ALL USING (true);
CREATE POLICY "Acesso publico para themes" ON themes FOR ALL USING (true);
CREATE POLICY "Acesso publico para songs" ON songs FOR ALL USING (true);
CREATE POLICY "Acesso publico para scales" ON scales FOR ALL USING (true);
CREATE POLICY "Acesso publico para scale_songs" ON scale_songs FOR ALL USING (true);
CREATE POLICY "Acesso publico para scale_members" ON scale_members FOR ALL USING (true);
