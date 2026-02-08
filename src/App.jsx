import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '@supabase/supabase-js';

// ============================================
// REUMACAL - Calculadoras Reumatológicas
// @reumacastro
// ============================================

// ⚠️ CONFIGURACIÓN DE SUPABASE - CAMBIA ESTOS VALORES
const SUPABASE_URL = 'https://gprqwiiyzfanfzstoujz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcnF3aWl5emZhbmZ6c3RvdWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQzMzcsImV4cCI6MjA4NTk3MDMzN30.tMYqfeTVsLRlwjfvynuaFRsFx6I8SdKz4jYU6gO-ZB0';

// Verificar que las credenciales están configuradas
const isConfigured = SUPABASE_URL !== 'TU_SUPABASE_URL_AQUI' && SUPABASE_ANON_KEY !== 'TU_SUPABASE_ANON_KEY_AQUI';

const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

if (!isConfigured) {
  console.warn('⚠️ SUPABASE NO CONFIGURADO: Edita App.jsx y pon tus credenciales de Supabase');
}

// Utility functions
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatShortDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit'
  });
};

// ============================================
// CALCULATION FORMULAS
// ============================================

const calculateBASDAI = (components) => {
  const { q1, q2, q3, q4, q5, q6 } = components;
  const meanQ5Q6 = (parseFloat(q5) + parseFloat(q6)) / 2;
  const total = (parseFloat(q1) + parseFloat(q2) + parseFloat(q3) + parseFloat(q4) + meanQ5Q6) / 5;
  return Math.round(total * 100) / 100;
};

const interpretBASDAI = (score) => {
  if (score < 4) return { text: 'Actividad baja', color: '#10b981', level: 'low' };
  return { text: 'Actividad alta', color: '#ef4444', level: 'high' };
};

const calculateASDASwithCRP = (components) => {
  const { backPain, duration, peripheral, global, crp } = components;
  const bp = parseFloat(backPain);
  const dur = parseFloat(duration);
  const per = parseFloat(peripheral);
  const gl = parseFloat(global);
  const c = parseFloat(crp);
  
  const result = 0.121 * bp + 0.058 * dur + 0.110 * Math.sqrt(per) + 0.073 * gl + 0.579 * Math.log(c + 1);
  return Math.round(result * 100) / 100;
};

const calculateASDASwithESR = (components) => {
  const { backPain, duration, peripheral, global, esr } = components;
  const bp = parseFloat(backPain);
  const dur = parseFloat(duration);
  const per = parseFloat(peripheral);
  const gl = parseFloat(global);
  const e = parseFloat(esr);
  
  const result = 0.113 * bp + 0.053 * dur + 0.123 * Math.sqrt(per) + 0.069 * gl + 0.293 * Math.sqrt(e);
  return Math.round(result * 100) / 100;
};

const interpretASDAS = (score) => {
  if (score < 1.3) return { text: 'Enfermedad inactiva', color: '#10b981', level: 'inactive' };
  if (score < 2.1) return { text: 'Actividad baja', color: '#84cc16', level: 'low' };
  if (score < 3.5) return { text: 'Actividad alta', color: '#f59e0b', level: 'moderate' };
  return { text: 'Actividad muy alta', color: '#ef4444', level: 'high' };
};

const calculateDAPSA = (components) => {
  const { pain, global, tjc, sjc, crp } = components;
  const total = parseFloat(pain) + parseFloat(global) + parseFloat(tjc) + parseFloat(sjc) + parseFloat(crp);
  return Math.round(total * 100) / 100;
};

const interpretDAPSA = (score) => {
  if (score <= 4) return { text: 'Remisión', color: '#10b981', level: 'remission' };
  if (score <= 14) return { text: 'Actividad baja', color: '#84cc16', level: 'low' };
  if (score <= 28) return { text: 'Actividad moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Actividad alta', color: '#ef4444', level: 'high' };
};

const calculateDAS28withCRP = (components) => {
  const { tjc28, sjc28, global, crp } = components;
  const t = parseFloat(tjc28);
  const s = parseFloat(sjc28);
  const g = parseFloat(global) / 10;
  const c = parseFloat(crp);
  
  const result = 0.56 * Math.sqrt(t) + 0.28 * Math.sqrt(s) + 0.36 * Math.log(c + 1) + 0.014 * g + 0.96;
  return Math.round(result * 100) / 100;
};

const calculateDAS28withESR = (components) => {
  const { tjc28, sjc28, global, esr } = components;
  const t = parseFloat(tjc28);
  const s = parseFloat(sjc28);
  const g = parseFloat(global);
  const e = parseFloat(esr);
  
  const result = 0.56 * Math.sqrt(t) + 0.28 * Math.sqrt(s) + 0.70 * Math.log(e) + 0.014 * g;
  return Math.round(result * 100) / 100;
};

const interpretDAS28 = (score) => {
  if (score < 2.6) return { text: 'Remisión', color: '#10b981', level: 'remission' };
  if (score < 3.2) return { text: 'Actividad baja', color: '#84cc16', level: 'low' };
  if (score <= 5.1) return { text: 'Actividad moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Actividad alta', color: '#ef4444', level: 'high' };
};

// SLEDAI - Systemic Lupus Erythematosus Disease Activity Index
const calculateSLEDAI = (components) => {
  let total = 0;
  // Sistema nervioso central (8 puntos cada uno)
  if (components.seizure) total += 8;
  if (components.psychosis) total += 8;
  if (components.organicBrainSyndrome) total += 8;
  if (components.visualDisturbance) total += 8;
  if (components.cranialNerve) total += 8;
  if (components.lupusHeadache) total += 8;
  if (components.cva) total += 8;
  if (components.vasculitis) total += 8;
  // Muscular (4 puntos)
  if (components.arthritis) total += 4;
  if (components.myositis) total += 4;
  // Renal (4 puntos cada uno)
  if (components.urinaryCasts) total += 4;
  if (components.hematuria) total += 4;
  if (components.proteinuria) total += 4;
  if (components.pyuria) total += 4;
  // Respiratorio (4 puntos)
  if (components.pleurisy) total += 4;
  // Cardiovascular (8 y 4 puntos)
  if (components.pericarditis) total += 4;
  if (components.lowComplement) total += 2;
  if (components.increasedDnaBind) total += 2;
  // Hematológico (1-2 puntos)
  if (components.fever) total += 1;
  if (components.thrombocytopenia) total += 1;
  if (components.leukopenia) total += 1;
  // Cutáneo (2 puntos cada uno)
  if (components.rash) total += 2;
  if (components.alopecia) total += 2;
  if (components.mucosalUlcers) total += 2;
  return total;
};

const interpretSLEDAI = (score) => {
  if (score === 0) return { text: 'Inactiva', color: '#10b981', level: 'inactive' };
  if (score <= 5) return { text: 'Actividad leve', color: '#84cc16', level: 'mild' };
  if (score <= 10) return { text: 'Actividad moderada', color: '#f59e0b', level: 'moderate' };
  if (score <= 19) return { text: 'Actividad alta', color: '#ef4444', level: 'high' };
  return { text: 'Actividad muy alta', color: '#dc2626', level: 'very_high' };
};

// LupusPRO v1.8 - Quality of Life in Lupus
const calculateLupusPRO = (components) => {
  // Promedio de todos los dominios (escala 0-4, convertir a 0-100)
  const domains = [
    'lupusSymptoms', 'lupusMedications', 'procreation', 'physicalHealth',
    'painVitality', 'emotionalHealth', 'bodyImage', 'cognition',
    'desires', 'coping', 'satisfaction'
  ];
  let sum = 0;
  domains.forEach(d => sum += parseFloat(components[d] || 0));
  const avgScore = (sum / domains.length) * 25; // Convertir a escala 0-100
  return Math.round(avgScore * 100) / 100;
};

const interpretLupusPRO = (score) => {
  // Menor puntuación = mejor calidad de vida
  if (score <= 25) return { text: 'Muy buena calidad de vida', color: '#10b981', level: 'excellent' };
  if (score <= 50) return { text: 'Buena calidad de vida', color: '#84cc16', level: 'good' };
  if (score <= 75) return { text: 'Calidad de vida moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Calidad de vida afectada', color: '#ef4444', level: 'poor' };
};

// FACIT-General
const calculateFACIT = (components) => {
  // 27 items, escala 0-4, rango total 0-108
  let total = 0;
  for (let i = 1; i <= 27; i++) {
    total += parseFloat(components[`q${i}`] || 0);
  }
  return total;
};

const interpretFACIT = (score) => {
  // Mayor puntuación = mejor calidad de vida
  if (score >= 80) return { text: 'Muy buena calidad de vida', color: '#10b981', level: 'excellent' };
  if (score >= 60) return { text: 'Buena calidad de vida', color: '#84cc16', level: 'good' };
  if (score >= 40) return { text: 'Calidad de vida moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Calidad de vida afectada', color: '#ef4444', level: 'poor' };
};

// SF-36 - Short Form 36 Health Survey
const calculateSF36 = (components) => {
  // Calcular 8 dimensiones (cada una 0-100)
  const dimensions = {
    physicalFunctioning: parseFloat(components.physicalFunctioning || 50),
    rolePhysical: parseFloat(components.rolePhysical || 50),
    bodily Pain: parseFloat(components.bodilyPain || 50),
    generalHealth: parseFloat(components.generalHealth || 50),
    vitality: parseFloat(components.vitality || 50),
    socialFunctioning: parseFloat(components.socialFunctioning || 50),
    roleEmotional: parseFloat(components.roleEmotional || 50),
    mentalHealth: parseFloat(components.mentalHealth || 50)
  };
  
  const total = (dimensions.physicalFunctioning + dimensions.rolePhysical + 
                dimensions.bodilyPain + dimensions.generalHealth + dimensions.vitality + 
                dimensions.socialFunctioning + dimensions.roleEmotional + dimensions.mentalHealth) / 8;
  return Math.round(total * 100) / 100;
};

const interpretSF36 = (score) => {
  // Mayor puntuación = mejor calidad de vida
  if (score >= 75) return { text: 'Muy buena calidad de vida', color: '#10b981', level: 'excellent' };
  if (score >= 50) return { text: 'Buena calidad de vida', color: '#84cc16', level: 'good' };
  if (score >= 25) return { text: 'Calidad de vida moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Calidad de vida afectada', color: '#ef4444', level: 'poor' };
};

// BASFI - Bath Ankylosing Spondylitis Functional Index
const calculateBASFI = (components) => {
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseFloat(components[`q${i}`] || 0);
  }
  return Math.round((sum / 10) * 100) / 100;
};

