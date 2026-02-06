-- =============================================
-- REUMACAL - Base de datos
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla de usuarios (pacientes y reumatólogos)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('PATIENT', 'DOCTOR')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pacientes (vinculados a usuarios)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  nhc TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de puntuaciones/resultados
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  instrument TEXT NOT NULL,
  total_score DECIMAL NOT NULL,
  components_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de logs de acceso (auditoría)
CREATE TABLE access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES users(id),
  nhc TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_patients_nhc ON patients(nhc);
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_scores_patient ON scores(patient_id);
CREATE INDEX idx_scores_instrument ON scores(instrument);
CREATE INDEX idx_scores_date ON scores(created_at);

-- Habilitar acceso público (para la app)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (permiten todas las operaciones desde la app)
CREATE POLICY "Allow all users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all scores" ON scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all logs" ON access_logs FOR ALL USING (true) WITH CHECK (true);