const interpretBASFI = (score) => {
  // Mayor puntuación = peor función
  if (score < 4) return { text: 'Buena función', color: '#10b981', level: 'good' };
  if (score < 7) return { text: 'Limitación moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Limitación importante', color: '#ef4444', level: 'severe' };
};

// ASAS-HI - ASAS Health Index
const calculateASASHI = (components) => {
  let total = 0;
  for (let i = 1; i <= 17; i++) {
    if (components[`q${i}`]) total += 1;
  }
  return total;
};

const interpretASASHI = (score) => {
  if (score <= 5) return { text: 'Impacto bajo', color: '#10b981', level: 'low' };
  if (score <= 11) return { text: 'Impacto moderado', color: '#f59e0b', level: 'moderate' };
  return { text: 'Impacto alto', color: '#ef4444', level: 'high' };
};

// ASQoL - Ankylosing Spondylitis Quality of Life
const calculateASQoL = (components) => {
  let total = 0;
  for (let i = 1; i <= 18; i++) {
    if (components[`q${i}`]) total += 1;
  }
  return total;
};

const interpretASQoL = (score) => {
  if (score <= 6) return { text: 'Buena calidad de vida', color: '#10b981', level: 'good' };
  if (score <= 12) return { text: 'Calidad de vida moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Calidad de vida afectada', color: '#ef4444', level: 'poor' };
};

// PSAQoL - Psoriatic Arthritis Quality of Life (20 items)
const calculatePSAQoL = (components) => {
  let total = 0;
  for (let i = 1; i <= 20; i++) {
    if (components[`q${i}`]) total += 1;
  }
  return total;
};

const interpretPSAQoL = (score) => {
  if (score <= 7) return { text: 'Buena calidad de vida', color: '#10b981', level: 'good' };
  if (score <= 14) return { text: 'Calidad de vida moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Calidad de vida afectada', color: '#ef4444', level: 'poor' };
};

// ESSPRI - EULAR Sjögren's Syndrome Patient Reported Index
const calculateESSPRI = (components) => {
  const { dryness, fatigue, pain } = components;
  const total = (parseFloat(dryness) + parseFloat(fatigue) + parseFloat(pain)) / 3;
  return Math.round(total * 100) / 100;
};

const interpretESSPRI = (score) => {
  if (score < 5) return { text: 'Síntomas aceptables', color: '#10b981', level: 'acceptable' };
  return { text: 'Síntomas significativos', color: '#ef4444', level: 'significant' };
};

// SSDAI - Sjögren's Syndrome Disease Activity Index (Vitali 2007)
const calculateSSDAI = (components) => {
  let total = 0;
  // Constitucional (máx 7)
  if (components.fever) total += 1;
  if (components.lymphadenopathy) total += 2;
  // Linfático (máx 3)
  if (components.lymphadenopathyBiopsy) total += 3;
  // Glandular (máx 2)
  if (components.glandularSwelling) total += 2;
  // Articular (máx 6)
  if (components.arthralgia) total += 2;
  if (components.arthritis) total += 4;
  // Cutáneo (máx 9)
  if (components.vasculitis) total += 3;
  if (components.purpura) total += 6;
  // Pulmonar (máx 9)
  if (components.pulmonary) total += 9;
  // Renal (máx 9)
  if (components.renal) total += 9;
  // Muscular (máx 6)
  if (components.myositis) total += 6;
  // SNC (máx 9)
  if (components.cns) total += 9;
  // PNS (máx 9)
  if (components.pns) total += 9;
  // Hematológico (máx 3)
  if (components.leukopenia) total += 1;
  if (components.thrombocytopenia) total += 2;
  // Biológico (máx 3)
  if (components.hypergammaglobulinemia) total += 1;
  if (components.hypocomplementemia) total += 2;
  return total;
};

const interpretSSDAI = (score) => {
  if (score === 0) return { text: 'Inactiva', color: '#10b981', level: 'inactive' };
  if (score <= 5) return { text: 'Actividad baja', color: '#84cc16', level: 'low' };
  if (score <= 13) return { text: 'Actividad moderada', color: '#f59e0b', level: 'moderate' };
  return { text: 'Actividad alta', color: '#ef4444', level: 'high' };
};

// ============================================
// SUPABASE STORAGE FUNCTIONS
// ============================================

const Storage = {
  async getHospitals() {
    if (!supabase) { console.error('Supabase no configurado'); return []; }
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');
      if (error) { console.error('Error getting hospitals:', error); return []; }
      return data || [];
    } catch (err) {
      console.error('Error en getHospitals:', err);
      return [];
    }
  },
  
  async getUsers() {
    if (!supabase) { console.error('Supabase no configurado'); return []; }
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) { console.error('Error getting users:', error); return []; }
      return data || [];
    } catch (err) {
      console.error('Exception getting users:', err);
      return [];
    }
  },
  
  async createUser(user) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      const { data, error } = await supabase.from('users').insert([user]).select();
      if (error) { console.error('Error creating user:', error); return null; }
      return data?.[0] || null;
    } catch (err) {
      console.error('Exception creating user:', err);
      return null;
    }
  },
  
  async getUserByEmailAndPassword(email, passwordHash) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      console.log('Buscando usuario con email:', email);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', passwordHash)
        .maybeSingle();
      if (error) {
        console.error('Error buscando usuario:', error);
        return null;
      }
      console.log('Resultado búsqueda usuario:', data);
      return data;
    } catch (err) {
      console.error('Exception buscando usuario:', err);
      return null;
    }
  },
  
  async getUserByEmail(email) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (error) {
        console.error('Error getUserByEmail:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Exception getUserByEmail:', err);
      return null;
    }
  },
  
  async getPatientByUserId(userId) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      console.log('Buscando paciente con user_id:', userId);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error('Error buscando paciente:', error);
        return null;
      }
      console.log('Resultado búsqueda paciente:', data);
      return data;
    } catch (err) {
      console.error('Exception buscando paciente:', err);
      return null;
    }
  },
  
  async getPatientByNhc(nhc, hospitalId = null) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .eq('nhc', nhc);
      
      // Si se proporciona hospital_id, también filtrar por hospital
      if (hospitalId) {
        query = query.eq('hospital_id', hospitalId);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) {
        console.error('Error getPatientByNhc:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Exception getPatientByNhc:', err);
      return null;
    }
  },
  
  async createPatient(patient) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      console.log('Creando paciente:', patient);
      const { data, error } = await supabase.from('patients').insert([patient]).select();
      if (error) { console.error('Error creating patient:', error); return null; }
      console.log('Paciente creado:', data?.[0]);
      return data?.[0] || null;
    } catch (err) {
      console.error('Exception creating patient:', err);
      return null;
    }
  },
  
  async getScoresByPatientId(patientId) {
    if (!supabase) { console.error('Supabase no configurado'); return []; }
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      if (error) { console.error('Error getting scores:', error); return []; }
      return data || [];
    } catch (err) {
      console.error('Exception getting scores:', err);
      return [];
    }
  },
  
  async createScore(score) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      const { data, error } = await supabase.from('scores').insert([score]).select();
      if (error) { console.error('Error creating score:', error); return null; }
      return data?.[0] || null;
    } catch (err) {
      console.error('Exception creating score:', err);
      return null;
    }
  },
  
  async createAccessLog(log) {
    if (!supabase) { console.error('Supabase no configurado'); return null; }
    try {
      const { data, error } = await supabase.from('access_logs').insert([log]).select();
      if (error) { console.error('Error creating log:', error); return null; }
      return data?.[0] || null;
    } catch (err) {
      console.error('Exception creating log:', err);
      return null;
    }
  }
};

// ============================================
// COMPONENTS
// ============================================

const Brand = ({ size = 'normal' }) => (
  <div className={`brand ${size}`}>
    <span className="brand-at">@</span>
    <span className="brand-name">reumacastro</span>
  </div>
);

const FormInput = ({ label, type = 'text', value, onChange, min, max, step, unit, required = false, placeholder }) => (
  <div className="form-group">
    <label>
      {label}
      {unit && <span className="unit">({unit})</span>}
      {required && <span className="required">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const SliderInput = ({ label, value, onChange, min = 0, max = 10, step = 0.1 }) => (
  <div className="slider-group">
    <label>
      {label}
      <span className="slider-value">{parseFloat(value).toFixed(1)}</span>
    </label>
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
    />
    <div className="slider-labels">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const ResultCard = ({ score, interpretation, instrument, onSave, saved, saving }) => (
  <div className="result-card">
    <div className="result-header">
      <h3>{instrument}</h3>
      <div className="result-score" style={{ backgroundColor: interpretation.color }}>
        {score}
      </div>
    </div>
    <div className="result-interpretation" style={{ borderLeftColor: interpretation.color }}>
      <strong>{interpretation.text}</strong>
    </div>
    <p className="result-disclaimer">
      ⚠️ Resultado orientativo. No sustituye la valoración médica profesional.
    </p>
    {!saved ? (
      <button className="btn-save" onClick={onSave} disabled={saving}>
        {saving ? '⏳ Guardando...' : '💾 Guardar en histórico'}
      </button>
    ) : (
      <div className="saved-badge">✓ Guardado correctamente</div>
    )}
  </div>
);

// ============================================
// CALCULATOR COMPONENTS
// ============================================

const BASDAICalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5
  });
  
  const questions = [
    { key: 'q1', label: '1. Fatiga/cansancio' },
    { key: 'q2', label: '2. Dolor en cuello, espalda o cadera' },
    { key: 'q3', label: '3. Dolor/hinchazón en otras articulaciones' },
    { key: 'q4', label: '4. Molestia al tocar zonas sensibles' },
    { key: 'q5', label: '5. Intensidad de rigidez matutina' },
    { key: 'q6', label: '6. Duración de rigidez matutina (0-10 → 0-2h+)' }
  ];
  
  const handleCalculate = () => {
    const score = calculateBASDAI(components);
    const interpretation = interpretBASDAI(score);
    onResult({ score, interpretation, components, instrument: 'BASDAI' });
  };
  
  return (
    <div className="calculator-form">
      <h3>BASDAI</h3>
      <p className="calc-description">Bath Ankylosing Spondylitis Disease Activity Index</p>
      
      {questions.map(q => (
        <SliderInput
          key={q.key}
          label={q.label}
          value={components[q.key]}
          onChange={(val) => setComponents(prev => ({ ...prev, [q.key]: val }))}
        />
      ))}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular BASDAI
      </button>
    </div>
  );
};

const ASDASCalculator = ({ onResult }) => {
  const [variant, setVariant] = useState('CRP');
  const [components, setComponents] = useState({
    backPain: 5, duration: 5, peripheral: 5, global: 5, crp: 5, esr: 20
  });
  
  const handleCalculate = () => {
    const score = variant === 'CRP' 
      ? calculateASDASwithCRP(components)
      : calculateASDASwithESR(components);
    const interpretation = interpretASDAS(score);
    onResult({ 
      score, 
      interpretation, 
      components: { ...components, variant }, 
      instrument: `ASDAS_${variant}` 
    });
  };
  
  return (
    <div className="calculator-form">
      <h3>ASDAS</h3>
      <p className="calc-description">Ankylosing Spondylitis Disease Activity Score</p>
      
      <div className="variant-selector">
        <button 
          className={variant === 'CRP' ? 'active' : ''} 
          onClick={() => setVariant('CRP')}
        >
          ASDAS-PCR
        </button>
        <button 
          className={variant === 'ESR' ? 'active' : ''} 
          onClick={() => setVariant('ESR')}
        >
          ASDAS-VSG
        </button>
      </div>
      
      <SliderInput
        label="Dolor de espalda (0-10)"
        value={components.backPain}
        onChange={(val) => setComponents(prev => ({ ...prev, backPain: val }))}
      />
      <SliderInput
        label="Duración rigidez matutina (0-10)"
        value={components.duration}
        onChange={(val) => setComponents(prev => ({ ...prev, duration: val }))}
      />
      <SliderInput
        label="Dolor/hinchazón articular periférico (0-10)"
        value={components.peripheral}
        onChange={(val) => setComponents(prev => ({ ...prev, peripheral: val }))}
      />
      <SliderInput
        label="Evaluación global del paciente (0-10)"
        value={components.global}
        onChange={(val) => setComponents(prev => ({ ...prev, global: val }))}
      />
      
      {variant === 'CRP' ? (
        <FormInput
          label="PCR"
          type="number"
          value={components.crp}
          onChange={(val) => setComponents(prev => ({ ...prev, crp: val }))}
          min={0}
          max={200}
          step={0.1}
          unit="mg/L"
        />
      ) : (
        <FormInput
          label="VSG"
          type="number"
          value={components.esr}
          onChange={(val) => setComponents(prev => ({ ...prev, esr: val }))}
          min={0}
          max={150}
          step={1}
          unit="mm/h"
        />
      )}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular ASDAS
      </button>
    </div>
  );
};

const DAPSACalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    pain: 5, global: 5, tjc: 0, sjc: 0, crp: 1
  });
  
  const handleCalculate = () => {
    const score = calculateDAPSA(components);
    const interpretation = interpretDAPSA(score);
    onResult({ score, interpretation, components, instrument: 'DAPSA' });
  };
  
  return (
    <div className="calculator-form">
      <h3>DAPSA</h3>
      <p className="calc-description">Disease Activity in Psoriatic Arthritis</p>
      
      <SliderInput
        label="Dolor (EVA 0-10)"
        value={components.pain}
        onChange={(val) => setComponents(prev => ({ ...prev, pain: val }))}
      />
      <SliderInput
        label="Evaluación global del paciente (0-10)"
        value={components.global}
        onChange={(val) => setComponents(prev => ({ ...prev, global: val }))}
      />
      <FormInput
        label="Articulaciones dolorosas (TJC)"
        type="number"
        value={components.tjc}
        onChange={(val) => setComponents(prev => ({ ...prev, tjc: val }))}
        min={0}
        max={68}
        step={1}
        placeholder="0-68"
      />
      <FormInput
        label="Articulaciones tumefactas (SJC)"
        type="number"
        value={components.sjc}
        onChange={(val) => setComponents(prev => ({ ...prev, sjc: val }))}
        min={0}
        max={66}
        step={1}
        placeholder="0-66"
      />
      <FormInput
        label="PCR"
        type="number"
        value={components.crp}
        onChange={(val) => setComponents(prev => ({ ...prev, crp: val }))}
        min={0}
        max={200}
        step={0.1}
        unit="mg/dL"
      />
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular DAPSA
      </button>
    </div>
  );
};

const DAS28Calculator = ({ onResult }) => {
  const [variant, setVariant] = useState('CRP');
  const [components, setComponents] = useState({
    tjc28: 0, sjc28: 0, global: 50, crp: 5, esr: 20
  });
  
  const handleCalculate = () => {
    const score = variant === 'CRP'
      ? calculateDAS28withCRP(components)
      : calculateDAS28withESR(components);
    const interpretation = interpretDAS28(score);
    onResult({ 
      score, 
      interpretation, 
      components: { ...components, variant }, 
      instrument: `DAS28_${variant}` 
    });
  };
  
  return (
    <div className="calculator-form">
      <h3>DAS28</h3>
      <p className="calc-description">Disease Activity Score 28</p>
      
      <div className="variant-selector">
        <button 
          className={variant === 'CRP' ? 'active' : ''} 
          onClick={() => setVariant('CRP')}
        >
          DAS28-PCR
        </button>
        <button 
          className={variant === 'ESR' ? 'active' : ''} 
          onClick={() => setVariant('ESR')}
        >
          DAS28-VSG
        </button>
      </div>
      
      <FormInput
        label="Articulaciones dolorosas (TJC28)"
        type="number"
        value={components.tjc28}
        onChange={(val) => setComponents(prev => ({ ...prev, tjc28: val }))}
        min={0}
        max={28}
        step={1}
        placeholder="0-28"
      />
      <FormInput
        label="Articulaciones tumefactas (SJC28)"
        type="number"
        value={components.sjc28}
        onChange={(val) => setComponents(prev => ({ ...prev, sjc28: val }))}
        min={0}
        max={28}
        step={1}
        placeholder="0-28"
      />
      <SliderInput
        label="Evaluación global del paciente (0-100)"
        value={components.global}
        onChange={(val) => setComponents(prev => ({ ...prev, global: val }))}
        min={0}
        max={100}
        step={1}
      />
      
      {variant === 'CRP' ? (
        <FormInput
          label="PCR"
          type="number"
          value={components.crp}
          onChange={(val) => setComponents(prev => ({ ...prev, crp: val }))}
          min={0}
          max={200}
          step={0.1}
          unit="mg/L"
        />
      ) : (
        <FormInput
          label="VSG"
          type="number"
          value={components.esr}
          onChange={(val) => setComponents(prev => ({ ...prev, esr: val }))}
          min={0}
          max={150}
          step={1}
          unit="mm/h"
        />
      )}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular DAS28
      </button>
    </div>
  );
};

// ===== NUEVAS CALCULADORAS =====

const SLEDAICalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    seizure: false, psychosis: false, organicBrainSyndrome: false, visualDisturbance: false,
    cranialNerve: false, lupusHeadache: false, cva: false, vasculitis: false,
    arthritis: false, myositis: false, urinaryCasts: false, hematuria: false,
    proteinuria: false, pyuria: false, pleurisy: false, pericarditis: false,
    lowComplement: false, increasedDnaBind: false, fever: false, thrombocytopenia: false,
    leukopenia: false, rash: false, alopecia: false, mucosalUlcers: false
  });

  const handleCalculate = () => {
    const score = calculateSLEDAI(components);
    const interpretation = interpretSLEDAI(score);
    onResult({ score, interpretation, components, instrument: 'SLEDAI' });
  };

  const CheckboxGroup = ({ items }) => (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {items.map(({ key, label, points }) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={components[key]}
            onChange={(e) => setComponents(prev => ({ ...prev, [key]: e.target.checked }))}
          />
          <span>{label} ({points}pts)</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="calculator-form">
      <h3>SLEDAI</h3>
      <p className="calc-description">Systemic Lupus Erythematosus Disease Activity Index</p>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sistema Nervioso (8pts c/u)</h4>
        <CheckboxGroup items={[
          { key: 'seizure', label: 'Convulsiones', points: 8 },
          { key: 'psychosis', label: 'Psicosis', points: 8 },
          { key: 'organicBrainSyndrome', label: 'Síndrome cerebral orgánico', points: 8 },
          { key: 'visualDisturbance', label: 'Alteración visual', points: 8 },
          { key: 'cranialNerve', label: 'Afectación nervios craneales', points: 8 },
          { key: 'lupusHeadache', label: 'Cefalea lúpica', points: 8 },
          { key: 'cva', label: 'ACV', points: 8 }
        ]} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Vascular/Muscular</h4>
        <CheckboxGroup items={[
          { key: 'vasculitis', label: 'Vasculitis', points: 8 },
          { key: 'arthritis', label: 'Artritis', points: 4 },
          { key: 'myositis', label: 'Miositis', points: 4 }
        ]} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Renal (4pts c/u)</h4>
        <CheckboxGroup items={[
          { key: 'urinaryCasts', label: 'Cilindros urinarios', points: 4 },
          { key: 'hematuria', label: 'Hematuria', points: 4 },
          { key: 'proteinuria', label: 'Proteinuria', points: 4 },
          { key: 'pyuria', label: 'Piuria', points: 4 }
        ]} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Serositis/Cutáneo</h4>
        <CheckboxGroup items={[
          { key: 'pleurisy', label: 'Pleuritis', points: 4 },
          { key: 'pericarditis', label: 'Pericarditis', points: 4 },
          { key: 'rash', label: 'Rash', points: 2 },
          { key: 'alopecia', label: 'Alopecia', points: 2 },
          { key: 'mucosalUlcers', label: 'Úlceras mucosas', points: 2 }
        ]} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Inmunológico/Hematológico</h4>
        <CheckboxGroup items={[
          { key: 'lowComplement', label: 'Complemento bajo', points: 2 },
          { key: 'increasedDnaBind', label: 'Anti-DNA elevado', points: 2 },
          { key: 'fever', label: 'Fiebre', points: 1 },
          { key: 'thrombocytopenia', label: 'Trombocitopenia', points: 1 },
          { key: 'leukopenia', label: 'Leucopenia', points: 1 }
        ]} />
      </div>

      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular SLEDAI
      </button>
    </div>
  );
};

const LupusPROCalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    lupusSymptoms: 2, lupusMedications: 2, procreation: 2, physicalHealth: 2,
    painVitality: 2, emotionalHealth: 2, bodyImage: 2, cognition: 2,
    desires: 2, coping: 2, satisfaction: 2
  });

  const handleCalculate = () => {
    const score = calculateLupusPRO(components);
    const interpretation = interpretLupusPRO(score);
    onResult({ score, interpretation, components, instrument: 'LupusPRO' });
  };

  const domains = [
    { key: 'lupusSymptoms', label: 'Síntomas de lupus' },
    { key: 'lupusMedications', label: 'Medicaciones' },
    { key: 'procreation', label: 'Procreación' },
    { key: 'physicalHealth', label: 'Salud física' },
    { key: 'painVitality', label: 'Dolor y vitalidad' },
    { key: 'emotionalHealth', label: 'Salud emocional' },
    { key: 'bodyImage', label: 'Imagen corporal' },
    { key: 'cognition', label: 'Cognición' },
    { key: 'desires', label: 'Deseos y metas' },
    { key: 'coping', label: 'Afrontamiento' },
    { key: 'satisfaction', label: 'Satisfacción con atención médica' }
  ];

  return (
    <div className="calculator-form">
      <h3>LupusPRO v1.8</h3>
      <p className="calc-description">Quality of Life in Systemic Lupus Erythematosus</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Escala: 0=Nunca, 1=Casi nunca, 2=A veces, 3=A menudo, 4=Siempre
      </p>
      
      {domains.map(({ key, label }) => (
        <SliderInput
          key={key}
          label={label}
          value={components[key]}
          onChange={(val) => setComponents(prev => ({ ...prev, [key]: val }))}
          min={0}
          max={4}
          step={0.5}
        />
      ))}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular LupusPRO
      </button>
    </div>
  );
};

const FACITCalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2, q7: 2, q8: 2, q9: 2,
    q10: 2, q11: 2, q12: 2, q13: 2, q14: 2, q15: 2, q16: 2, q17: 2,
    q18: 2, q19: 2, q20: 2, q21: 2, q22: 2, q23: 2, q24: 2, q25: 2,
    q26: 2, q27: 2
  });

  const handleCalculate = () => {
    const score = calculateFACIT(components);
    const interpretation = interpretFACIT(score);
    onResult({ score, interpretation, components, instrument: 'FACIT' });
  };

  const questions = [
    'Me falta energía', 'Tengo náuseas', 'Debido a mi condición física, tengo dificultad para atender las necesidades de mi familia',
    'Tengo dolor', 'Me molestan los efectos secundarios del tratamiento', 'Me siento enfermo/a',
    'Tengo que pasar tiempo en la cama', 'Me siento cercano/a a mis amigos', 'Recibo apoyo emocional de mi familia',
    'Recibo apoyo de mis amigos', 'Mi familia ha aceptado mi enfermedad', 'Estoy satisfecho/a con la comunicación familiar sobre mi enfermedad',
    'Me siento cercano/a a mi pareja (o la persona que es mi principal apoyo)', 'Me siento triste', 'Estoy satisfecho/a con cómo enfrento mi enfermedad',
    'Estoy perdiendo la esperanza en la lucha contra mi enfermedad', 'Me siento nervioso/a', 'Me preocupa morirme',
    'Me preocupa que mi condición empeore', 'Soy capaz de disfrutar de la vida', 'Duermo bien',
    'Disfruto de mis pasatiempos habituales', 'Estoy contento/a con la calidad de mi vida actualmente', 'Puedo trabajar (incluye trabajo en casa)',
    'Mi trabajo me satisface (incluye trabajo en casa)', 'Puedo disfrutar de la vida', 'He aceptado mi enfermedad'
  ];

  return (
    <div className="calculator-form">
      <h3>FACIT-General</h3>
      <p className="calc-description">Functional Assessment of Chronic Illness Therapy</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Escala: 0=Nada, 1=Un poco, 2=Algo, 3=Mucho, 4=Muchísimo
      </p>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {questions.map((question, idx) => (
          <SliderInput
            key={`q${idx + 1}`}
            label={`${idx + 1}. ${question}`}
            value={components[`q${idx + 1}`]}
            onChange={(val) => setComponents(prev => ({ ...prev, [`q${idx + 1}`]: val }))}
            min={0}
            max={4}
            step={0.5}
          />
        ))}
      </div>
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular FACIT
      </button>
    </div>
  );
};

const SF36Calculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    physicalFunctioning: 50, rolePhysical: 50, bodilyPain: 50, generalHealth: 50,
    vitality: 50, socialFunctioning: 50, roleEmotional: 50, mentalHealth: 50
  });

  const handleCalculate = () => {
    const score = calculateSF36(components);
    const interpretation = interpretSF36(score);
    onResult({ score, interpretation, components, instrument: 'SF36' });
  };

  const dimensions = [
    { key: 'physicalFunctioning', label: 'Función física' },
    { key: 'rolePhysical', label: 'Rol físico' },
    { key: 'bodilyPain', label: 'Dolor corporal' },
    { key: 'generalHealth', label: 'Salud general' },
    { key: 'vitality', label: 'Vitalidad' },
    { key: 'socialFunctioning', label: 'Función social' },
    { key: 'roleEmotional', label: 'Rol emocional' },
    { key: 'mentalHealth', label: 'Salud mental' }
  ];

  return (
    <div className="calculator-form">
      <h3>SF-36</h3>
      <p className="calc-description">Short Form 36 Health Survey</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Escala: 0-100 (0=Peor, 100=Mejor)
      </p>
      
      {dimensions.map(({ key, label }) => (
        <SliderInput
          key={key}
          label={label}
          value={components[key]}
          onChange={(val) => setComponents(prev => ({ ...prev, [key]: val }))}
          min={0}
          max={100}
          step={5}
        />
      ))}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular SF-36
      </button>
    </div>
  );
};

const BASFICalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5
  });

  const handleCalculate = () => {
    const score = calculateBASFI(components);
    const interpretation = interpretBASFI(score);
    onResult({ score, interpretation, components, instrument: 'BASFI' });
  };

  const questions = [
    'Ponerse calcetines o medias sin ayuda',
    'Agacharse a recoger algo del suelo',
    'Alcanzar un estante alto sin ayuda',
    'Levantarse de una silla sin respaldo',
    'Levantarse del suelo sin ayuda',
    'Estar de pie 10 minutos sin apoyo',
    'Subir 12-15 escalones sin usar barandilla',
    'Mirar por encima del hombro',
    'Realizar actividades físicamente exigentes',
    'Realizar un día completo de actividades'
  ];

  return (
    <div className="calculator-form">
      <h3>BASFI</h3>
      <p className="calc-description">Bath Ankylosing Spondylitis Functional Index</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Escala: 0=Fácil, 10=Imposible
      </p>
      
      {questions.map((question, idx) => (
        <SliderInput
          key={`q${idx + 1}`}
          label={`${idx + 1}. ${question}`}
          value={components[`q${idx + 1}`]}
          onChange={(val) => setComponents(prev => ({ ...prev, [`q${idx + 1}`]: val }))}
          min={0}
          max={10}
          step={0.5}
        />
      ))}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular BASFI
      </button>
    </div>
  );
};

const ASASHICalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    q1: false, q2: false, q3: false, q4: false, q5: false, q6: false,
    q7: false, q8: false, q9: false, q10: false, q11: false, q12: false,
    q13: false, q14: false, q15: false, q16: false, q17: false
  });

  const handleCalculate = () => {
    const score = calculateASASHI(components);
    const interpretation = interpretASASHI(score);
    onResult({ score, interpretation, components, instrument: 'ASASHI' });
  };

  const questions = [
    'Dolor', 'Sentimientos de depresión', 'Motivación para hacer cualquier cosa',
    'Manejo de situaciones inesperadas', 'Participar en actividades recreativas',
    'Ponerse en cuclillas', 'Estar de pie durante mucho tiempo', 'Caminar por terreno irregular',
    'Subir escaleras', 'Levantarse de una silla sin usar las manos',
    'Ponerse de pie', 'Alcanzar objetos altos', 'Agacharse',
    'Usar transporte público', 'Conducir un coche', 'Lavar el cuerpo',
    'Vestirse'
  ];

  return (
    <div className="calculator-form">
      <h3>ASAS-HI</h3>
      <p className="calc-description">ASAS Health Index</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Marque las actividades con las que tiene dificultad
      </p>
      
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {questions.map((question, idx) => (
          <label key={`q${idx + 1}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={components[`q${idx + 1}`]}
              onChange={(e) => setComponents(prev => ({ ...prev, [`q${idx + 1}`]: e.target.checked }))}
            />
            <span>{idx + 1}. {question}</span>
          </label>
        ))}
      </div>
      
      <button className="btn-calculate" onClick={handleCalculate} style={{ marginTop: '1rem' }}>
        Calcular ASAS-HI
      </button>
    </div>
  );
};

const ASQoLCalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    q1: false, q2: false, q3: false, q4: false, q5: false, q6: false,
    q7: false, q8: false, q9: false, q10: false, q11: false, q12: false,
    q13: false, q14: false, q15: false, q16: false, q17: false, q18: false
  });

  const handleCalculate = () => {
    const score = calculateASQoL(components);
    const interpretation = interpretASQoL(score);
    onResult({ score, interpretation, components, instrument: 'ASQoL' });
  };

  const questions = [
    'Siento que mi enfermedad controla mi vida', 'Tengo que depender demasiado de otras personas',
    'Me siento frustrado/a', 'Me siento cansado/a la mayor parte del tiempo',
    'Me siento socialmente aislado/a', 'Mi enfermedad afecta mi vida social',
    'Siento que soy una carga para otros', 'Me siento físicamente débil',
    'Tengo dificultad para dormir', 'Me siento ansioso/a o deprimido/a',
    'Tengo dificultad para planear el futuro', 'La rigidez es un problema',
    'Me siento frustrado/a por mi lentitud', 'Tengo problemas para vestirme',
    'Tengo dificultad para participar en actividades físicas', 'Evito contacto social',
    'Me siento irritable', 'Mi enfermedad afecta mi relación de pareja'
  ];

  return (
    <div className="calculator-form">
      <h3>ASQoL</h3>
      <p className="calc-description">Ankylosing Spondylitis Quality of Life</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Marque las afirmaciones que se aplican a usted
      </p>
      
      <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {questions.map((question, idx) => (
          <label key={`q${idx + 1}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={components[`q${idx + 1}`]}
              onChange={(e) => setComponents(prev => ({ ...prev, [`q${idx + 1}`]: e.target.checked }))}
              style={{ marginTop: '0.25rem' }}
            />
            <span>{idx + 1}. {question}</span>
          </label>
        ))}
      </div>
      
      <button className="btn-calculate" onClick={handleCalculate} style={{ marginTop: '1rem' }}>
        Calcular ASQoL
      </button>
    </div>
  );
};

const PSAQoLCalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    q1: false, q2: false, q3: false, q4: false, q5: false, q6: false,
    q7: false, q8: false, q9: false, q10: false, q11: false, q12: false,
    q13: false, q14: false, q15: false, q16: false, q17: false, q18: false,
    q19: false, q20: false
  });

  const handleCalculate = () => {
    const score = calculatePSAQoL(components);
    const interpretation = interpretPSAQoL(score);
    onResult({ score, interpretation, components, instrument: 'PSAQoL' });
  };

  const questions = [
    'Siento que mi artritis controla mi vida', 'Tengo dificultad para hacer cosas espontáneamente',
    'Siento frustración', 'Me siento cansado/a la mayor parte del tiempo',
    'Siento que mi artritis afecta mi confianza', 'Tengo dificultad para salir',
    'Siento que soy una carga para otros', 'Me siento débil',
    'Tengo dificultad para vestirme', 'No puedo hacer lo que quiero',
    'Me siento ansioso/a', 'Tengo dificultad para dormir por el dolor',
    'La rigidez es un problema importante', 'Tengo dificultad para planificar',
    'Evito situaciones sociales', 'Me siento aislado/a',
    'Necesito ayuda para actividades diarias', 'Tengo dificultad para concentrarme',
    'Me preocupa mi apariencia', 'Tengo dificultad para mantener relaciones'
  ];

  return (
    <div className="calculator-form">
      <h3>PSAQoL</h3>
      <p className="calc-description">Psoriatic Arthritis Quality of Life (20 items)</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Marque las afirmaciones que se aplican a usted
      </p>
      
      <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {questions.map((question, idx) => (
          <label key={`q${idx + 1}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={components[`q${idx + 1}`]}
              onChange={(e) => setComponents(prev => ({ ...prev, [`q${idx + 1}`]: e.target.checked }))}
              style={{ marginTop: '0.25rem' }}
            />
            <span>{idx + 1}. {question}</span>
          </label>
        ))}
      </div>
      
      <button className="btn-calculate" onClick={handleCalculate} style={{ marginTop: '1rem' }}>
        Calcular PSAQoL
      </button>
    </div>
  );
};

const ESSPRICalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    dryness: 5, fatigue: 5, pain: 5
  });

  const handleCalculate = () => {
    const score = calculateESSPRI(components);
    const interpretation = interpretESSPRI(score);
    onResult({ score, interpretation, components, instrument: 'ESSPRI' });
  };

  return (
    <div className="calculator-form">
      <h3>ESSPRI</h3>
      <p className="calc-description">EULAR Sjögren's Syndrome Patient Reported Index</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        Escala: 0=Ausente, 10=Máximo
      </p>
      
      <SliderInput
        label="Sequedad (boca, ojos, piel, etc.)"
        value={components.dryness}
        onChange={(val) => setComponents(prev => ({ ...prev, dryness: val }))}
        min={0}
        max={10}
        step={0.5}
      />
      <SliderInput
        label="Fatiga"
        value={components.fatigue}
        onChange={(val) => setComponents(prev => ({ ...prev, fatigue: val }))}
        min={0}
        max={10}
        step={0.5}
      />
      <SliderInput
        label="Dolor (articular, muscular)"
        value={components.pain}
        onChange={(val) => setComponents(prev => ({ ...prev, pain: val }))}
        min={0}
        max={10}
        step={0.5}
      />
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular ESSPRI
      </button>
    </div>
  );
};

const SSDAICalculator = ({ onResult }) => {
  const [components, setComponents] = useState({
    fever: false, lymphadenopathy: false, lymphadenopathyBiopsy: false,
    glandularSwelling: false, arthralgia: false, arthritis: false,
    vasculitis: false, purpura: false, pulmonary: false, renal: false,
    myositis: false, cns: false, pns: false, leukopenia: false,
    thrombocytopenia: false, hypergammaglobulinemia: false, hypocomplementemia: false
  });

  const handleCalculate = () => {
    const score = calculateSSDAI(components);
    const interpretation = interpretSSDAI(score);
    onResult({ score, interpretation, components, instrument: 'SSDAI' });
  };

  const CheckboxGroup = ({ items }) => (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      {items.map(({ key, label, points }) => (
        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={components[key]}
            onChange={(e) => setComponents(prev => ({ ...prev, [key]: e.target.checked }))}
          />
          <span>{label} ({points}pts)</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="calculator-form">
      <h3>SSDAI</h3>
      <p className="calc-description">Sjögren's Syndrome Disease Activity Index (Vitali 2007)</p>
      
      <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Constitucional</h4>
          <CheckboxGroup items={[
            { key: 'fever', label: 'Fiebre', points: 1 },
            { key: 'lymphadenopathy', label: 'Linfadenopatía', points: 2 },
            { key: 'lymphadenopathyBiopsy', label: 'Linfadenopatía (biopsia+)', points: 3 }
          ]} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Glandular/Articular</h4>
          <CheckboxGroup items={[
            { key: 'glandularSwelling', label: 'Inflamación glandular', points: 2 },
            { key: 'arthralgia', label: 'Artralgia', points: 2 },
            { key: 'arthritis', label: 'Artritis', points: 4 }
          ]} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Cutáneo</h4>
          <CheckboxGroup items={[
            { key: 'vasculitis', label: 'Vasculitis', points: 3 },
            { key: 'purpura', label: 'Púrpura', points: 6 }
          ]} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Órgano mayor</h4>
          <CheckboxGroup items={[
            { key: 'pulmonary', label: 'Afectación pulmonar', points: 9 },
            { key: 'renal', label: 'Afectación renal', points: 9 },
            { key: 'myositis', label: 'Miositis', points: 6 },
            { key: 'cns', label: 'SNC', points: 9 },
            { key: 'pns', label: 'SNP', points: 9 }
          ]} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Hematológico/Inmunológico</h4>
          <CheckboxGroup items={[
            { key: 'leukopenia', label: 'Leucopenia', points: 1 },
            { key: 'thrombocytopenia', label: 'Trombocitopenia', points: 2 },
            { key: 'hypergammaglobulinemia', label: 'Hipergammaglobulinemia', points: 1 },
            { key: 'hypocomplementemia', label: 'Hipocomplementemia', points: 2 }
          ]} />
        </div>
      </div>
      
      <button className="btn-calculate" onClick={handleCalculate} style={{ marginTop: '1rem' }}>
        Calcular SSDAI
      </button>
    </div>
  );
};

// ============================================
// PAGE COMPONENTS
// ============================================

const LandingPage = ({ onNavigate }) => (
  <div className="landing-page">
    <div className="landing-bg" />
    <div className="landing-content">
      <div className="landing-header">
        <Brand size="large" />
      </div>
      
      <div className="landing-hero">
        <div className="logo-icon">🩺</div>
        <h1>ReumaCal</h1>
        <p className="subtitle">Calculadoras reumatológicas para facilitar tu consulta</p>
      </div>
      
      <div className="landing-buttons">
        <button className="btn-patient" onClick={() => onNavigate('auth', 'patient')}>
          <span className="btn-icon">👤</span>
          <span>Soy paciente</span>
        </button>
        <button className="btn-doctor" onClick={() => onNavigate('auth', 'doctor')}>
          <span className="btn-icon">👨‍⚕️</span>
          <span>Soy reumatólogo</span>
        </button>
      </div>
      
      <div className="landing-features">
        <div className="feature">
          <span className="feature-icon">📊</span>
          <span>BASDAI</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📈</span>
          <span>ASDAS</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📉</span>
          <span>DAPSA</span>
        </div>
        <div className="feature">
          <span className="feature-icon">📋</span>
          <span>DAS28</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🦋</span>
          <span>SLEDAI</span>
        </div>
        <div className="feature">
          <span className="feature-icon">💧</span>
          <span>ESSPRI</span>
        </div>
        <div className="feature">
          <span className="feature-icon">💪</span>
          <span>FACIT</span>
        </div>
        <div className="feature">
          <span className="feature-icon">🏥</span>
          <span>SF-36</span>
        </div>
      </div>
    </div>
    
    <footer className="landing-footer">
      <Brand size="small" />
      <p>© 2025 ReumaCal - Herramienta clínica</p>
    </footer>
  </div>
);

const AuthPage = ({ role, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nhc, setNhc] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cargar hospitales al montar el componente
  useEffect(() => {
    const loadHospitals = async () => {
      const hospitalList = await Storage.getHospitals();
      setHospitals(hospitalList);
    };
    loadHospitals();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        console.log('Intentando login...');
        const user = await Storage.getUserByEmailAndPassword(email, hashPassword(password));
        console.log('Usuario encontrado:', user);
        
        if (!user) {
          setError('Email o contraseña incorrectos');
          setLoading(false);
          return;
        }
        if ((role === 'patient' && user.role !== 'PATIENT') || 
            (role === 'doctor' && user.role !== 'DOCTOR')) {
          setError('Este usuario no tiene el rol correcto');
          setLoading(false);
          return;
        }
        
        let patient = null;
        if (user.role === 'PATIENT') {
          console.log('Buscando paciente para user_id:', user.id);
          patient = await Storage.getPatientByUserId(user.id);
          console.log('Paciente encontrado:', patient);
          
          // Si no se encuentra el paciente, mostrar error
          if (!patient) {
            setError('Error: No se encontró el perfil de paciente. Por favor, contacte soporte.');
            setLoading(false);
            return;
          }
        }
        
        onLogin(user, patient);
      } else {
        // Register
        const existingUser = await Storage.getUserByEmail(email);
        if (existingUser) {
          setError('Este email ya está registrado');
          setLoading(false);
          return;
        }
        
        // Validar hospital
        if (!hospitalId) {
          setError('Por favor selecciona un hospital');
          setLoading(false);
          return;
        }
        
        if (role === 'patient' && !nhc) {
          setError('El NHC es obligatorio');
          setLoading(false);
          return;
        }
        
        if (role === 'patient') {
          const existingPatient = await Storage.getPatientByNhc(nhc, hospitalId);
          if (existingPatient) {
            setError('Este NHC ya está registrado en este hospital');
            setLoading(false);
            return;
          }
        }
        
        const newUser = await Storage.createUser({
          email,
          password_hash: hashPassword(password),
          role: role === 'patient' ? 'PATIENT' : 'DOCTOR',
          display_name: displayName || null,
          hospital_id: hospitalId
        });
        
        if (!newUser) {
          setError('Error al crear el usuario');
          setLoading(false);
          return;
        }
        
        let newPatient = null;
        if (role === 'patient') {
          newPatient = await Storage.createPatient({
            user_id: newUser.id,
            nhc,
            hospital_id: hospitalId
          });
        }
        
        onLogin(newUser, newPatient);
      }
    } catch (err) {
      console.error(err);
      setError('Error al procesar la solicitud');
    }
    setLoading(false);
  };
  
  return (
    <div className="auth-page">
      <button className="btn-back" onClick={onBack}>← Volver</button>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>{role === 'patient' ? '👤 Paciente' : '👨‍⚕️ Reumatólogo'}</h2>
          <div className="auth-tabs">
            <button 
              className={isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(true)}
            >
              Iniciar sesión
            </button>
            <button 
              className={!isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(false)}
            >
              Registrarse
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            placeholder="tu@email.com"
          />
          <FormInput
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            required
            placeholder="••••••••"
          />
          
          {!isLogin && (
            <div className="form-group">
              <label>Hospital *</label>
              <select 
                value={hospitalId} 
                onChange={(e) => setHospitalId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Selecciona tu hospital</option>
                {(() => {
                  // Agrupar hospitales por provincia
                  const byProvince = hospitals.reduce((acc, h) => {
                    const prov = h.province || 'Otros';
                    if (!acc[prov]) acc[prov] = [];
                    acc[prov].push(h);
                    return acc;
                  }, {});
                  
                  // Ordenar provincias alfabéticamente
                  const sortedProvinces = Object.keys(byProvince).sort();
                  
                  return sortedProvinces.map(province => (
                    <optgroup key={province} label={province}>
                      {byProvince[province]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(hospital => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name}
                            {hospital.city && ` (${hospital.city})`}
                          </option>
                        ))
                      }
                    </optgroup>
                  ));
                })()}
              </select>
            </div>
          )}
          
          {!isLogin && role === 'patient' && (
            <>
              <FormInput
                label="Número de Historia Clínica (NHC)"
                value={nhc}
                onChange={setNhc}
                required
                placeholder="Ej: 123456"
              />
              <FormInput
                label="Nombre (opcional)"
                value={displayName}
                onChange={setDisplayName}
                placeholder="Tu nombre"
              />
            </>
          )}
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Crear cuenta')}
          </button>
        </form>
      </div>
      
      <Brand size="small" />
    </div>
  );
};

const PatientDashboard = ({ user, patient, onLogout }) => {
  const [view, setView] = useState('home');
  const [selectedCalc, setSelectedCalc] = useState(null);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadScores();
  }, [patient]);
  
  const loadScores = async () => {
    setLoading(true);
    const patientScores = await Storage.getScoresByPatientId(patient.id);
    setScores(patientScores);
    setLoading(false);
  };
  
  const handleResult = (res) => {
    setResult(res);
    setSaved(false);
  };
  
  const handleSave = async () => {
    setSaving(true);
    const newScore = await Storage.createScore({
      patient_id: patient.id,
      instrument: result.instrument,
      total_score: result.score,
      components_json: result.components
    });
    
    if (newScore) {
      setSaved(true);
      loadScores();
    }
    setSaving(false);
  };
  
  const copyToClipboard = (score) => {
    const text = `${score.instrument}: ${score.total_score} (${formatDate(score.created_at)})`;
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };
  
  const filteredScores = historyFilter === 'ALL' 
    ? scores 
    : scores.filter(s => s.instrument === historyFilter);
  
  const chartData = useMemo(() => {
    if (historyFilter === 'ALL') return [];
    return filteredScores
      .slice()
      .reverse()
      .map(s => ({
        date: formatShortDate(s.created_at),
        score: parseFloat(s.total_score)
      }));
  }, [filteredScores, historyFilter]);
  
  const lastScores = useMemo(() => {
    const instruments = ['BASDAI', 'ASDAS_CRP', 'ASDAS_ESR', 'DAPSA', 'DAS28_CRP', 'DAS28_ESR',
                        'SLEDAI', 'LupusPRO', 'FACIT', 'SF36', 'BASFI', 'ASASHI', 
                        'ASQoL', 'PSAQoL', 'ESSPRI', 'SSDAI'];
    return instruments.reduce((acc, inst) => {
      const last = scores.find(s => s.instrument === inst);
      if (last) acc[inst] = last;
      return acc;
    }, {});
  }, [scores]);
  
  const renderHome = () => (
    <div className="patient-home">
      <h2>Bienvenido/a</h2>
      <p className="nhc-display">NHC: <strong>{patient.nhc}</strong></p>
      
      <div className="quick-summary">
        <h3>Últimas mediciones</h3>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="summary-grid">
            {Object.entries(lastScores).map(([inst, score]) => {
              let interpretation;
              if (inst === 'BASDAI') interpretation = interpretBASDAI(score.total_score);
              else if (inst.startsWith('ASDAS')) interpretation = interpretASDAS(score.total_score);
              else if (inst === 'DAPSA') interpretation = interpretDAPSA(score.total_score);
              else if (inst.startsWith('DAS28')) interpretation = interpretDAS28(score.total_score);
              else if (inst === 'SLEDAI') interpretation = interpretSLEDAI(score.total_score);
              else if (inst === 'LupusPRO') interpretation = interpretLupusPRO(score.total_score);
              else if (inst === 'FACIT') interpretation = interpretFACIT(score.total_score);
              else if (inst === 'SF36') interpretation = interpretSF36(score.total_score);
              else if (inst === 'BASFI') interpretation = interpretBASFI(score.total_score);
              else if (inst === 'ASASHI') interpretation = interpretASASHI(score.total_score);
              else if (inst === 'ASQoL') interpretation = interpretASQoL(score.total_score);
              else if (inst === 'PSAQoL') interpretation = interpretPSAQoL(score.total_score);
              else if (inst === 'ESSPRI') interpretation = interpretESSPRI(score.total_score);
              else if (inst === 'SSDAI') interpretation = interpretSSDAI(score.total_score);
              else interpretation = { text: 'Sin datos', color: '#9ca3af' };
              
              return (
                <div key={inst} className="summary-card" style={{ borderColor: interpretation.color }}>
                  <div className="summary-inst">{inst.replace('_', '-')}</div>
                  <div className="summary-score" style={{ color: interpretation.color }}>
                    {score.total_score}
                  </div>
                  <div className="summary-date">{formatShortDate(score.created_at)}</div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && Object.keys(lastScores).length === 0 && (
          <p className="no-data">Aún no tienes mediciones. ¡Completa tu primera calculadora!</p>
        )}
      </div>
    </div>
  );
  
  const renderCalculators = () => (
    <div className="calculators-view">
      {!selectedCalc ? (
        <>
          <h2>Calculadoras</h2>
          <div className="calc-grid">
            <button className="calc-card" onClick={() => { setSelectedCalc('BASDAI'); setResult(null); }}>
              <span className="calc-icon">📊</span>
              <span className="calc-name">BASDAI</span>
              <span className="calc-desc">Espondilitis anquilosante</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('ASDAS'); setResult(null); }}>
              <span className="calc-icon">📈</span>
              <span className="calc-name">ASDAS</span>
              <span className="calc-desc">Actividad espondiloartritis</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('DAPSA'); setResult(null); }}>
              <span className="calc-icon">📉</span>
              <span className="calc-name">DAPSA</span>
              <span className="calc-desc">Artritis psoriásica</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('DAS28'); setResult(null); }}>
              <span className="calc-icon">📋</span>
              <span className="calc-name">DAS28</span>
              <span className="calc-desc">Artritis reumatoide</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('SLEDAI'); setResult(null); }}>
              <span className="calc-icon">🦋</span>
              <span className="calc-name">SLEDAI</span>
              <span className="calc-desc">Actividad lupus</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('LupusPRO'); setResult(null); }}>
              <span className="calc-icon">💚</span>
              <span className="calc-name">LupusPRO</span>
              <span className="calc-desc">Calidad de vida lupus</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('FACIT'); setResult(null); }}>
              <span className="calc-icon">💪</span>
              <span className="calc-name">FACIT</span>
              <span className="calc-desc">Calidad de vida general</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('SF36'); setResult(null); }}>
              <span className="calc-icon">🏥</span>
              <span className="calc-name">SF-36</span>
              <span className="calc-desc">Encuesta de salud</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('BASFI'); setResult(null); }}>
              <span className="calc-icon">🚶</span>
              <span className="calc-name">BASFI</span>
              <span className="calc-desc">Función espondilitis</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('ASASHI'); setResult(null); }}>
              <span className="calc-icon">💡</span>
              <span className="calc-name">ASAS-HI</span>
              <span className="calc-desc">Impacto en salud</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('ASQoL'); setResult(null); }}>
              <span className="calc-icon">😊</span>
              <span className="calc-name">ASQoL</span>
              <span className="calc-desc">Calidad de vida EA</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('PSAQoL'); setResult(null); }}>
              <span className="calc-icon">🎯</span>
              <span className="calc-name">PSAQoL</span>
              <span className="calc-desc">Calidad de vida APs</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('ESSPRI'); setResult(null); }}>
              <span className="calc-icon">💧</span>
              <span className="calc-name">ESSPRI</span>
              <span className="calc-desc">Síntomas Sjögren</span>
            </button>
            <button className="calc-card" onClick={() => { setSelectedCalc('SSDAI'); setResult(null); }}>
              <span className="calc-icon">🔬</span>
              <span className="calc-name">SSDAI</span>
              <span className="calc-desc">Actividad Sjögren</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="btn-back-calc" onClick={() => { setSelectedCalc(null); setResult(null); }}>
            ← Volver a calculadoras
          </button>
          
          <div className="calc-container">
            {selectedCalc === 'BASDAI' && <BASDAICalculator onResult={handleResult} />}
            {selectedCalc === 'ASDAS' && <ASDASCalculator onResult={handleResult} />}
            {selectedCalc === 'DAPSA' && <DAPSACalculator onResult={handleResult} />}
            {selectedCalc === 'DAS28' && <DAS28Calculator onResult={handleResult} />}
            {selectedCalc === 'SLEDAI' && <SLEDAICalculator onResult={handleResult} />}
            {selectedCalc === 'LupusPRO' && <LupusPROCalculator onResult={handleResult} />}
            {selectedCalc === 'FACIT' && <FACITCalculator onResult={handleResult} />}
            {selectedCalc === 'SF36' && <SF36Calculator onResult={handleResult} />}
            {selectedCalc === 'BASFI' && <BASFICalculator onResult={handleResult} />}
            {selectedCalc === 'ASASHI' && <ASASHICalculator onResult={handleResult} />}
            {selectedCalc === 'ASQoL' && <ASQoLCalculator onResult={handleResult} />}
            {selectedCalc === 'PSAQoL' && <PSAQoLCalculator onResult={handleResult} />}
            {selectedCalc === 'ESSPRI' && <ESSPRICalculator onResult={handleResult} />}
            {selectedCalc === 'SSDAI' && <SSDAICalculator onResult={handleResult} />}
            
            {result && (
              <ResultCard
                score={result.score}
                interpretation={result.interpretation}
                instrument={result.instrument}
                onSave={handleSave}
                saved={saved}
                saving={saving}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
  
  const renderHistory = () => (
    <div className="history-view">
      <h2>Histórico</h2>
      
      <div className="history-filter">
        <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
          <option value="ALL">Todos los instrumentos</option>
          <option value="BASDAI">BASDAI</option>
          <option value="ASDAS_CRP">ASDAS-PCR</option>
          <option value="ASDAS_ESR">ASDAS-VSG</option>
          <option value="DAPSA">DAPSA</option>
          <option value="DAS28_CRP">DAS28-PCR</option>
          <option value="DAS28_ESR">DAS28-VSG</option>
          <option value="SLEDAI">SLEDAI</option>
          <option value="LupusPRO">LupusPRO</option>
          <option value="FACIT">FACIT</option>
          <option value="SF36">SF-36</option>
          <option value="BASFI">BASFI</option>
          <option value="ASASHI">ASAS-HI</option>
          <option value="ASQoL">ASQoL</option>
          <option value="PSAQoL">PSAQoL</option>
          <option value="ESSPRI">ESSPRI</option>
          <option value="SSDAI">SSDAI</option>
        </select>
      </div>
      
      {historyFilter !== 'ALL' && chartData.length > 1 && (
        <div className="history-chart">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#0891b2" strokeWidth={2} dot={{ fill: '#0891b2' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Instrumento</th>
                <th>Puntuación</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score) => {
                let interpretation;
                if (score.instrument === 'BASDAI') interpretation = interpretBASDAI(score.total_score);
                else if (score.instrument.startsWith('ASDAS')) interpretation = interpretASDAS(score.total_score);
                else if (score.instrument === 'DAPSA') interpretation = interpretDAPSA(score.total_score);
                else interpretation = interpretDAS28(score.total_score);
                
                return (
                  <tr key={score.id}>
                    <td>{formatDate(score.created_at)}</td>
                    <td>{score.instrument.replace('_', '-')}</td>
                    <td className="score-cell" style={{ color: interpretation.color }}>
                      {score.total_score}
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: interpretation.color }}>
                        {interpretation.text}
                      </span>
                    </td>
                    <td>
                      <button className="btn-copy" onClick={() => copyToClipboard(score)} title="Copiar">
                        📋
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredScores.length === 0 && (
            <p className="no-data">No hay registros para mostrar</p>
          )}
        </div>
      )}
    </div>
  );
  
  const renderProfile = () => (
    <div className="profile-view">
      <h2>Mi perfil</h2>
      <div className="profile-card">
        <div className="profile-avatar">👤</div>
        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>NHC:</strong> {patient.nhc}</p>
          {patient.display_name && <p><strong>Nombre:</strong> {patient.display_name}</p>}
          <p><strong>Registrado:</strong> {formatDate(user.created_at)}</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="dashboard patient-dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="logo-mini">🩺</span>
          <span className="app-name">ReumaCal</span>
        </div>
        <nav className="header-nav">
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Inicio</button>
          <button className={view === 'calculators' ? 'active' : ''} onClick={() => setView('calculators')}>Calculadoras</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>Histórico</button>
          <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>Perfil</button>
        </nav>
        <button className="btn-logout" onClick={onLogout}>Salir</button>
      </header>
      
      <main className="dashboard-content">
        {view === 'home' && renderHome()}
        {view === 'calculators' && renderCalculators()}
        {view === 'history' && renderHistory()}
        {view === 'profile' && renderProfile()}
      </main>
      
      <footer className="dashboard-footer">
        <Brand size="small" />
      </footer>
    </div>
  );
};

const DoctorDashboard = ({ user, onLogout }) => {
  const [view, setView] = useState('search');
  const [searchNhc, setSearchNhc] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientScores, setPatientScores] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userHospital, setUserHospital] = useState(null);
  const [patientHospital, setPatientHospital] = useState(null);
  
  // Cargar información del hospital del usuario
  useEffect(() => {
    const loadUserHospital = async () => {
      if (user.hospital_id) {
        const hospitals = await Storage.getHospitals();
        const hospital = hospitals.find(h => h.id === user.hospital_id);
        setUserHospital(hospital);
      }
    };
    loadUserHospital();
  }, [user.hospital_id]);
  
  const searchPatient = async () => {
    setError('');
    setLoading(true);
    
    // Buscar paciente por NHC Y hospital del médico
    const patient = await Storage.getPatientByNhc(searchNhc, user.hospital_id);
    
    if (!patient) {
      setError('No se encontró ningún paciente con ese NHC en tu hospital');
      setSelectedPatient(null);
      setPatientHospital(null);
      setLoading(false);
      return;
    }
    
    // Cargar información del hospital del paciente
    if (patient.hospital_id) {
      const hospitals = await Storage.getHospitals();
      const hospital = hospitals.find(h => h.id === patient.hospital_id);
      setPatientHospital(hospital);
    }
    
    // Log access
    await Storage.createAccessLog({
      doctor_id: user.id,
      patient_id: patient.id,
      nhc: searchNhc
    });
    
    const scores = await Storage.getScoresByPatientId(patient.id);
    
    setSelectedPatient(patient);
    setPatientScores(scores);
    setView('patient');
    setLoading(false);
  };
  
  const filteredScores = historyFilter === 'ALL'
    ? patientScores
    : patientScores.filter(s => s.instrument === historyFilter);
  
  const chartData = useMemo(() => {
    if (historyFilter === 'ALL') return [];
    return filteredScores
      .slice()
      .reverse()
      .map(s => ({
        date: formatShortDate(s.created_at),
        score: parseFloat(s.total_score)
      }));
  }, [filteredScores, historyFilter]);
  
  const lastScores = useMemo(() => {
    const instruments = ['BASDAI', 'ASDAS_CRP', 'ASDAS_ESR', 'DAPSA', 'DAS28_CRP', 'DAS28_ESR'];
    return instruments.reduce((acc, inst) => {
      const last = patientScores.find(s => s.instrument === inst);
      if (last) acc[inst] = last;
      return acc;
    }, {});
  }, [patientScores]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const renderSearch = () => (
    <div className="search-view">
      <h2>Buscar paciente</h2>
      {userHospital && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0f9ff',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #3b82f6'
        }}>
          <p style={{ margin: 0, color: '#1e40af', fontSize: '0.95rem' }}>
            🏥 <strong>{userHospital.name}</strong>
            {userHospital.city && ` - ${userHospital.city}`}
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Solo se mostrarán pacientes de tu hospital
          </p>
        </div>
      )}
      <div className="search-box">
        <FormInput
          label="Número de Historia Clínica (NHC)"
          value={searchNhc}
          onChange={setSearchNhc}
          placeholder="Introduzca el NHC"
        />
        <button className="btn-search" onClick={searchPatient} disabled={loading}>
          {loading ? '⏳ Buscando...' : '🔍 Buscar'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
  
  const renderPatient = () => (
    <div className="patient-view">
      <button className="btn-back-calc" onClick={() => { setView('search'); setSelectedPatient(null); }}>
        ← Nueva búsqueda
      </button>
      
      <div className="patient-header">
        <h2>Paciente NHC: {selectedPatient.nhc}</h2>
        {patientHospital && (
          <p style={{ margin: '0.5rem 0', color: '#64748b', fontSize: '0.95rem' }}>
            🏥 {patientHospital.name}
            {patientHospital.city && ` - ${patientHospital.city}`}
          </p>
        )}
        <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir</button>
      </div>
      
      <div className="patient-summary">
        <h3>Resumen última medición</h3>
        <div className="summary-grid">
          {Object.entries(lastScores).map(([inst, score]) => {
            let interpretation;
            if (inst === 'BASDAI') interpretation = interpretBASDAI(score.total_score);
            else if (inst.startsWith('ASDAS')) interpretation = interpretASDAS(score.total_score);
            else if (inst === 'DAPSA') interpretation = interpretDAPSA(score.total_score);
            else interpretation = interpretDAS28(score.total_score);
            
            return (
              <div key={inst} className="summary-card" style={{ borderColor: interpretation.color }}>
                <div className="summary-inst">{inst.replace('_', '-')}</div>
                <div className="summary-score" style={{ color: interpretation.color }}>
                  {score.total_score}
                </div>
                <div className="summary-status" style={{ backgroundColor: interpretation.color }}>
                  {interpretation.text}
                </div>
                <div className="summary-date">{formatShortDate(score.created_at)}</div>
              </div>
            );
          })}
        </div>
        {Object.keys(lastScores).length === 0 && (
          <p className="no-data">Este paciente no tiene mediciones registradas</p>
        )}
      </div>
      
      <div className="patient-history">
        <h3>Histórico completo</h3>
        
        <div className="history-filter">
          <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
            <option value="ALL">Todos los instrumentos</option>
            <option value="BASDAI">BASDAI</option>
            <option value="ASDAS_CRP">ASDAS-PCR</option>
            <option value="ASDAS_ESR">ASDAS-VSG</option>
            <option value="DAPSA">DAPSA</option>
            <option value="DAS28_CRP">DAS28-PCR</option>
            <option value="DAS28_ESR">DAS28-VSG</option>
          </select>
        </div>
        
        {historyFilter !== 'ALL' && chartData.length > 1 && (
          <div className="history-chart">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#0891b2" strokeWidth={2} dot={{ fill: '#0891b2' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Instrumento</th>
                <th>Puntuación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score) => {
                let interpretation;
                if (score.instrument === 'BASDAI') interpretation = interpretBASDAI(score.total_score);
                else if (score.instrument.startsWith('ASDAS')) interpretation = interpretASDAS(score.total_score);
                else if (score.instrument === 'DAPSA') interpretation = interpretDAPSA(score.total_score);
                else interpretation = interpretDAS28(score.total_score);
                
                return (
                  <tr key={score.id}>
                    <td>{formatDate(score.created_at)}</td>
                    <td>{score.instrument.replace('_', '-')}</td>
                    <td className="score-cell" style={{ color: interpretation.color }}>
                      {score.total_score}
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: interpretation.color }}>
                        {interpretation.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredScores.length === 0 && (
            <p className="no-data">No hay registros para mostrar</p>
          )}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="dashboard doctor-dashboard">
      <header className="dashboard-header doctor-header">
        <div className="header-brand">
          <span className="logo-mini">🩺</span>
          <span className="app-name">ReumaCal</span>
          <span className="role-badge">Reumatólogo</span>
        </div>
        <nav className="header-nav">
          <button className={view === 'search' ? 'active' : ''} onClick={() => setView('search')}>Buscar paciente</button>
          {selectedPatient && (
            <button className={view === 'patient' ? 'active' : ''} onClick={() => setView('patient')}>
              Paciente actual
            </button>
          )}
        </nav>
        <button className="btn-logout" onClick={onLogout}>Salir</button>
      </header>
      
      <main className="dashboard-content">
        {view === 'search' && renderSearch()}
        {view === 'patient' && selectedPatient && renderPatient()}
      </main>
      
      <footer className="dashboard-footer">
        <Brand size="small" />
      </footer>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const [page, setPage] = useState('landing');
  const [authRole, setAuthRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  
  const handleNavigate = (newPage, role = null) => {
    setPage(newPage);
    if (role) setAuthRole(role);
  };
  
  const handleLogin = (user, patient) => {
    setCurrentUser(user);
    setCurrentPatient(patient);
    setPage(user.role === 'PATIENT' ? 'patient-dashboard' : 'doctor-dashboard');
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPatient(null);
    setPage('landing');
  };
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        :root {
          --primary: #0891b2;
          --primary-dark: #0e7490;
          --primary-light: #22d3ee;
          --secondary: #6366f1;
          --success: #10b981;
          --warning: #f59e0b;
          --danger: #ef4444;
          --bg: #f8fafc;
          --bg-card: #ffffff;
          --text: #1e293b;
          --text-light: #64748b;
          --border: #e2e8f0;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
        }
        
        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }
        
        .brand {
          display: flex;
          align-items: center;
          gap: 2px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .brand.large { font-size: 1.5rem; }
        .brand.small { font-size: 0.875rem; opacity: 0.7; }
        .brand-at { color: var(--primary); font-weight: 700; }
        .brand-name { color: var(--text); font-weight: 600; }
        
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .landing-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdfa 100%);
          z-index: 0;
        }
        .landing-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -30%;
          width: 80%;
          height: 150%;
          background: radial-gradient(ellipse at center, rgba(8, 145, 178, 0.08) 0%, transparent 70%);
        }
        .landing-content {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
        }
        .landing-header {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
        }
        .landing-hero { margin-bottom: 3rem; }
        .logo-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          filter: drop-shadow(0 4px 8px rgba(8, 145, 178, 0.3));
        }
        .landing-hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 3.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          font-size: 1.25rem;
          color: var(--text-light);
          max-width: 400px;
        }
        .landing-buttons {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .landing-buttons button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem 3rem;
          border: none;
          border-radius: 16px;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: var(--shadow);
        }
        .btn-patient {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
        }
        .btn-patient:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        .btn-doctor {
          background: white;
          color: var(--text);
          border: 2px solid var(--border) !important;
        }
        .btn-doctor:hover {
          border-color: var(--primary) !important;
          color: var(--primary);
          transform: translateY(-2px);
        }
        .btn-icon { font-size: 2rem; }
        .landing-features {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 500;
          box-shadow: var(--shadow);
        }
        .feature-icon { font-size: 1.25rem; }
        .landing-footer {
          position: relative;
          z-index: 1;
          padding: 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .landing-footer p {
          font-size: 0.75rem;
          color: var(--text-light);
        }
        
        .auth-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        .btn-back {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          box-shadow: var(--shadow);
          transition: all 0.2s;
        }
        .btn-back:hover { background: var(--bg); }
        .auth-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: var(--shadow-lg);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-header h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .auth-tabs {
          display: flex;
          background: var(--bg);
          border-radius: 10px;
          padding: 4px;
        }
        .auth-tabs button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s;
        }
        .auth-tabs button.active {
          background: white;
          box-shadow: var(--shadow);
        }
        
        .form-group { margin-bottom: 1.25rem; }
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }
        .form-group .unit { font-weight: 400; margin-left: 0.25rem; }
        .form-group .required { color: var(--danger); margin-left: 0.25rem; }
        .form-group input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
        }
        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error-message {
          background: #fef2f2;
          color: var(--danger);
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .dashboard-header {
          background: white;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .logo-mini { font-size: 1.5rem; }
        .app-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }
        .role-badge {
          background: var(--secondary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }
        .header-nav {
          display: flex;
          gap: 0.5rem;
        }
        .header-nav button {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .header-nav button:hover { background: var(--bg); }
        .header-nav button.active {
          background: var(--primary);
          color: white;
        }
        .btn-logout {
          padding: 0.5rem 1rem;
          background: var(--bg);
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          background: #fee2e2;
          color: var(--danger);
        }
        .dashboard-content {
          flex: 1;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .dashboard-footer {
          padding: 1.5rem;
          text-align: center;
          background: white;
          border-top: 1px solid var(--border);
        }
        
        .patient-home h2 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .nhc-display {
          color: var(--text-light);
          margin-bottom: 2rem;
        }
        .quick-summary h3 {
          font-size: 1.125rem;
          margin-bottom: 1rem;
          color: var(--text-light);
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 1rem;
        }
        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
          box-shadow: var(--shadow);
          border-left: 4px solid;
        }
        .summary-inst {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }
        .summary-score {
          font-size: 2rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .summary-status {
          font-size: 0.625rem;
          font-weight: 600;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          margin: 0.5rem auto;
          display: inline-block;
        }
        .summary-date {
          font-size: 0.75rem;
          color: var(--text-light);
        }
        .no-data {
          text-align: center;
          color: var(--text-light);
          padding: 2rem;
        }
        
        .calculators-view h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .calc-card {
          background: white;
          border: none;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .calc-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .calc-icon { font-size: 2.5rem; }
        .calc-name {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .calc-desc {
          font-size: 0.875rem;
          color: var(--text-light);
        }
        .btn-back-calc {
          background: var(--bg);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .btn-back-calc:hover { background: var(--border); }
        .calc-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .calc-container { grid-template-columns: 1fr; }
        }
        
        .calculator-form {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: var(--shadow);
        }
        .calculator-form h3 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .calc-description {
          color: var(--text-light);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .variant-selector {
          display: flex;
          background: var(--bg);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 1.5rem;
        }
        .variant-selector button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s;
        }
        .variant-selector button.active {
          background: white;
          box-shadow: var(--shadow);
          color: var(--primary);
        }
        .slider-group { margin-bottom: 1.25rem; }
        .slider-group label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-light);
          margin-bottom: 0.5rem;
        }
        .slider-value {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          color: var(--primary);
          font-size: 1.125rem;
        }
        .slider-group input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          appearance: none;
          background: linear-gradient(to right, var(--primary-light), var(--primary));
          outline: none;
        }
        .slider-group input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border: 3px solid var(--primary);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: var(--shadow);
        }
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-light);
          margin-top: 0.25rem;
        }
        .btn-calculate {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
        }
        .btn-calculate:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }
        
        .result-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: var(--shadow);
          height: fit-content;
        }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .result-header h3 { font-size: 1.25rem; }
        .result-score {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 12px;
        }
        .result-interpretation {
          padding: 1rem;
          background: var(--bg);
          border-radius: 10px;
          border-left: 4px solid;
          margin-bottom: 1rem;
        }
        .result-disclaimer {
          font-size: 0.75rem;
          color: var(--text-light);
          margin-bottom: 1.5rem;
        }
        .btn-save {
          width: 100%;
          padding: 1rem;
          background: var(--success);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-save:hover:not(:disabled) { filter: brightness(1.1); }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .saved-badge {
          width: 100%;
          padding: 1rem;
          background: #d1fae5;
          color: var(--success);
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
        }
        
        .history-view h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .history-filter { margin-bottom: 1.5rem; }
        .history-filter select {
          padding: 0.75rem 1rem;
          border: 2px solid var(--border);
          border-radius: 10px;
          font-size: 1rem;
          background: white;
          cursor: pointer;
          min-width: 200px;
        }
        .history-chart {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          margin-bottom: 1.5rem;
        }
        .history-table {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: var(--shadow);
          overflow-x: auto;
        }
        .history-table table {
          width: 100%;
          border-collapse: collapse;
        }
        .history-table th,
        .history-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        .history-table th {
          font-weight: 600;
          color: var(--text-light);
          font-size: 0.875rem;
          text-transform: uppercase;
        }
        .score-cell {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }
        .btn-copy {
          background: var(--bg);
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-copy:hover { background: var(--border); }
        
        .profile-view h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .profile-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: var(--shadow);
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .profile-avatar {
          font-size: 4rem;
          background: var(--bg);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .profile-info p {
          margin-bottom: 0.5rem;
          color: var(--text-light);
        }
        .profile-info strong { color: var(--text); }
        
        .doctor-header {
          background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
        }
        .doctor-header .app-name,
        .doctor-header .header-nav button,
        .doctor-header .btn-logout {
          color: white;
        }
        .doctor-header .header-nav button:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .doctor-header .header-nav button.active {
          background: white;
          color: #4338ca;
        }
        .doctor-header .btn-logout {
          background: rgba(255, 255, 255, 0.1);
        }
        .doctor-header .btn-logout:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .doctor-header .logo-mini {
          filter: brightness(0) invert(1);
        }
        
        .search-view h2 {
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .search-box {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: var(--shadow);
          max-width: 500px;
        }
        .btn-search {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--secondary) 0%, #4338ca 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-search:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }
        .btn-search:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .patient-view .patient-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .patient-view .patient-header h2 { margin: 0; }
        .patient-name { color: var(--text-light); }
        .btn-print {
          margin-left: auto;
          padding: 0.75rem 1.5rem;
          background: var(--bg);
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-print:hover { background: var(--border); }
        .patient-summary { margin-bottom: 2rem; }
        .patient-summary h3,
        .patient-history h3 {
          font-size: 1.125rem;
          margin-bottom: 1rem;
          color: var(--text-light);
        }
        
        @media print {
          .dashboard-header,
          .dashboard-footer,
          .btn-back-calc,
          .btn-print,
          .history-filter {
            display: none !important;
          }
          .dashboard-content { padding: 0; }
          .summary-card,
          .history-table {
            box-shadow: none;
            border: 1px solid var(--border);
          }
        }
        
        @media (max-width: 768px) {
          .landing-hero h1 { font-size: 2.5rem; }
          .landing-buttons {
            flex-direction: column;
            width: 100%;
            padding: 0 1rem;
          }
          .landing-buttons button { width: 100%; }
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          .header-nav {
            flex-wrap: wrap;
            justify-content: center;
          }
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
          .history-table { font-size: 0.875rem; }
          .history-table th,
          .history-table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
      
      {page === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {page === 'auth' && <AuthPage role={authRole} onLogin={handleLogin} onBack={() => setPage('landing')} />}
      {page === 'patient-dashboard' && currentUser && currentPatient && (
        <PatientDashboard user={currentUser} patient={currentPatient} onLogout={handleLogout} />
      )}
      {page === 'doctor-dashboard' && currentUser && (
        <DoctorDashboard user={currentUser} onLogout={handleLogout} />
      )}
    </>
  );
}
