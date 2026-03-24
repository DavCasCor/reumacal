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

const interpretMDAScore = (score) => {
  // score es el número de criterios cumplidos (0-7)
  if (score >= 5) return { text: 'MDA alcanzado', color: '#10b981', level: 'achieved' };
  return { text: 'MDA no alcanzado', color: '#ef4444', level: 'not-achieved' };
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
    bodilyPain: parseFloat(components.bodilyPain || 50),
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
// HELPER: Interpret any instrument score
// ============================================
const interpretScore = (instrument, score) => {
  if (instrument === 'BASDAI') return interpretBASDAI(score);
  if (instrument.startsWith('ASDAS')) return interpretASDAS(score);
  if (instrument === 'DAPSA') return interpretDAPSA(score);
  if (instrument.startsWith('DAS28')) return interpretDAS28(score);
  if (instrument === 'SLEDAI') return interpretSLEDAI(score);
  if (instrument === 'LupusPRO') return interpretLupusPRO(score);
  if (instrument === 'FACIT') return interpretFACIT(score);
  if (instrument === 'SF36') return interpretSF36(score);
  if (instrument === 'BASFI') return interpretBASFI(score);
  if (instrument === 'ASASHI') return interpretASASHI(score);
  if (instrument === 'ASQoL') return interpretASQoL(score);
  if (instrument === 'PSAQoL') return interpretPSAQoL(score);
  if (instrument === 'ESSPRI') return interpretESSPRI(score);
  if (instrument === 'SSDAI') return interpretSSDAI(score);
  return { text: 'Sin datos', color: '#9ca3af' };
};

// All instrument keys
const ALL_INSTRUMENTS = [
  'BASDAI', 'ASDAS_CRP', 'ASDAS_ESR', 'DAPSA', 'DAS28_CRP', 'DAS28_ESR',
  'SLEDAI', 'LupusPRO', 'FACIT', 'SF36', 'BASFI', 'ASASHI',
  'ASQoL', 'PSAQoL', 'ESSPRI', 'SSDAI'
];

// SCORE2 - Cardiovascular Risk Calculator (40-69 years)
const calculateSCORE2 = (components) => {
  const age = parseInt(components.age || 50);
  const sex = components.sex || 'male';
  const smoking = components.smoking || 'no';
  const sbp = parseFloat(components.sbp || 120);
  const cholesterol = parseFloat(components.cholesterol || 5);
  const region = components.region || 'moderate';
  
  let risk = 0;
  risk += (age - 40) * 0.3;
  if (sex === 'male') risk += 3;
  if (smoking === 'yes') risk += 5;
  
  if (sbp < 120) risk += 0;
  else if (sbp < 140) risk += 2;
  else if (sbp < 160) risk += 4;
  else if (sbp < 180) risk += 7;
  else risk += 10;
  
  if (cholesterol < 5) risk += 0;
  else if (cholesterol < 6) risk += 1.5;
  else if (cholesterol < 7) risk += 3;
  else risk += 4.5;
  
  if (region === 'low') risk *= 0.7;
  else if (region === 'moderate') risk *= 1.0;
  else if (region === 'high') risk *= 1.3;
  else if (region === 'very_high') risk *= 1.6;
  
  risk = Math.min(risk, 40);
  return Math.round(risk * 10) / 10;
};

const interpretSCORE2 = (score) => {
  if (score < 2.5) return { text: 'Riesgo bajo-moderado (<2.5%)', color: '#10b981', level: 'low' };
  if (score < 7.5) return { text: 'Riesgo moderado (2.5-7.5%)', color: '#f59e0b', level: 'moderate' };
  if (score < 10) return { text: 'Riesgo alto (7.5-10%)', color: '#ef4444', level: 'high' };
  return { text: 'Riesgo muy alto (≥10%)', color: '#dc2626', level: 'very_high' };
};

// SCORE2-OP - Cardiovascular Risk Calculator (70+ years)
const calculateSCORE2OP = (components) => {
  const age = parseInt(components.age || 70);
  const sex = components.sex || 'male';
  const smoking = components.smoking || 'no';
  const sbp = parseFloat(components.sbp || 120);
  const cholesterol = parseFloat(components.cholesterol || 5);
  
  let risk = 0;
  risk += (age - 70) * 0.5;
  if (sex === 'male') risk += 5;
  if (smoking === 'yes') risk += 8;
  
  if (sbp < 120) risk += 0;
  else if (sbp < 140) risk += 3;
  else if (sbp < 160) risk += 6;
  else if (sbp < 180) risk += 10;
  else risk += 15;
  
  if (cholesterol < 5) risk += 0;
  else if (cholesterol < 6) risk += 2;
  else if (cholesterol < 7) risk += 4;
  else risk += 6;
  
  risk = Math.min(risk, 50);
  return Math.round(risk * 10) / 10;
};

const interpretSCORE2OP = (score) => {
  if (score < 7.5) return { text: 'Riesgo bajo (<7.5%)', color: '#10b981', level: 'low' };
  if (score < 15) return { text: 'Riesgo moderado (7.5-15%)', color: '#f59e0b', level: 'moderate' };
  if (score < 22.5) return { text: 'Riesgo alto (15-22.5%)', color: '#ef4444', level: 'high' };
  return { text: 'Riesgo muy alto (≥22.5%)', color: '#dc2626', level: 'very_high' };
};

// QRISK3 - Riesgo cardiovascular
const calculateQRISK3 = (components) => {
  const age = parseInt(components.age || 40);
  const sex = components.sex || 'male';
  const smoking = components.smoking || 'no';
  const diabetes = components.diabetes || 'no';
  const sbp = parseFloat(components.sbp || 120);
  const cholesterol = parseFloat(components.cholesterol || 5);
  const hdl = parseFloat(components.hdl || 1.3);
  const bmi = parseFloat(components.bmi || 25);
  
  let risk = 0;
  risk += (age - 40) * 0.3;
  if (sex === 'male') risk += 4;
  if (smoking === 'yes') risk += 5;
  if (diabetes === 'yes') risk += 8;
  
  if (sbp < 120) risk += 0;
  else if (sbp < 140) risk += 2;
  else if (sbp < 160) risk += 5;
  else if (sbp < 180) risk += 8;
  else risk += 12;
  
  const cholHdlRatio = cholesterol / hdl;
  if (cholHdlRatio < 4) risk += 0;
  else if (cholHdlRatio < 5) risk += 2;
  else if (cholHdlRatio < 6) risk += 4;
  else risk += 6;
  
  if (bmi < 25) risk += 0;
  else if (bmi < 30) risk += 2;
  else risk += 4;
  
  risk = Math.min(risk, 50);
  return Math.round(risk * 10) / 10;
};

const interpretQRISK3 = (score) => {
  if (score < 10) return { text: 'Riesgo bajo (<10%)', color: '#10b981', level: 'low' };
  if (score < 20) return { text: 'Riesgo moderado (10-20%)', color: '#f59e0b', level: 'moderate' };
  return { text: 'Riesgo alto (≥20%)', color: '#ef4444', level: 'high' };
};

const interpretFRAX = (majorFractureRisk) => {
  const risk = parseFloat(majorFractureRisk);
  if (risk >= 20) return { text: 'Riesgo alto de fractura (≥20%)', color: '#ef4444', level: 'high' };
  if (risk >= 10) return { text: 'Riesgo moderado de fractura (10-20%)', color: '#f59e0b', level: 'moderate' };
  return { text: 'Riesgo bajo de fractura (<10%)', color: '#10b981', level: 'low' };
};

const interpretFRAXplus = (immediateFractureRisk) => {
  const risk = parseFloat(immediateFractureRisk);
  if (risk >= 20) return { text: 'Riesgo muy alto de fractura (≥20%)', color: '#dc2626', level: 'very-high' };
  if (risk >= 10) return { text: 'Riesgo alto de fractura (10-20%)', color: '#f59e0b', level: 'high' };
  return { text: 'Riesgo moderado-bajo de fractura (<10%)', color: '#10b981', level: 'moderate-low' };
};

// SLICC - Systemic Lupus International Collaborating Clinics Damage Index
const calculateSLICC = (components) => {
  let total = 0;
  Object.keys(components).forEach(key => {
    if (components[key] === true || components[key] === 1) {
      total += 1;
    }
  });
  return total;
};

const interpretSLICC = (score) => {
  if (score === 0) return { text: 'Sin daño', color: '#10b981', level: 'none' };
  if (score <= 2) return { text: 'Daño leve (1-2)', color: '#84cc16', level: 'mild' };
  if (score <= 4) return { text: 'Daño moderado (3-4)', color: '#f59e0b', level: 'moderate' };
  return { text: 'Daño severo (≥5)', color: '#ef4444', level: 'severe' };
};

// ============================================
// CONFIGURACIÓN DE CALCULADORAS
// ============================================

// Definir qué calculadoras son colaborativas (requieren datos del médico)
const COLLABORATIVE_CALCULATORS = {
  'ASDAS_CRP': {
    collaborative: true,
    patientFields: ['backPain', 'morningStiffness', 'patientGlobal'],
    doctorFields: ['crp'],
    patientLabel: 'ASDAS-PCR',
    patientDesc: 'Completa tus síntomas (el reumatólogo/a añadirá la analítica)',
    doctorLabel: 'ASDAS-PCR - Completar con analítica'
  },
  'ASDAS_ESR': {
    collaborative: true,
    patientFields: ['backPain', 'morningStiffness', 'patientGlobal'],
    doctorFields: ['vsg'],
    patientLabel: 'ASDAS-VSG',
    patientDesc: 'Completa tus síntomas (el reumatólogo/a añadirá la analítica)',
    doctorLabel: 'ASDAS-VSG - Completar con analítica'
  },
  'DAPSA': {
    collaborative: true,
    patientFields: ['pain', 'patientGlobal'],
    doctorFields: ['tenderJoints', 'swollenJoints', 'crp'],
    patientLabel: 'DAPSA',
    patientDesc: 'Completa el dolor (el reumatólogo/a añadirá exploración y analítica)',
    doctorLabel: 'DAPSA - Completar con exploración y analítica'
  },
  'DAS28_CRP': {
    collaborative: true,
    patientFields: ['patientGlobal'],
    doctorFields: ['tenderJoints', 'swollenJoints', 'crp'],
    patientLabel: 'DAS28-PCR',
    patientDesc: 'Completa tu evaluación (el reumatólogo/a añadirá exploración y analítica)',
    doctorLabel: 'DAS28-PCR - Completar con exploración y analítica'
  },
  'DAS28_ESR': {
    collaborative: true,
    patientFields: ['patientGlobal'],
    doctorFields: ['tenderJoints', 'swollenJoints', 'vsg'],
    patientLabel: 'DAS28-VSG',
    patientDesc: 'Completa tu evaluación (el reumatólogo/a añadirá exploración y analítica)',
    doctorLabel: 'DAS28-VSG - Completar con exploración y analítica'
  },
  'SCORE2': {
    collaborative: true,
    patientFields: ['age', 'sex', 'smoking'],
    doctorFields: ['sbp', 'cholesterol', 'region'],
    patientLabel: 'SCORE2',
    patientDesc: 'Completa tus datos básicos (el reumatólogo/a añadirá PA y colesterol)',
    doctorLabel: 'SCORE2 - Completar con PA y colesterol'
  },
  'SCORE2-OP': {
    collaborative: true,
    patientFields: ['age', 'sex', 'smoking'],
    doctorFields: ['sbp', 'cholesterol'],
    patientLabel: 'SCORE2-OP',
    patientDesc: 'Completa tus datos básicos (el reumatólogo/a añadirá PA y colesterol)',
    doctorLabel: 'SCORE2-OP - Completar con PA y colesterol'
  },
  'QRISK3': {
    collaborative: true,
    patientFields: ['age', 'sex', 'smoking', 'bmi'],
    doctorFields: ['diabetes', 'sbp', 'cholesterol', 'hdl'],
    patientLabel: 'QRISK3',
    patientDesc: 'Completa tus datos básicos (el reumatólogo/a añadirá datos clínicos)',
    doctorLabel: 'QRISK3 - Completar con datos clínicos'
  },
  'SLICC': {
    collaborative: true,
    patientFields: [],
    doctorFields: ['ocular', 'neuropsych', 'renal', 'pulmonary', 'cardiovascular', 'peripheral', 'gastrointestinal', 'musculoskeletal', 'skin', 'premature_gonadal', 'diabetes', 'malignancy'],
    patientLabel: 'SLICC',
    patientDesc: 'Esta calculadora la completará el reumatólogo/a en consulta',
    doctorLabel: 'SLICC - Índice de daño en lupus'
  }
};

// Calculadoras que solo puede hacer el médico
const DOCTOR_ONLY_CALCULATORS = ['SLEDAI', 'SSDAI', 'SLICC'];

// Verificar si una calculadora es colaborativa
const isCollaborative = (instrument) => {
  return COLLABORATIVE_CALCULATORS.hasOwnProperty(instrument);
};

// Verificar si una calculadora es solo para médicos
const isDoctorOnly = (instrument) => {
  return DOCTOR_ONLY_CALCULATORS.includes(instrument);
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
  
  async deleteScore(scoreId) {
    if (!supabase) { console.error('Supabase no configurado'); return false; }
    try {
      const { error } = await supabase.from('scores').delete().eq('id', scoreId);
      if (error) { 
        console.error('Error deleting score:', error); 
        return false; 
      }
      return true;
    } catch (err) {
      console.error('Exception deleting score:', err);
      return false;
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
  },
  
  async savePendingCalculation(data) {
    if (!supabase) return null;
    try {
      const { data: result, error } = await supabase
        .from('pending_calculations')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    } catch (err) {
      console.error('Error saving pending calculation:', err);
      return null;
    }
  },
  
  async getPendingCalculations(patientId) {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('pending_calculations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting pending calculations:', err);
      return [];
    }
  },
  
  async completePendingCalculation(pendingId, doctorId) {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('pending_calculations')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          completed_by: doctorId
        })
        .eq('id', pendingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error completing pending calculation:', err);
      return null;
    }
  },
  
  async deletePendingCalculation(pendingId) {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from('pending_calculations')
        .delete()
        .eq('id', pendingId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting pending calculation:', err);
      return false;
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

const FormInput = ({ label, type = 'text', value, onChange, min, max, step, unit, required = false, placeholder, disabled = false, style = {} }) => (
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
      disabled={disabled}
      readOnly={disabled}
      style={style}
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

const FRAXResultCard = ({ result, onSave, saved, saving, isDoctor }) => {
  const { score, interpretation, details, instrument } = result;
  
  return (
    <div className="result-card">
      <div className="result-header">
        <h3>{instrument}</h3>
        <div className="result-score" style={{ backgroundColor: interpretation.color }}>
          {score}%
        </div>
      </div>
      
      <div className="result-interpretation" style={{ borderLeftColor: interpretation.color }}>
        <strong>{interpretation.text}</strong>
      </div>

      {/* Riesgos desglosados */}
      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#1e293b' }}>
          📊 Riesgo de fractura a 10 años:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Fractura osteoporótica mayor:</span>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{details.majorFractureRisk}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Fractura de cadera:</span>
            <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{details.hipFractureRisk}</strong>
          </div>
          {details.immediateFractureRisk && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: '600' }}>Riesgo inmediato (FRAX+):</span>
              <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>{details.immediateFractureRisk}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Interpretación para médico */}
      {isDoctor && details.interpretationDoctor && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          border: '1px solid #bfdbfe'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e40af', fontWeight: '600' }}>
            👨‍⚕️ Interpretación clínica:
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5' }}>
            {details.interpretationDoctor}
          </p>
        </div>
      )}

      {/* Interpretación para paciente */}
      {!isDoctor && details.interpretationPatient && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '0.5rem',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#15803d', fontWeight: '600' }}>
            💡 ¿Qué significa esto para ti?
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b', lineHeight: '1.5' }}>
            {details.interpretationPatient}
          </p>
        </div>
      )}

      {/* Datos adicionales */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#fafafa',
        borderRadius: '0.5rem',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div><strong>Edad:</strong> {details.age} años</div>
          <div><strong>Sexo:</strong> {details.sex}</div>
          <div><strong>IMC:</strong> {details.bmi}</div>
          <div><strong>DMO (T-score):</strong> {details.boneDensity}</div>
          {details.falls && parseInt(details.falls) > 0 && (
            <div style={{ gridColumn: '1 / -1' }}><strong>Caídas último año:</strong> {details.falls}</div>
          )}
        </div>
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
};

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
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Actividad de la enfermedad en espondiloartritis axial
      </p>
      
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

const ASDASCalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [variant, setVariant] = useState('CRP');
  const [components, setComponents] = useState(
    initialData || { backPain: 5, duration: 5, peripheral: 5, global: 5, crp: 5, esr: 20 }
  );
  
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
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Actividad de la enfermedad en espondiloartritis axial
      </p>
      
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
          label={isDoctor ? "PCR" : "PCR (solo puede completarlo el reumatólogo/a)"}
          type="number"
          value={components.crp}
          onChange={(val) => setComponents(prev => ({ ...prev, crp: val }))}
          min={0}
          max={200}
          step={0.1}
          unit="mg/L"
          disabled={!isDoctor}
          style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        />
      ) : (
        <FormInput
          label={isDoctor ? "VSG" : "VSG (solo puede completarlo el reumatólogo/a)"}
          type="number"
          value={components.esr}
          onChange={(val) => setComponents(prev => ({ ...prev, esr: val }))}
          min={0}
          max={150}
          step={1}
          unit="mm/h"
          disabled={!isDoctor}
          style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        />
      )}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular ASDAS
      </button>
    </div>
  );
};

const DAPSACalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [components, setComponents] = useState(
    initialData || { pain: 5, global: 5, tjc: 0, sjc: 0, crp: 1 }
  );
  
  const handleCalculate = () => {
    const score = calculateDAPSA(components);
    const interpretation = interpretDAPSA(score);
    onResult({ score, interpretation, components, instrument: 'DAPSA' });
  };
  
  return (
    <div className="calculator-form">
      <h3>DAPSA</h3>
      <p className="calc-description">Disease Activity in Psoriatic Arthritis</p>
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Actividad de la enfermedad en artritis psoriásica
      </p>
      
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
        label={isDoctor ? "Articulaciones dolorosas - TJC" : "Articulaciones dolorosas - TJC (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.tjc}
        onChange={(val) => setComponents(prev => ({ ...prev, tjc: val }))}
        min={0}
        max={68}
        step={1}
        placeholder="0-68"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      <FormInput
        label={isDoctor ? "Articulaciones tumefactas - SJC" : "Articulaciones tumefactas - SJC (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.sjc}
        onChange={(val) => setComponents(prev => ({ ...prev, sjc: val }))}
        min={0}
        max={66}
        step={1}
        placeholder="0-66"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      <FormInput
        label={isDoctor ? "PCR" : "PCR (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.crp}
        onChange={(val) => setComponents(prev => ({ ...prev, crp: val }))}
        min={0}
        max={200}
        step={0.1}
        unit="mg/dL"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular DAPSA
      </button>
    </div>
  );
};

const MDACalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [components, setComponents] = useState(
    initialData || { 
      tjc: 0,        // Articulaciones dolorosas (médico)
      sjc: 0,        // Articulaciones inflamadas (médico)
      pasi: 0,       // PASI (médico)
      pain: 0,       // Dolor del paciente VAS 0-10 (paciente)
      patientGlobal: 0,  // Evaluación global del paciente VAS 0-10 (paciente)
      haq: 0,        // HAQ (paciente)
      enthesitis: 0  // Entesitis (médico)
    }
  );
  
  const calculateMDA = (comp) => {
    // MDA requiere cumplir 5 de 7 criterios:
    // 1. TJC ≤ 1
    // 2. SJC ≤ 1
    // 3. PASI ≤ 1 o BSA ≤ 3%
    // 4. Dolor del paciente ≤ 1.5 (en escala 0-10)
    // 5. Evaluación global del paciente ≤ 2 (en escala 0-10)
    // 6. HAQ ≤ 0.5
    // 7. Entesitis ≤ 1
    
    let criteriasMet = 0;
    const criterias = [];
    
    if (comp.tjc <= 1) {
      criteriasMet++;
      criterias.push('✓ Articulaciones dolorosas ≤1');
    } else {
      criterias.push('✗ Articulaciones dolorosas >1');
    }
    
    if (comp.sjc <= 1) {
      criteriasMet++;
      criterias.push('✓ Articulaciones inflamadas ≤1');
    } else {
      criterias.push('✗ Articulaciones inflamadas >1');
    }
    
    if (comp.pasi <= 1) {
      criteriasMet++;
      criterias.push('✓ PASI ≤1');
    } else {
      criterias.push('✗ PASI >1');
    }
    
    if (comp.pain <= 1.5) {
      criteriasMet++;
      criterias.push('✓ Dolor del paciente ≤1.5');
    } else {
      criterias.push('✗ Dolor del paciente >1.5');
    }
    
    if (comp.patientGlobal <= 2) {
      criteriasMet++;
      criterias.push('✓ Evaluación global del paciente ≤2');
    } else {
      criterias.push('✗ Evaluación global del paciente >2');
    }
    
    if (comp.haq <= 0.5) {
      criteriasMet++;
      criterias.push('✓ HAQ ≤0.5');
    } else {
      criterias.push('✗ HAQ >0.5');
    }
    
    if (comp.enthesitis <= 1) {
      criteriasMet++;
      criterias.push('✓ Entesitis ≤1');
    } else {
      criterias.push('✗ Entesitis >1');
    }
    
    return { criteriasMet, criterias };
  };
  
  const interpretMDA = (criteriasMet) => {
    if (criteriasMet >= 5) {
      return {
        text: 'MDA alcanzado',
        color: '#22c55e',
        description: 'El paciente cumple con la actividad mínima de la enfermedad (≥5/7 criterios)'
      };
    } else {
      return {
        text: 'MDA no alcanzado',
        color: '#ef4444',
        description: `El paciente NO cumple MDA (solo ${criteriasMet}/7 criterios)`
      };
    }
  };
  
  const handleCalculate = () => {
    const { criteriasMet, criterias } = calculateMDA(components);
    const interpretation = interpretMDA(criteriasMet);
    onResult({ 
      score: criteriasMet, 
      interpretation: {
        ...interpretation,
        criterias
      }, 
      components, 
      instrument: 'MDA' 
    });
  };
  
  return (
    <div className="calculator-form">
      <h3>MDA</h3>
      <p className="calc-description">Minimal Disease Activity</p>
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Actividad mínima de la enfermedad en artritis psoriásica
      </p>
      
      <FormInput
        label={isDoctor ? "Articulaciones dolorosas (TJC)" : "Articulaciones dolorosas (TJC) (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.tjc}
        onChange={(val) => setComponents(prev => ({ ...prev, tjc: val }))}
        min={0}
        max={68}
        step={1}
        placeholder="0-68"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <FormInput
        label={isDoctor ? "Articulaciones inflamadas (SJC)" : "Articulaciones inflamadas (SJC) (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.sjc}
        onChange={(val) => setComponents(prev => ({ ...prev, sjc: val }))}
        min={0}
        max={66}
        step={1}
        placeholder="0-66"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <FormInput
        label={isDoctor ? "PASI" : "PASI (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.pasi}
        onChange={(val) => setComponents(prev => ({ ...prev, pasi: val }))}
        min={0}
        max={72}
        step={0.1}
        placeholder="0-72"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <SliderInput
        label="Dolor del paciente (VAS 0-10)"
        value={components.pain}
        onChange={(val) => setComponents(prev => ({ ...prev, pain: val }))}
        max={10}
        step={0.1}
      />
      
      <SliderInput
        label="Evaluación global del paciente (VAS 0-10)"
        value={components.patientGlobal}
        onChange={(val) => setComponents(prev => ({ ...prev, patientGlobal: val }))}
        max={10}
        step={0.1}
      />
      
      <FormInput
        label="HAQ (Health Assessment Questionnaire)"
        type="number"
        value={components.haq}
        onChange={(val) => setComponents(prev => ({ ...prev, haq: val }))}
        min={0}
        max={3}
        step={0.1}
        placeholder="0-3"
      />
      
      <FormInput
        label={isDoctor ? "Entesitis" : "Entesitis (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.enthesitis}
        onChange={(val) => setComponents(prev => ({ ...prev, enthesitis: val }))}
        min={0}
        max={50}
        step={1}
        placeholder="0-50"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular MDA
      </button>
    </div>
  );
};

const DAS28Calculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [variant, setVariant] = useState('CRP');
  const [components, setComponents] = useState(
    initialData || { tjc28: 0, sjc28: 0, global: 50, crp: 5, esr: 20 }
  );
  
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
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Actividad de la enfermedad en artritis reumatoide
      </p>
      
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
        label={isDoctor ? "Articulaciones dolorosas - TJC28" : "Articulaciones dolorosas - TJC28 (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.tjc28}
        onChange={(val) => setComponents(prev => ({ ...prev, tjc28: val }))}
        min={0}
        max={28}
        step={1}
        placeholder="0-28"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      <FormInput
        label={isDoctor ? "Articulaciones tumefactas - SJC28" : "Articulaciones tumefactas - SJC28 (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.sjc28}
        onChange={(val) => setComponents(prev => ({ ...prev, sjc28: val }))}
        min={0}
        max={28}
        step={1}
        placeholder="0-28"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
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
          label={isDoctor ? "PCR" : "PCR (solo puede completarlo el reumatólogo/a)"}
          type="number"
          value={components.crp}
          onChange={(val) => setComponents(prev => ({ ...prev, crp: val }))}
          min={0}
          max={200}
          step={0.1}
          unit="mg/L"
          disabled={!isDoctor}
          style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        />
      ) : (
        <FormInput
          label={isDoctor ? "VSG" : "VSG (solo puede completarlo el reumatólogo/a)"}
          type="number"
          value={components.esr}
          onChange={(val) => setComponents(prev => ({ ...prev, esr: val }))}
          min={0}
          max={150}
          step={1}
          unit="mm/h"
          disabled={!isDoctor}
          style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        />
      )}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular DAS28
      </button>
    </div>
  );
};

// ===== NUEVAS CALCULADORAS =====

const SLEDAICalculator = ({ onResult, isDoctor = false }) => {
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
      
      {!isDoctor && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fef3c7', 
          borderRadius: '0.5rem',
          borderLeft: '4px solid #f59e0b',
          marginBottom: '1.5rem'
        }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem', fontWeight: '600' }}>
            ⚠️ Esta calculadora solo puede ser completada por el reumatólogo/a o enfermera durante la consulta
          </p>
        </div>
      )}
      
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

const SSDAICalculator = ({ onResult, isDoctor = false }) => {
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
      
      {!isDoctor && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fef3c7', 
          borderRadius: '0.5rem',
          borderLeft: '4px solid #f59e0b',
          marginBottom: '1.5rem'
        }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '0.875rem', fontWeight: '600' }}>
            ⚠️ Esta calculadora solo puede ser completada por el reumatólogo/a o enfermera durante la consulta
          </p>
        </div>
      )}
      
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
          <span>Soy reumatólogo/a</span>
        </button>
      </div>
      
      <div className="landing-features">
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>🔴</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Artritis psoriásica</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">📉</span><span>DAPSA</span></div>
            <div className="feature"><span className="feature-icon">🩺</span><span>DAS28-PCR</span></div>
            <div className="feature"><span className="feature-icon">🎯</span><span>MDA</span></div>
            <div className="feature"><span className="feature-icon">💚</span><span>PsAQoL</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>🔵</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Artritis reumatoide</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">📋</span><span>DAS28</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>🦴</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Espondiloartritis</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">📈</span><span>ASDAS</span></div>
            <div className="feature"><span className="feature-icon">📊</span><span>BASDAI</span></div>
            <div className="feature"><span className="feature-icon">🚶</span><span>BASFI</span></div>
            <div className="feature"><span className="feature-icon">😊</span><span>ASQoL</span></div>
            <div className="feature"><span className="feature-icon">💡</span><span>ASAS-HI</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>🦋</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Lupus eritematoso sistémico</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">🦋</span><span>SLEDAI</span></div>
            <div className="feature"><span className="feature-icon">📋</span><span>SLICC</span></div>
            <div className="feature"><span className="feature-icon">💚</span><span>LupusPRO</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>💧</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Síndrome de Sjögren</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">💧</span><span>ESSPRI</span></div>
            <div className="feature"><span className="feature-icon">🔬</span><span>SSDAI</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>🦴</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Osteoporosis</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">📊</span><span>FRAX</span></div>
            <div className="feature"><span className="feature-icon">📈</span><span>FRAX+</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>💚</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Calidad de vida general</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">💪</span><span>FACIT</span></div>
            <div className="feature"><span className="feature-icon">🏥</span><span>SF-36</span></div>
          </div>
        </div>
        
        <div style={{ width: '100%', marginTop: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '1.5rem' }}>❤️</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1e293b' }}>Riesgo cardiovascular</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="feature"><span className="feature-icon">💗</span><span>SCORE2</span></div>
            <div className="feature"><span className="feature-icon">❤️</span><span>SCORE2-OP</span></div>
            <div className="feature"><span className="feature-icon">🫀</span><span>QRISK3</span></div>
          </div>
        </div>
      </div>
    </div>
    
    <footer className="landing-footer" style={{ paddingBottom: '40px' }}>
      <Brand size="small" />
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '13px', marginTop: '16px' }}>
        <span style={{ cursor: 'pointer', textDecoration: 'underline', color: '#666' }} onClick={() => onNavigate('aviso-legal')}>Aviso Legal</span>
        <span style={{ color: '#ccc' }}>|</span>
        <span style={{ cursor: 'pointer', textDecoration: 'underline', color: '#666' }} onClick={() => onNavigate('politica-privacidad')}>Política de Privacidad</span>
        <span style={{ color: '#ccc' }}>|</span>
        <span style={{ cursor: 'pointer', textDecoration: 'underline', color: '#666' }} onClick={() => onNavigate('politica-cookies')}>Política de Cookies</span>
      </div>
    </footer>
  </div>
);

const SCORE2Calculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [components, setComponents] = useState(
    initialData || { age: 55, sex: 'male', smoking: 'no', sbp: 130, cholesterol: 200, region: 'moderate' }
  );
  
  const handleCalculate = () => {
    // Convertir colesterol de mg/dL a mmol/L para el cálculo
    const cholesterolMmol = components.cholesterol / 38.67;
    const score = calculateSCORE2({ ...components, cholesterol: cholesterolMmol });
    const interpretation = interpretSCORE2(score);
    onResult({ score, interpretation, components, instrument: 'SCORE2' });
  };
  
  return (
    <div className="calculator-form">
      <h3>SCORE2 (40-69 años)</h3>
      <p className="calc-description">Riesgo Cardiovascular en adultos de 40-69 años</p>
      
      <div className="form-group">
        <label>Edad (40-69 años)</label>
        <input
          type="number"
          min="40"
          max="69"
          value={components.age}
          onChange={(e) => setComponents(prev => ({ ...prev, age: parseInt(e.target.value) || 40 }))}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div className="form-group">
        <label>Sexo</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2-sex"
              value="male"
              checked={components.sex === 'male'}
              onChange={(e) => setComponents(prev => ({ ...prev, sex: e.target.value }))}
            />
            <span>Hombre</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2-sex"
              value="female"
              checked={components.sex === 'female'}
              onChange={(e) => setComponents(prev => ({ ...prev, sex: e.target.value }))}
            />
            <span>Mujer</span>
          </label>
        </div>
      </div>
      
      <div className="form-group">
        <label>Fumador</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2-smoking"
              value="no"
              checked={components.smoking === 'no'}
              onChange={(e) => setComponents(prev => ({ ...prev, smoking: e.target.value }))}
            />
            <span>No</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2-smoking"
              value="yes"
              checked={components.smoking === 'yes'}
              onChange={(e) => setComponents(prev => ({ ...prev, smoking: e.target.value }))}
            />
            <span>Sí</span>
          </label>
        </div>
      </div>
      
      <FormInput
        label={isDoctor ? "Presión Arterial Sistólica - PA" : "Presión Arterial Sistólica - PA (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.sbp}
        onChange={(val) => setComponents(prev => ({ ...prev, sbp: val }))}
        min={90}
        max={200}
        step={1}
        unit="mmHg"
        placeholder="Ej: 130"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <FormInput
        label={isDoctor ? "Colesterol Total" : "Colesterol Total (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.cholesterol}
        onChange={(val) => setComponents(prev => ({ ...prev, cholesterol: val }))}
        min={100}
        max={400}
        step={1}
        unit="mg/dL"
        placeholder="Ej: 200"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <div className="form-group">
        <label>{isDoctor ? "Región de riesgo cardiovascular" : "Región de riesgo cardiovascular (solo puede completarlo el reumatólogo/a)"}</label>
        <select
          value={components.region}
          onChange={(e) => setComponents(prev => ({ ...prev, region: e.target.value }))}
          disabled={!isDoctor}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
            backgroundColor: 'white',
            opacity: !isDoctor ? 0.6 : 1,
            cursor: !isDoctor ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="low">Riesgo bajo (Norte Europa)</option>
          <option value="moderate">Riesgo moderado (España)</option>
          <option value="high">Riesgo alto</option>
          <option value="very_high">Riesgo muy alto (Este Europa)</option>
        </select>
      </div>
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular SCORE2
      </button>
    </div>
  );
};

const SCORE2OPCalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [components, setComponents] = useState(
    initialData || { age: 75, sex: 'male', smoking: 'no', sbp: 140, cholesterol: 200 }
  );
  
  const handleCalculate = () => {
    // Convertir colesterol de mg/dL a mmol/L para el cálculo
    const cholesterolMmol = components.cholesterol / 38.67;
    const score = calculateSCORE2OP({ ...components, cholesterol: cholesterolMmol });
    const interpretation = interpretSCORE2OP(score);
    onResult({ score, interpretation, components, instrument: 'SCORE2-OP' });
  };
  
  return (
    <div className="calculator-form">
      <h3>SCORE2-OP (+70 años)</h3>
      <p className="calc-description">Riesgo Cardiovascular en mayores de 70 años</p>
      
      <div className="form-group">
        <label>Edad (70-89 años)</label>
        <input
          type="number"
          min="70"
          max="89"
          value={components.age}
          onChange={(e) => setComponents(prev => ({ ...prev, age: parseInt(e.target.value) || 70 }))}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div className="form-group">
        <label>Sexo</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2op-sex"
              value="male"
              checked={components.sex === 'male'}
              onChange={(e) => setComponents(prev => ({ ...prev, sex: e.target.value }))}
            />
            <span>Hombre</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2op-sex"
              value="female"
              checked={components.sex === 'female'}
              onChange={(e) => setComponents(prev => ({ ...prev, sex: e.target.value }))}
            />
            <span>Mujer</span>
          </label>
        </div>
      </div>
      
      <div className="form-group">
        <label>Fumador</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2op-smoking"
              value="no"
              checked={components.smoking === 'no'}
              onChange={(e) => setComponents(prev => ({ ...prev, smoking: e.target.value }))}
            />
            <span>No</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '100px' }}>
            <input
              type="radio"
              name="score2op-smoking"
              value="yes"
              checked={components.smoking === 'yes'}
              onChange={(e) => setComponents(prev => ({ ...prev, smoking: e.target.value }))}
            />
            <span>Sí</span>
          </label>
        </div>
      </div>
      
      <FormInput
        label={isDoctor ? "Presión Arterial Sistólica - PA" : "Presión Arterial Sistólica - PA (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.sbp}
        onChange={(val) => setComponents(prev => ({ ...prev, sbp: val }))}
        min={90}
        max={200}
        step={1}
        unit="mmHg"
        placeholder="Ej: 140"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <FormInput
        label={isDoctor ? "Colesterol Total" : "Colesterol Total (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.cholesterol}
        onChange={(val) => setComponents(prev => ({ ...prev, cholesterol: val }))}
        min={100}
        max={400}
        step={1}
        unit="mg/dL"
        placeholder="Ej: 200"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular SCORE2-OP
      </button>
    </div>
  );
};

const QRISK3Calculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [components, setComponents] = useState(
    initialData || { age: 50, sex: 'male', smoking: 'no', diabetes: 'no', sbp: 130, cholesterol: 200, hdl: 50, bmi: 25 }
  );
  
  const handleCalculate = () => {
    const cholesterolMmol = components.cholesterol / 38.67;
    const hdlMmol = components.hdl / 38.67;
    const calcComponents = { ...components, cholesterol: cholesterolMmol, hdl: hdlMmol };
    const score = calculateQRISK3(calcComponents);
    const interpretation = interpretQRISK3(score);
    onResult({ 
      score, 
      interpretation, 
      components: calcComponents, 
      instrument: 'QRISK3' 
    });
  };
  
  return (
    <div className="calculator-form">
      <h3>QRISK3</h3>
      <p className="calc-description">Cardiovascular Risk Prediction</p>
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Predicción de riesgo cardiovascular a 10 años
      </p>
      
      <div className="form-group">
        <label>Edad (25-84 años)</label>
        <input
          type="number"
          min="25"
          max="84"
          value={components.age}
          onChange={(e) => setComponents(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '2px solid #e2e8f0',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div className="form-group">
        <label>Sexo</label>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="qrisk3-sex"
              value="male"
              checked={components.sex === 'male'}
              onChange={(e) => setComponents(prev => ({ ...prev, sex: e.target.value }))}
            />
            <span>Hombre</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="qrisk3-sex"
              value="female"
              checked={components.sex === 'female'}
              onChange={(e) => setComponents(prev => ({ ...prev, sex: e.target.value }))}
            />
            <span>Mujer</span>
          </label>
        </div>
      </div>
      
      <div className="form-group">
        <label>Fumador</label>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="qrisk3-smoking"
              value="no"
              checked={components.smoking === 'no'}
              onChange={(e) => setComponents(prev => ({ ...prev, smoking: e.target.value }))}
            />
            <span>NO</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="qrisk3-smoking"
              value="yes"
              checked={components.smoking === 'yes'}
              onChange={(e) => setComponents(prev => ({ ...prev, smoking: e.target.value }))}
            />
            <span>Sí</span>
          </label>
        </div>
      </div>
      
      <FormInput
        label="IMC (kg/m²)"
        type="number"
        value={components.bmi}
        onChange={(val) => setComponents(prev => ({ ...prev, bmi: val }))}
        min={15}
        max={50}
        step={0.1}
      />
      
      <div className="form-group">
        <label>{isDoctor ? "Diabetes" : "Diabetes (solo puede completarlo el reumatólogo/a)"}</label>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isDoctor ? 'pointer' : 'not-allowed' }}>
            <input
              type="radio"
              name="qrisk3-diabetes"
              value="no"
              checked={components.diabetes === 'no'}
              onChange={(e) => setComponents(prev => ({ ...prev, diabetes: e.target.value }))}
              disabled={!isDoctor}
              style={!isDoctor ? { cursor: 'not-allowed' } : {}}
            />
            <span style={!isDoctor ? { opacity: 0.6 } : {}}>NO</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isDoctor ? 'pointer' : 'not-allowed' }}>
            <input
              type="radio"
              name="qrisk3-diabetes"
              value="yes"
              checked={components.diabetes === 'yes'}
              onChange={(e) => setComponents(prev => ({ ...prev, diabetes: e.target.value }))}
              disabled={!isDoctor}
              style={!isDoctor ? { cursor: 'not-allowed' } : {}}
            />
            <span style={!isDoctor ? { opacity: 0.6 } : {}}>Sí</span>
          </label>
        </div>
      </div>
      
      <FormInput
        label={isDoctor ? "Presión arterial sistólica (mmHg)" : "Presión arterial sistólica (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.sbp}
        onChange={(val) => setComponents(prev => ({ ...prev, sbp: val }))}
        min={70}
        max={210}
        step={1}
        unit="mmHg"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <FormInput
        label={isDoctor ? "Colesterol total (mg/dL)" : "Colesterol total (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.cholesterol}
        onChange={(val) => setComponents(prev => ({ ...prev, cholesterol: val }))}
        min={100}
        max={400}
        step={1}
        unit="mg/dL"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <FormInput
        label={isDoctor ? "HDL-colesterol (mg/dL)" : "HDL-colesterol (solo puede completarlo el reumatólogo/a)"}
        type="number"
        value={components.hdl}
        onChange={(val) => setComponents(prev => ({ ...prev, hdl: val }))}
        min={20}
        max={100}
        step={1}
        unit="mg/dL"
        disabled={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular QRISK3
      </button>
    </div>
  );
};

const FRAXCalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    age: '',
    sex: '',
    weight: '',
    height: '',
    previousFracture: false,
    parentFracture: false,
    currentSmoker: false,
    glucocorticoids: false,
    rheumatoidArthritis: false,
    secondaryOsteoporosis: false,
    alcohol3Plus: false,
    boneDensity: '', // Médico
  });

  const handleCalculate = () => {
    if (!formData.age || !formData.sex || !formData.weight || !formData.height) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Calcular BMI
    const heightInMeters = parseFloat(formData.height) / 100;
    const bmi = parseFloat(formData.weight) / (heightInMeters * heightInMeters);
    const age = parseInt(formData.age);
    const isFemale = formData.sex === 'female';

    // Riesgo base según edad y sexo (aproximación basada en estudios epidemiológicos)
    let baseRiskMajor = 0;
    let baseRiskHip = 0;
    
    if (isFemale) {
      if (age < 50) { baseRiskMajor = 1.5; baseRiskHip = 0.1; }
      else if (age < 60) { baseRiskMajor = 3.5; baseRiskHip = 0.5; }
      else if (age < 70) { baseRiskMajor = 8.0; baseRiskHip = 1.5; }
      else if (age < 80) { baseRiskMajor = 15.0; baseRiskHip = 4.0; }
      else { baseRiskMajor = 25.0; baseRiskHip = 8.0; }
    } else {
      if (age < 50) { baseRiskMajor = 1.0; baseRiskHip = 0.05; }
      else if (age < 60) { baseRiskMajor = 2.5; baseRiskHip = 0.3; }
      else if (age < 70) { baseRiskMajor = 5.5; baseRiskHip = 1.0; }
      else if (age < 80) { baseRiskMajor = 11.0; baseRiskHip = 3.0; }
      else { baseRiskMajor = 20.0; baseRiskHip = 6.5; }
    }

    // Factores multiplicadores (Relative Risk)
    let rrMajor = 1.0;
    let rrHip = 1.0;

    // Fractura previa (RR: 1.9 para fractura mayor, 2.3 para cadera)
    if (formData.previousFracture) {
      rrMajor *= 1.9;
      rrHip *= 2.3;
    }

    // Fractura parental de cadera (RR: 1.7 para fractura mayor, 2.3 para cadera)
    if (formData.parentFracture) {
      rrMajor *= 1.7;
      rrHip *= 2.3;
    }

    // Fumador actual (RR: 1.2 para fractura mayor, 1.6 para cadera)
    if (formData.currentSmoker) {
      rrMajor *= 1.2;
      rrHip *= 1.6;
    }

    // Glucocorticoides (RR: 1.5 para fractura mayor, 2.0 para cadera)
    if (formData.glucocorticoids) {
      rrMajor *= 1.5;
      rrHip *= 2.0;
    }

    // Artritis reumatoide (RR: 1.5 para fractura mayor, 1.9 para cadera)
    if (formData.rheumatoidArthritis) {
      rrMajor *= 1.5;
      rrHip *= 1.9;
    }

    // Osteoporosis secundaria (RR: 1.8 para fractura mayor, 2.5 para cadera)
    if (formData.secondaryOsteoporosis) {
      rrMajor *= 1.8;
      rrHip *= 2.5;
    }

    // Alcohol 3+ unidades/día (RR: 1.4 para fractura mayor, 1.7 para cadera)
    if (formData.alcohol3Plus) {
      rrMajor *= 1.4;
      rrHip *= 1.7;
    }

    // Ajuste por BMI
    if (bmi < 19) {
      rrMajor *= 1.4;
      rrHip *= 1.6;
    } else if (bmi < 20) {
      rrMajor *= 1.2;
      rrHip *= 1.3;
    } else if (bmi > 30) {
      rrMajor *= 0.9;
      rrHip *= 0.8;
    }

    // Ajuste por densidad ósea (T-score)
    if (formData.boneDensity) {
      const tScore = parseFloat(formData.boneDensity);
      // Por cada desviación estándar: RR aproximado de 1.6-2.0
      if (tScore < -2.5) {
        rrMajor *= 2.5;
        rrHip *= 3.0;
      } else if (tScore < -2.0) {
        rrMajor *= 2.0;
        rrHip *= 2.4;
      } else if (tScore < -1.5) {
        rrMajor *= 1.6;
        rrHip *= 1.9;
      } else if (tScore < -1.0) {
        rrMajor *= 1.3;
        rrHip *= 1.5;
      }
    }

    // Calcular riesgo final
    let majorFractureRisk = baseRiskMajor * rrMajor;
    let hipFractureRisk = baseRiskHip * rrHip;

    // Limitar a 99%
    majorFractureRisk = Math.min(99, parseFloat(majorFractureRisk.toFixed(1)));
    hipFractureRisk = Math.min(99, parseFloat(hipFractureRisk.toFixed(1)));

    // Determinar nivel de riesgo y color
    let riskLevel = '';
    let riskColor = '';
    let interpretationDoctor = '';
    let interpretationPatient = '';
    
    if (majorFractureRisk >= 20 || hipFractureRisk >= 3) {
      riskLevel = 'alto';
      riskColor = '#ef4444';
      interpretationDoctor = `Riesgo alto de fractura osteoporótica. Fractura mayor: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%. Se recomienda iniciar tratamiento farmacológico con bisfosfonatos, denosumab o anabólicos según perfil del paciente. Optimizar ingesta de calcio (1200mg/día) y vitamina D (800-1000 UI/día). Ejercicio de carga y balance. Reevaluar en 1 año.`;
      interpretationPatient = `Tu riesgo de sufrir una fractura importante en los próximos 10 años es alto (${majorFractureRisk}%). Esto significa que sin tratamiento, aproximadamente ${Math.round(majorFractureRisk)} de cada 100 personas con tu perfil sufrirán una fractura. Tu reumatólogo/a te recomendará medicación para fortalecer tus huesos, junto con calcio y vitamina D. Es importante seguir el tratamiento y hacer ejercicio regular.`;
    } else if (majorFractureRisk >= 10 || hipFractureRisk >= 1) {
      riskLevel = 'moderado';
      riskColor = '#f59e0b';
      interpretationDoctor = `Riesgo moderado de fractura osteoporótica. Fractura mayor: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%. Considerar tratamiento farmacológico según factores adicionales (edad, fragilidad, riesgo de caídas). Asegurar aporte adecuado de calcio y vitamina D. Promover ejercicio y medidas anticalidad. Reevaluar anualmente o si aparecen nuevos factores de riesgo.`;
      interpretationPatient = `Tu riesgo de fractura en los próximos 10 años es moderado (${majorFractureRisk}%). Tu reumatólogo/a valorará si necesitas medicación según tu situación particular. Es muy importante tomar calcio y vitamina D, hacer ejercicio regular (caminar, bailar) y prevenir caídas en casa (buena iluminación, evitar alfombras sueltas). Mantén seguimiento con tu médico.`;
    } else {
      riskLevel = 'bajo';
      riskColor = '#10b981';
      interpretationDoctor = `Riesgo bajo de fractura osteoporótica. Fractura mayor: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%. No se indica tratamiento farmacológico en este momento. Mantener medidas generales: ingesta adecuada de calcio (1000-1200mg/día) y vitamina D (800 UI/día), ejercicio regular con carga, evitar tabaco y alcohol excesivo. Control periódico y reevaluar si aparecen nuevos factores de riesgo.`;
      interpretationPatient = `Tu riesgo de fractura en los próximos 10 años es bajo (${majorFractureRisk}%). Esto es una buena noticia. Para mantenerlo así, es importante llevar una dieta rica en calcio (lácteos, pescado), tomar el sol 15 minutos al día para la vitamina D, hacer ejercicio regular y evitar el tabaco. Sigue con tus revisiones periódicas.`;
    }

    const result = {
      instrument: 'FRAX',
      score: majorFractureRisk,
      interpretation: {
        text: `Riesgo ${riskLevel} de fractura`,
        color: riskColor,
        level: riskLevel
      },
      details: {
        majorFractureRisk: `${majorFractureRisk}%`,
        hipFractureRisk: `${hipFractureRisk}%`,
        bmi: bmi.toFixed(1),
        age: formData.age,
        sex: formData.sex === 'female' ? 'Mujer' : 'Hombre',
        boneDensity: formData.boneDensity || 'No disponible',
        interpretationDoctor: interpretationDoctor,
        interpretationPatient: interpretationPatient
      }
    };

    onResult(result);
  };

  return (
    <div className="calculator-form">
      <h3>FRAX</h3>
      <p className="calc-description">Fracture Risk Assessment Tool</p>
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Herramienta de evaluación del riesgo de fractura a 10 años
      </p>

      <label className="input-label">Edad (años) *</label>
      <input
        type="number"
        className="input-field"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        min="40"
        max="90"
      />

      <label className="input-label">Sexo *</label>
      <select
        className="input-field"
        value={formData.sex}
        onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
      >
        <option value="">Seleccionar...</option>
        <option value="female">Mujer</option>
        <option value="male">Hombre</option>
      </select>

      <label className="input-label">Peso (kg) *</label>
      <input
        type="number"
        className="input-field"
        value={formData.weight}
        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        step="0.1"
      />

      <label className="input-label">Altura (cm) *</label>
      <input
        type="number"
        className="input-field"
        value={formData.height}
        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
        step="0.1"
      />

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Factores de riesgo:</p>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.previousFracture}
            onChange={(e) => setFormData({ ...formData, previousFracture: e.target.checked })}
          />
          <span>Fractura previa por fragilidad</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.parentFracture}
            onChange={(e) => setFormData({ ...formData, parentFracture: e.target.checked })}
          />
          <span>Fractura de cadera en algún progenitor</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.currentSmoker}
            onChange={(e) => setFormData({ ...formData, currentSmoker: e.target.checked })}
          />
          <span>Fumador/a actual</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.glucocorticoids}
            onChange={(e) => setFormData({ ...formData, glucocorticoids: e.target.checked })}
          />
          <span>Glucocorticoides (≥5 mg/día prednisona ≥3 meses)</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.rheumatoidArthritis}
            onChange={(e) => setFormData({ ...formData, rheumatoidArthritis: e.target.checked })}
          />
          <span>Artritis reumatoide</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.secondaryOsteoporosis}
            onChange={(e) => setFormData({ ...formData, secondaryOsteoporosis: e.target.checked })}
          />
          <span>Osteoporosis secundaria</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.alcohol3Plus}
            onChange={(e) => setFormData({ ...formData, alcohol3Plus: e.target.checked })}
          />
          <span>Alcohol (3 o más unidades al día)</span>
        </label>
      </div>

      <label className="input-label" style={{ marginTop: '1rem' }}>
        Densidad mineral ósea (T-score cuello femoral)
        {!isDoctor && <span style={{ color: '#f59e0b', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
          Este campo será completado por el reumatólogo/a
        </span>}
      </label>
      <input
        type="number"
        className="input-field"
        value={formData.boneDensity}
        onChange={(e) => setFormData({ ...formData, boneDensity: e.target.value })}
        step="0.1"
        placeholder="Ejemplo: -2.5"
        disabled={!isDoctor}
        readOnly={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />

      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular FRAX
      </button>
    </div>
  );
};

const FRAXplusCalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    age: '',
    sex: '',
    weight: '',
    height: '',
    previousFracture: false,
    parentFracture: false,
    currentSmoker: false,
    glucocorticoids: false,
    rheumatoidArthritis: false,
    secondaryOsteoporosis: false,
    alcohol3Plus: false,
    boneDensity: '', // Médico
    falls: '', // Adicional en FRAX+
    recentFracture: false, // Adicional en FRAX+
  });

  const handleCalculate = () => {
    if (!formData.age || !formData.sex || !formData.weight || !formData.height) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Calcular BMI
    const heightInMeters = parseFloat(formData.height) / 100;
    const bmi = parseFloat(formData.weight) / (heightInMeters * heightInMeters);
    const age = parseInt(formData.age);
    const isFemale = formData.sex === 'female';

    // Riesgo base según edad y sexo (aproximación basada en estudios epidemiológicos)
    let baseRiskMajor = 0;
    let baseRiskHip = 0;
    
    if (isFemale) {
      if (age < 50) { baseRiskMajor = 1.5; baseRiskHip = 0.1; }
      else if (age < 60) { baseRiskMajor = 3.5; baseRiskHip = 0.5; }
      else if (age < 70) { baseRiskMajor = 8.0; baseRiskHip = 1.5; }
      else if (age < 80) { baseRiskMajor = 15.0; baseRiskHip = 4.0; }
      else { baseRiskMajor = 25.0; baseRiskHip = 8.0; }
    } else {
      if (age < 50) { baseRiskMajor = 1.0; baseRiskHip = 0.05; }
      else if (age < 60) { baseRiskMajor = 2.5; baseRiskHip = 0.3; }
      else if (age < 70) { baseRiskMajor = 5.5; baseRiskHip = 1.0; }
      else if (age < 80) { baseRiskMajor = 11.0; baseRiskHip = 3.0; }
      else { baseRiskMajor = 20.0; baseRiskHip = 6.5; }
    }

    // Factores multiplicadores (Relative Risk)
    let rrMajor = 1.0;
    let rrHip = 1.0;

    // Fractura previa
    if (formData.previousFracture) {
      rrMajor *= 1.9;
      rrHip *= 2.3;
    }

    // Fractura parental de cadera
    if (formData.parentFracture) {
      rrMajor *= 1.7;
      rrHip *= 2.3;
    }

    // Fumador actual
    if (formData.currentSmoker) {
      rrMajor *= 1.2;
      rrHip *= 1.6;
    }

    // Glucocorticoides
    if (formData.glucocorticoids) {
      rrMajor *= 1.5;
      rrHip *= 2.0;
    }

    // Artritis reumatoide
    if (formData.rheumatoidArthritis) {
      rrMajor *= 1.5;
      rrHip *= 1.9;
    }

    // Osteoporosis secundaria
    if (formData.secondaryOsteoporosis) {
      rrMajor *= 1.8;
      rrHip *= 2.5;
    }

    // Alcohol 3+ unidades/día
    if (formData.alcohol3Plus) {
      rrMajor *= 1.4;
      rrHip *= 1.7;
    }

    // Ajuste por BMI
    if (bmi < 19) {
      rrMajor *= 1.4;
      rrHip *= 1.6;
    } else if (bmi < 20) {
      rrMajor *= 1.2;
      rrHip *= 1.3;
    } else if (bmi > 30) {
      rrMajor *= 0.9;
      rrHip *= 0.8;
    }

    // Ajuste por densidad ósea (T-score)
    if (formData.boneDensity) {
      const tScore = parseFloat(formData.boneDensity);
      if (tScore < -2.5) {
        rrMajor *= 2.5;
        rrHip *= 3.0;
      } else if (tScore < -2.0) {
        rrMajor *= 2.0;
        rrHip *= 2.4;
      } else if (tScore < -1.5) {
        rrMajor *= 1.6;
        rrHip *= 1.9;
      } else if (tScore < -1.0) {
        rrMajor *= 1.3;
        rrHip *= 1.5;
      }
    }

    // Factores adicionales de FRAX+: Caídas
    if (formData.falls) {
      const fallsCount = parseInt(formData.falls);
      if (fallsCount >= 2) {
        rrMajor *= 1.4;
        rrHip *= 1.5;
      } else if (fallsCount === 1) {
        rrMajor *= 1.2;
        rrHip *= 1.3;
      }
    }

    // Factor adicional: Fractura reciente (últimos 2 años)
    if (formData.recentFracture) {
      rrMajor *= 1.8;
      rrHip *= 2.0;
    }

    // Calcular riesgo final
    let majorFractureRisk = baseRiskMajor * rrMajor;
    let hipFractureRisk = baseRiskHip * rrHip;
    
    // Para FRAX+, si hay fractura reciente, calcular riesgo inmediato aumentado
    let immediateFractureRisk = majorFractureRisk;
    if (formData.recentFracture) {
      immediateFractureRisk = majorFractureRisk * 1.5;
    }

    // Limitar a 99%
    majorFractureRisk = Math.min(99, parseFloat(majorFractureRisk.toFixed(1)));
    hipFractureRisk = Math.min(99, parseFloat(hipFractureRisk.toFixed(1)));
    immediateFractureRisk = Math.min(99, parseFloat(immediateFractureRisk.toFixed(1)));

    // Determinar nivel de riesgo y color
    let riskLevel = '';
    let riskColor = '';
    let interpretationDoctor = '';
    let interpretationPatient = '';
    
    if (formData.recentFracture) {
      riskLevel = 'muy alto (inminente)';
      riskColor = '#dc2626';
      interpretationDoctor = `Riesgo muy alto de fractura inminente. Fractura reciente (<2 años) aumenta significativamente el riesgo inmediato: ${immediateFractureRisk}%. Fractura mayor a 10 años: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%. SE RECOMIENDA INICIO URGENTE de tratamiento anabólico (teriparatida, romosozumab) o denosumab. Valorar urgentemente riesgo de caídas. Optimizar calcio/vitamina D. Seguimiento estrecho mensual los primeros 3 meses.`;
      interpretationPatient = `⚠️ IMPORTANTE: Has tenido una fractura recientemente, lo que aumenta mucho tu riesgo de tener otra fractura pronto (riesgo inmediato: ${immediateFractureRisk}%). Es fundamental que inicies tratamiento cuanto antes. Tu reumatólogo/a te prescribirá medicación específica para fortalecer rápidamente tus huesos. También es muy importante prevenir caídas: usa calzado seguro, mejora la iluminación en casa, retira obstáculos. Sigue estrictamente las indicaciones médicas.`;
    } else if (immediateFractureRisk >= 20 || hipFractureRisk >= 3) {
      riskLevel = 'alto';
      riskColor = '#ef4444';
      const fallsText = formData.falls && parseInt(formData.falls) > 0 ? ` Historial de ${formData.falls} caída(s) en el último año aumenta el riesgo.` : '';
      interpretationDoctor = `Riesgo alto de fractura. Fractura mayor: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%, Riesgo inmediato: ${immediateFractureRisk}%.${fallsText} Se recomienda tratamiento farmacológico (bisfosfonatos, denosumab o anabólicos según perfil). Intervención sobre factores de riesgo de caídas: valoración geriátrica, fisioterapia, revisión de fármacos. Calcio 1200mg/día y vitamina D 800-1000 UI/día. Ejercicio supervisado. Reevaluar en 6-12 meses.`;
      interpretationPatient = `Tu riesgo de fractura es alto (${immediateFractureRisk}%). ${formData.falls && parseInt(formData.falls) > 0 ? `Las caídas que has tenido aumentan este riesgo. ` : ''}Tu reumatólogo/a te prescribirá medicación para fortalecer los huesos. Es muy importante: 1) Tomar la medicación según indicado, 2) Tomar calcio y vitamina D diariamente, 3) Hacer ejercicio (caminar 30 min/día), 4) Prevenir caídas en casa (quitar alfombras, buena luz, pasamanos), 5) Acudir a todas las revisiones.`;
    } else if (immediateFractureRisk >= 10 || hipFractureRisk >= 1) {
      riskLevel = 'moderado';
      riskColor = '#f59e0b';
      const fallsText = formData.falls && parseInt(formData.falls) > 0 ? ` Caídas recientes (${formData.falls}) son un factor de riesgo adicional importante.` : '';
      interpretationDoctor = `Riesgo moderado de fractura. Fractura mayor: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%, Riesgo inmediato: ${immediateFractureRisk}%.${fallsText} Valorar tratamiento farmacológico según edad, expectativa de vida, comorbilidades y preferencias del paciente. Optimizar factores de riesgo modificables. Asegurar calcio y vitamina D adecuados. Ejercicio de fuerza y equilibrio. Prevención de caídas. Reevaluar anualmente o si aparecen nuevos factores.`;
      interpretationPatient = `Tu riesgo de fractura es moderado (${immediateFractureRisk}%). ${formData.falls && parseInt(formData.falls) > 0 ? `Has tenido caídas recientemente, lo cual aumenta el riesgo. ` : ''}Tu reumatólogo/a decidirá si necesitas medicación. Mientras tanto es fundamental: tomar calcio y vitamina D, hacer ejercicio regular (especialmente ejercicios de equilibrio), ${formData.falls && parseInt(formData.falls) > 0 ? 'trabajar en prevención de caídas (fisioterapia, ejercicios de balance), ' : ''}mantener peso saludable y no fumar. Acude a tus revisiones.`;
    } else {
      riskLevel = 'bajo';
      riskColor = '#10b981';
      interpretationDoctor = `Riesgo bajo de fractura. Fractura mayor: ${majorFractureRisk}%, Cadera: ${hipFractureRisk}%, Riesgo inmediato: ${immediateFractureRisk}%. No se indica tratamiento farmacológico actualmente. Mantener medidas preventivas generales: calcio 1000-1200mg/día, vitamina D 800 UI/día, ejercicio regular con carga, evitar tabaco y alcohol excesivo. ${formData.falls && parseInt(formData.falls) > 0 ? 'Abordar factores de riesgo de caídas a pesar del bajo riesgo de fractura. ' : ''}Control periódico.`;
      interpretationPatient = `Tu riesgo de fractura es bajo (${immediateFractureRisk}%). ¡Buenas noticias! Para mantenerlo así: toma alimentos ricos en calcio (lácteos, pescado azul), toma el sol 15 minutos al día, haz ejercicio regular (caminar, bailar, yoga), mantén peso saludable y no fumes. ${formData.falls && parseInt(formData.falls) > 0 ? 'Aunque tu riesgo de fractura es bajo, es importante trabajar en prevenir caídas. ' : ''}Sigue con revisiones periódicas.`;
    }

    const result = {
      instrument: 'FRAXplus',
      score: immediateFractureRisk,
      interpretation: {
        text: `Riesgo ${riskLevel} de fractura`,
        color: riskColor,
        level: riskLevel
      },
      details: {
        majorFractureRisk: `${majorFractureRisk}%`,
        hipFractureRisk: `${hipFractureRisk}%`,
        immediateFractureRisk: `${immediateFractureRisk}%`,
        bmi: bmi.toFixed(1),
        age: formData.age,
        sex: formData.sex === 'female' ? 'Mujer' : 'Hombre',
        falls: formData.falls || '0',
        boneDensity: formData.boneDensity || 'No disponible',
        interpretationDoctor: interpretationDoctor,
        interpretationPatient: interpretationPatient
      }
    };

    onResult(result);
  };

  return (
    <div className="calculator-form">
      <h3>FRAX+</h3>
      <p className="calc-description">FRAX Plus - Enhanced Fracture Risk Assessment</p>
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Herramienta mejorada de evaluación del riesgo de fractura incluyendo caídas y fractura reciente
      </p>

      <label className="input-label">Edad (años) *</label>
      <input
        type="number"
        className="input-field"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
        min="40"
        max="90"
      />

      <label className="input-label">Sexo *</label>
      <select
        className="input-field"
        value={formData.sex}
        onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
      >
        <option value="">Seleccionar...</option>
        <option value="female">Mujer</option>
        <option value="male">Hombre</option>
      </select>

      <label className="input-label">Peso (kg) *</label>
      <input
        type="number"
        className="input-field"
        value={formData.weight}
        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
        step="0.1"
      />

      <label className="input-label">Altura (cm) *</label>
      <input
        type="number"
        className="input-field"
        value={formData.height}
        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
        step="0.1"
      />

      <label className="input-label">Número de caídas en el último año</label>
      <input
        type="number"
        className="input-field"
        value={formData.falls}
        onChange={(e) => setFormData({ ...formData, falls: e.target.value })}
        min="0"
        placeholder="0"
      />

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Factores de riesgo:</p>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.recentFracture}
            onChange={(e) => setFormData({ ...formData, recentFracture: e.target.checked })}
          />
          <span style={{ fontWeight: '600', color: '#dc2626' }}>Fractura en los últimos 2 años</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.previousFracture}
            onChange={(e) => setFormData({ ...formData, previousFracture: e.target.checked })}
          />
          <span>Fractura previa por fragilidad</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.parentFracture}
            onChange={(e) => setFormData({ ...formData, parentFracture: e.target.checked })}
          />
          <span>Fractura de cadera en algún progenitor</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.currentSmoker}
            onChange={(e) => setFormData({ ...formData, currentSmoker: e.target.checked })}
          />
          <span>Fumador/a actual</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.glucocorticoids}
            onChange={(e) => setFormData({ ...formData, glucocorticoids: e.target.checked })}
          />
          <span>Glucocorticoides (≥5 mg/día prednisona ≥3 meses)</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.rheumatoidArthritis}
            onChange={(e) => setFormData({ ...formData, rheumatoidArthritis: e.target.checked })}
          />
          <span>Artritis reumatoide</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.secondaryOsteoporosis}
            onChange={(e) => setFormData({ ...formData, secondaryOsteoporosis: e.target.checked })}
          />
          <span>Osteoporosis secundaria</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.alcohol3Plus}
            onChange={(e) => setFormData({ ...formData, alcohol3Plus: e.target.checked })}
          />
          <span>Alcohol (3 o más unidades al día)</span>
        </label>
      </div>

      <label className="input-label" style={{ marginTop: '1rem' }}>
        Densidad mineral ósea (T-score cuello femoral)
        {!isDoctor && <span style={{ color: '#f59e0b', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
          Este campo será completado por el reumatólogo/a
        </span>}
      </label>
      <input
        type="number"
        className="input-field"
        value={formData.boneDensity}
        onChange={(e) => setFormData({ ...formData, boneDensity: e.target.value })}
        step="0.1"
        placeholder="Ejemplo: -2.5"
        disabled={!isDoctor}
        readOnly={!isDoctor}
        style={!isDoctor ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      />

      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular FRAX+
      </button>
    </div>
  );
};

const SLICCCalculator = ({ onResult, isDoctor = false, initialData = null }) => {
  const [components, setComponents] = useState(
    initialData || {
      ocular: false,
      neuropsych: false,
      renal: false,
      pulmonary: false,
      cardiovascular: false,
      peripheral: false,
      gastrointestinal: false,
      musculoskeletal: false,
      skin: false,
      premature_gonadal: false,
      diabetes: false,
      malignancy: false
    }
  );
  
  const handleCalculate = () => {
    const score = calculateSLICC(components);
    const interpretation = interpretSLICC(score);
    onResult({ 
      score, 
      interpretation, 
      components, 
      instrument: 'SLICC' 
    });
  };
  
  const items = [
    { key: 'ocular', label: 'Daño ocular (cataratas, cambios retinianos)' },
    { key: 'neuropsych', label: 'Daño neuropsiquiátrico (deterioro cognitivo, psicosis)' },
    { key: 'renal', label: 'Daño renal (TFG <50%, proteinuria, insuf. renal terminal)' },
    { key: 'pulmonary', label: 'Daño pulmonar (hipertensión pulmonar, fibrosis)' },
    { key: 'cardiovascular', label: 'Daño cardiovascular (angina, IAM, ICC, enfermedad valvular)' },
    { key: 'peripheral', label: 'Daño vascular periférico (claudicación, amputación)' },
    { key: 'gastrointestinal', label: 'Daño gastrointestinal (infarto, cirugía, estenosis)' },
    { key: 'musculoskeletal', label: 'Daño musculoesquelético (erosiones, deformidades)' },
    { key: 'skin', label: 'Daño cutáneo (cicatrices extensas, úlceras)' },
    { key: 'premature_gonadal', label: 'Fallo gonadal prematuro' },
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'malignancy', label: 'Malignidad (excepto displasia)' }
  ];
  
  if (!isDoctor) {
    return (
      <div className="calculator-form">
        <h3>SLICC</h3>
        <p className="calc-description">Systemic Lupus International Collaborating Clinics Damage Index</p>
        <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
          Índice de daño acumulado en lupus eritematoso sistémico
        </p>
        
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          marginTop: '1rem'
        }}>
          <p style={{ color: '#92400e', fontWeight: '600', margin: 0 }}>
            ⚠️ Esta calculadora solo puede ser completada por el reumatólogo/a o enfermera durante la consulta
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="calculator-form">
      <h3>SLICC</h3>
      <p className="calc-description">Systemic Lupus International Collaborating Clinics Damage Index</p>
      <p className="calc-description" style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
        Índice de daño acumulado en lupus eritematoso sistémico
      </p>
      
      <p style={{ marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
        Marcar si existe daño en cada área (presente durante ≥6 meses):
      </p>
      
      {items.map(item => (
        <div key={item.key} style={{
          padding: '1rem',
          backgroundColor: components[item.key] ? '#e0f2fe' : '#f8fafc',
          borderRadius: '0.5rem',
          marginBottom: '0.5rem',
          border: '2px solid',
          borderColor: components[item.key] ? '#0891b2' : '#e2e8f0',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }} onClick={() => setComponents(prev => ({ ...prev, [item.key]: !prev[item.key] }))}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={components[item.key]}
              onChange={() => setComponents(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.95rem', color: '#1e293b' }}>{item.label}</span>
          </label>
        </div>
      ))}
      
      <button className="btn-calculate" onClick={handleCalculate}>
        Calcular SLICC
      </button>
    </div>
  );
};

const ConsentModal = ({ onClose, onAccept, onRead }) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e) => {
    const element = e.target;
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (scrolledToBottom && !hasScrolled) {
      setHasScrolled(true);
      onRead();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            🔒 Condiciones de Uso de Datos
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.25rem'
            }}
          >
            ×
          </button>
        </div>

        <div 
          onScroll={handleScroll}
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            fontSize: '0.875rem',
            lineHeight: '1.75',
            color: '#374151'
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              1. Responsable del tratamiento
            </h3>
            <p style={{ margin: 0 }}>
              ReumaCal (@reumacastro) es una herramienta de apoyo clínico para el seguimiento de enfermedades reumatológicas. 
              El responsable del tratamiento de tus datos es tu médico reumatólogo, quien utiliza esta aplicación como herramienta asistencial.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              2. Datos que se recopilan
            </h3>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              A través de esta aplicación se recopilarán los siguientes datos:
            </p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
              <li>Datos de identificación: email, nombre, NHC (Número de Historia Clínica)</li>
              <li>Centro hospitalario al que perteneces</li>
              <li>Resultados de las calculadoras reumatológicas (BASDAI, ASDAS, DAS28, SLEDAI, etc.)</li>
              <li>Fechas de realización de evaluaciones</li>
              <li>Histórico de puntuaciones y evolución clínica</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              3. Finalidad del tratamiento
            </h3>
            <p style={{ margin: 0 }}>
              Tus datos serán utilizados exclusivamente para:
            </p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
              <li>Seguimiento clínico de tu enfermedad reumatológica</li>
              <li>Evaluación de la actividad de tu enfermedad</li>
              <li>Monitorización de tu calidad de vida y respuesta al tratamiento</li>
              <li>Apoyo en la toma de decisiones terapéuticas por parte de tu reumatólogo</li>
            </ul>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              4. Almacenamiento y seguridad
            </h3>
            <p style={{ margin: 0 }}>
              Tus datos se almacenan de forma segura en servidores de Supabase (infraestructura cloud certificada) 
              ubicados en la Unión Europea. La aplicación utiliza tecnología de encriptación para proteger tu información. 
              Solo tu reumatólogo del mismo hospital puede acceder a tus datos.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              5. Acceso a los datos
            </h3>
            <p style={{ margin: 0 }}>
              Únicamente tendrán acceso a tus datos:
            </p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
              <li>Tu médico reumatólogo responsable de tu atención</li>
              <li>Otros reumatólogos del mismo hospital (solo si tu médico lo autoriza)</li>
            </ul>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Los datos están compartimentados por hospital. Un médico de otro hospital no puede ver tus datos.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              6. Tus derechos (RGPD)
            </h3>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              Conforme al Reglamento General de Protección de Datos (RGPD), tienes derecho a:
            </p>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
              <li><strong>Acceso:</strong> Consultar qué datos personales tenemos sobre ti</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Portabilidad:</strong> Obtener copia de tus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
            </ul>
            <p style={{ margin: '0.5rem 0 0 0' }}>
              Para ejercer estos derechos, contacta con tu reumatólogo o con el servicio de atención al paciente de tu hospital.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              7. Conservación de datos
            </h3>
            <p style={{ margin: 0 }}>
              Tus datos se conservarán mientras dure tu relación asistencial con el servicio de reumatología y posteriormente 
              durante el plazo establecido por la normativa sanitaria vigente (mínimo 5 años desde la última asistencia).
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1f2937' }}>
              8. Consentimiento
            </h3>
            <p style={{ margin: 0 }}>
              Al aceptar estas condiciones, consientes expresamente el tratamiento de tus datos de salud para las finalidades descritas. 
              Puedes retirar tu consentimiento en cualquier momento, lo que implicará la imposibilidad de seguir utilizando esta herramienta 
              para tu seguimiento clínico.
            </p>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            borderRadius: '0.375rem',
            borderLeft: '4px solid #f59e0b',
            marginTop: '1.5rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#92400e', fontWeight: '500' }}>
              ⚠️ <strong>Importante:</strong> Debes leer todo el documento hasta el final para poder aceptar las condiciones. 
              Desplázate hacia abajo para continuar.
            </p>
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onAccept}
            disabled={!hasScrolled}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: hasScrolled ? '#3b82f6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: hasScrolled ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: hasScrolled ? 1 : 0.6
            }}
          >
            He leído y acepto
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthPage = ({ role, onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [hasReadConsent, setHasReadConsent] = useState(false);
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

        // Validar que las contraseñas coincidan
        if (!isLogin && password !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        // Validar consentimiento para pacientes
        if (role === 'patient' && !consentAccepted) {
          setError('Debes leer y aceptar las condiciones de uso de datos');
          setLoading(false);
          return;
        }
        
        if (role === 'patient' && !hasReadConsent) {
          setError('Debes leer las condiciones completas antes de aceptar');
          setLoading(false);
          return;
        }
        
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
    <>
      {showConsentModal && (
        <ConsentModal
          onClose={() => setShowConsentModal(false)}
          onAccept={() => {
            setConsentAccepted(true);
            setHasReadConsent(true);
            setShowConsentModal(false);
          }}
          onRead={() => setHasReadConsent(true)}
        />
      )}
    <div className="auth-page">
      <button className="btn-back" onClick={() => onBack('landing')}>← Volver</button>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>{role === 'patient' ? '👤 Paciente' : '👨‍⚕️ Reumatólogo/a'}</h2>
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
            <FormInput
              label="Confirmar contraseña"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              placeholder="••••••••"
            />
          )}

          {!isLogin && role === 'patient' && (
            <div style={{ 
              marginTop: '1.5rem',
              padding: '1.25rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              border: '2px solid #f59e0b'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => {
                    if (!hasReadConsent) {
                      setShowConsentModal(true);
                    } else {
                      setConsentAccepted(e.target.checked);
                    }
                  }}
                  style={{
                    marginTop: '0.25rem',
                    width: '1.25rem',
                    height: '1.25rem',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <label style={{ 
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: '#92400e',
                  fontWeight: '500'
                }}>
                  He leído y acepto las condiciones de uso de datos personales y de salud
                </label>
              </div>
              
              <button
                type="button"
                onClick={() => setShowConsentModal(true)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                📄 Leer condiciones completas
              </button>
            </div>
          )}
          
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
          {isLogin && (
            <button 
              type="button" 
              onClick={() => onBack('forgot-password')}
              style={{
                marginTop: '1rem',
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </form>
      </div>
      
      <Brand size="small" />
    </div>
  </>);
};
const ForgotPasswordPage = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Verificar que el email existe
      const user = await Storage.getUserByEmail(email);
      
      if (!user) {
        setError('No existe ninguna cuenta con ese email');
        setLoading(false);
        return;
      }

      // Generar un código de 6 dígitos
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hora

      // Guardar el código en localStorage temporalmente
      // En producción, esto debería guardarse en la base de datos
      const resetData = {
        email,
        code: resetCode,
        expiresAt: expiresAt.getTime()
      };
      localStorage.setItem(`reset_${email}`, JSON.stringify(resetData));

      // Aquí iría el envío del email
      // Por ahora, mostrar el código en pantalla (solo para desarrollo)
      setMessage(`Código de recuperación: ${resetCode}\n\nEn producción, este código se enviaría por email.\n\nEl código expira en 1 hora.`);
      setSent(true);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError('Error al procesar la solicitud');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="btn-back" onClick={() => onBack()}>← Volver</button>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔑 Recuperar Contraseña</h2>
        </div>
        
        {!sent ? (
          <form onSubmit={handleSubmit}>
            <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Introduce tu email y te enviaremos un código para resetear tu contraseña
            </p>
            
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="tu@email.com"
            />
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        ) : (
          <div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#d1fae5',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              whiteSpace: 'pre-line'
            }}>
              <p style={{ margin: 0, color: '#065f46', fontSize: '0.875rem' }}>
                ✅ {message}
              </p>
            </div>
            
            <button 
              onClick={() => onBack('reset-password', email)}
              className="btn-submit"
            >
              Introducir código
            </button>
          </div>
        )}
      </div>
      
      <Brand size="small" />
    </div>
  );
};

const ResetPasswordPage = ({ email, onBack, onSuccess }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validar que las contraseñas coincidan
      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Validar longitud mínima
      if (newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      // Verificar el código
      const resetDataStr = localStorage.getItem(`reset_${email}`);
      if (!resetDataStr) {
        setError('Código expirado o inválido. Solicita uno nuevo.');
        setLoading(false);
        return;
      }

      const resetData = JSON.parse(resetDataStr);

      // Verificar que no haya expirado
      if (Date.now() > resetData.expiresAt) {
        localStorage.removeItem(`reset_${email}`);
        setError('El código ha expirado. Solicita uno nuevo.');
        setLoading(false);
        return;
      }

      // Verificar que el código coincida
      if (code !== resetData.code) {
        setError('Código incorrecto');
        setLoading(false);
        return;
      }

      // Actualizar la contraseña en Supabase
      const { data: users, error: getUserError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      if (getUserError || !users || users.length === 0) {
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }

      const user = users[0];
      const newPasswordHash = hashPassword(newPassword);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', user.id);

      if (updateError) {
        setError('Error al actualizar la contraseña');
        setLoading(false);
        return;
      }

      // Limpiar el código usado
      localStorage.removeItem(`reset_${email}`);

      // Mostrar mensaje de éxito
      alert('✅ Contraseña actualizada correctamente');
      onSuccess();

    } catch (err) {
      console.error(err);
      setError('Error al procesar la solicitud');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="btn-back" onClick={() => onBack()}>← Volver</button>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>🔐 Nueva Contraseña</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Email: <strong>{email}</strong>
          </p>
          
          <FormInput
            label="Código de recuperación"
            type="text"
            value={code}
            onChange={setCode}
            required
            placeholder="123456"
            maxLength={6}
          />
          
          <FormInput
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            required
            placeholder="••••••••"
          />
          
          <FormInput
            label="Confirmar nueva contraseña"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            placeholder="••••••••"
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
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
  const [expandedSections, setExpandedSections] = useState({ espondilo: false, aps: false, ar: false, lupus: false, sjogren: false, osteoporosis: false, calidad: false, cardiovascular: false });
  const toggleSection = (s) => setExpandedSections(p => ({ ...p, [s]: !p[s] }));
  
  // Sistema de navegación con historial
  const navigateView = (newView) => {
    setView(newView);
    window.history.pushState(
      { page: 'patient-dashboard', patientView: newView },
      '',
      `#patient-dashboard?view=${newView}`
    );
  };
  
  useEffect(() => {
    // Restaurar vista desde URL al cargar
    const hash = window.location.hash;
    if (hash.includes('view=')) {
      const urlView = hash.split('view=')[1];
      if (['home', 'calculators', 'history', 'profile'].includes(urlView)) {
        setView(urlView);
      }
    }
    
    // Escuchar cambios en el historial (botón atrás/adelante)
    const handleViewChange = () => {
      const hash = window.location.hash;
      if (hash.includes('view=')) {
        const urlView = hash.split('view=')[1];
        if (['home', 'calculators', 'history', 'profile'].includes(urlView)) {
          setView(urlView);
          // Limpiar estados de calculadora al navegar
          setSelectedCalc(null);
          setResult(null);
        }
      } else if (hash === '#patient-dashboard') {
        setView('home');
        setSelectedCalc(null);
        setResult(null);
      }
    };
    
    window.addEventListener('popstate', handleViewChange);
    return () => window.removeEventListener('popstate', handleViewChange);
  }, []);
  
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
    
    // Verificar si es calculadora colaborativa
    const isCollaborative = COLLABORATIVE_CALCULATORS[result.instrument]?.collaborative;
    
    if (isCollaborative) {
      // Guardar como pendiente para que el médico complete
      const pending = await Storage.savePendingCalculation({
        patient_id: patient.id,
        instrument: result.instrument,
        patient_data: result.components,
        status: 'PENDING'
      });
      
      if (pending) {
        setSaved(true);
        // Mostrar mensaje diferente para pendientes
        alert('Datos guardados. El reumatólogo/a completará esta calculadora en la consulta.');
      }
    } else {
      // Guardar directamente como score completo
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
  
  const availableInstruments = useMemo(() => {
    const unique = [...new Set(scores.map(s => s.instrument))];
    return unique.sort();
  }, [scores]);
  
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
    const instruments = ['BASDAI', 'ASDAS_CRP', 'ASDAS_ESR', 'DAPSA', 'MDA', 'DAS28_PCR_APS', 'PSAQoL',
                        'DAS28_CRP', 'DAS28_ESR',
                        'SLEDAI', 'LupusPRO', 'FACIT', 'SF36', 'BASFI', 'ASASHI', 
                        'ASQoL', 'ESSPRI', 'SSDAI', 'SCORE2', 'SCORE2-OP'];
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
              else if (inst === 'MDA') interpretation = interpretMDAScore(score.total_score);
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
              else if (inst === 'SCORE2') interpretation = interpretSCORE2(score.total_score);
              else if (inst === 'SCORE2-OP') interpretation = interpretSCORE2OP(score.total_score);
              else if (inst === 'QRISK3') interpretation = interpretQRISK3(score.total_score);
              else if (inst === 'SLICC') interpretation = interpretSLICC(score.total_score);
              else if (inst === 'FRAX') interpretation = interpretFRAX(score.total_score);
              else if (inst === 'FRAXplus') interpretation = interpretFRAXplus(score.total_score);
              else interpretation = { text: 'Sin datos', color: '#9ca3af' };
              
              return (
                <div key={inst} className="summary-card" style={{ borderColor: interpretation.color }}>
                  <div className="summary-inst">{inst === 'FRAXplus' ? 'FRAX+' : inst.replace('_', '-')}</div>
                  <div className="summary-score" style={{ color: interpretation.color }}>
                    {score.total_score}{(inst === 'FRAX' || inst === 'FRAXplus' || inst === 'SCORE2' || inst === 'SCORE2-OP' || inst === 'QRISK3') && '%'}
                  </div>
                  <div className="summary-interp" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {interpretation.text}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('aps')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔴</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Artritis psoriásica</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>4 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.aps ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.aps && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('DAPSA'); setResult(null); }}>
                    <span className="calc-icon">📉</span>
                    <span className="calc-name">DAPSA</span>
                    <span className="calc-desc">Actividad de la enfermedad en artritis psoriásica</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa el dolor (el reumatólogo/a añadirá exploración y analítica)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('DAS28_PCR_APS'); setResult(null); }}>
                    <span className="calc-icon">🩺</span>
                    <span className="calc-name">DAS28-PCR</span>
                    <span className="calc-desc">Actividad de la enfermedad con PCR</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa valoración global (el reumatólogo/a añadirá exploración y analítica)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('MDA'); setResult(null); }}>
                    <span className="calc-icon">🎯</span>
                    <span className="calc-name">MDA</span>
                    <span className="calc-desc">Actividad mínima de la enfermedad</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa dolor y HAQ (el reumatólogo/a añadirá exploración y PASI)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('PSAQoL'); setResult(null); }}>
                    <span className="calc-icon">💚</span>
                    <span className="calc-name">PsAQoL</span>
                    <span className="calc-desc">Calidad de vida en artritis psoriásica</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('ar')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔵</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Artritis reumatoide</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>1 calculadora</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.ar ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.ar && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('DAS28'); setResult(null); }}>
                    <span className="calc-icon">📋</span>
                    <span className="calc-name">DAS28</span>
                    <span className="calc-desc">Actividad de la enfermedad en artritis reumatoide</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tu evaluación (el reumatólogo/a añadirá exploración y analítica)</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('espondilo')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦴</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Espondiloartritis</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>5 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.espondilo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.espondilo && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ASDAS'); setResult(null); }}>
                    <span className="calc-icon">📈</span>
                    <span className="calc-name">ASDAS</span>
                    <span className="calc-desc">Actividad espondiloartritis</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tus síntomas (el reumatólogo/a añadirá la analítica)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('BASDAI'); setResult(null); }}>
                    <span className="calc-icon">📊</span>
                    <span className="calc-name">BASDAI</span>
                    <span className="calc-desc">Actividad de la enfermedad en espondiloartritis axial</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('BASFI'); setResult(null); }}>
                    <span className="calc-icon">🚶</span>
                    <span className="calc-name">BASFI</span>
                    <span className="calc-desc">Función espondilitis</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ASQoL'); setResult(null); }}>
                    <span className="calc-icon">😊</span>
                    <span className="calc-name">ASQoL</span>
                    <span className="calc-desc">Calidad de vida en espondiloartritis axial</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ASASHI'); setResult(null); }}>
                    <span className="calc-icon">💡</span>
                    <span className="calc-name">ASAS-HI</span>
                    <span className="calc-desc">Impacto en salud</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('lupus')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦋</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Lupus eritematoso sistémico</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>3 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.lupus ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.lupus && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SLEDAI'); setResult(null); }}>
                    <span className="calc-icon">🦋</span>
                    <span className="calc-name">SLEDAI</span>
                    <span className="calc-desc">Actividad lupus</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Esta calculadora la completará el reumatólogo/a en consulta</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SLICC'); setResult(null); }}>
                    <span className="calc-icon">📋</span>
                    <span className="calc-name">SLICC</span>
                    <span className="calc-desc">Daño en lupus</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Esta calculadora la completará el reumatólogo/a en consulta</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('LupusPRO'); setResult(null); }}>
                    <span className="calc-icon">💚</span>
                    <span className="calc-name">LupusPRO</span>
                    <span className="calc-desc">Calidad de vida lupus</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('sjogren')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💧</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Síndrome de Sjögren</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>2 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.sjogren ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.sjogren && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ESSPRI'); setResult(null); }}>
                    <span className="calc-icon">💧</span>
                    <span className="calc-name">ESSPRI</span>
                    <span className="calc-desc">Síntomas Sjögren</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SSDAI'); setResult(null); }}>
                    <span className="calc-icon">🔬</span>
                    <span className="calc-name">SSDAI</span>
                    <span className="calc-desc">Actividad Sjögren</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Esta calculadora la completará el reumatólogo/a en consulta</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('osteoporosis')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦴</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Osteoporosis</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>2 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.osteoporosis ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.osteoporosis && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('FRAX'); setResult(null); }}>
                    <span className="calc-icon">📊</span>
                    <span className="calc-name">FRAX</span>
                    <span className="calc-desc">Riesgo de fractura a 10 años</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tus datos (el reumatólogo/a añadirá densidad ósea)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('FRAXplus'); setResult(null); }}>
                    <span className="calc-icon">📈</span>
                    <span className="calc-name">FRAX+</span>
                    <span className="calc-desc">Riesgo de fractura mejorado</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tus datos y caídas (el reumatólogo/a añadirá densidad ósea)</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('calidad')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💚</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Calidad de vida general</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>2 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.calidad ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.calidad && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('FACIT'); setResult(null); }}>
                    <span className="calc-icon">💪</span>
                    <span className="calc-name">FACIT</span>
                    <span className="calc-desc">Fatiga</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SF36'); setResult(null); }}>
                    <span className="calc-icon">🏥</span>
                    <span className="calc-name">SF-36</span>
                    <span className="calc-desc">Encuesta de salud</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('cardiovascular')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>❤️</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Riesgo cardiovascular</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>3 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.cardiovascular ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.cardiovascular && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SCORE2'); setResult(null); }}>
                    <span className="calc-icon">💗</span>
                    <span className="calc-name">SCORE2</span>
                    <span className="calc-desc">Riesgo cardiovascular 40-69 años</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tus datos básicos (el reumatólogo/a añadirá PA y colesterol)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SCORE2-OP'); setResult(null); }}>
                    <span className="calc-icon">❤️</span>
                    <span className="calc-name">SCORE2-OP</span>
                    <span className="calc-desc">Riesgo cardiovascular ≥70 años</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tus datos básicos (el reumatólogo/a añadirá PA y colesterol)</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('QRISK3'); setResult(null); }}>
                    <span className="calc-icon">🫀</span>
                    <span className="calc-name">QRISK3</span>
                    <span className="calc-desc">Riesgo cardiovascular</span>
                    <span className="calc-desc" style={{ color: '#f59e0b', fontWeight: '600', marginTop: '0.25rem', fontSize: '0.85rem' }}>Completa tus datos básicos (el reumatólogo/a añadirá datos clínicos)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        <>
          <button className="btn-back-calc" onClick={() => { setSelectedCalc(null); setResult(null); }}>
            ← Volver a calculadoras
          </button>
          
          <div className="calc-container">
            {selectedCalc === 'BASDAI' && <BASDAICalculator onResult={handleResult} />}
            {selectedCalc === 'ASDAS' && <ASDASCalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'DAPSA' && <DAPSACalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'MDA' && <MDACalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'DAS28_PCR_APS' && <DAS28Calculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'DAS28' && <DAS28Calculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'SLEDAI' && <SLEDAICalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'LupusPRO' && <LupusPROCalculator onResult={handleResult} />}
            {selectedCalc === 'FACIT' && <FACITCalculator onResult={handleResult} />}
            {selectedCalc === 'SF36' && <SF36Calculator onResult={handleResult} />}
            {selectedCalc === 'BASFI' && <BASFICalculator onResult={handleResult} />}
            {selectedCalc === 'ASASHI' && <ASASHICalculator onResult={handleResult} />}
            {selectedCalc === 'ASQoL' && <ASQoLCalculator onResult={handleResult} />}
            {selectedCalc === 'PSAQoL' && <PSAQoLCalculator onResult={handleResult} />}
            {selectedCalc === 'ESSPRI' && <ESSPRICalculator onResult={handleResult} />}
            {selectedCalc === 'SSDAI' && <SSDAICalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'FRAX' && <FRAXCalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'FRAXplus' && <FRAXplusCalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'SCORE2' && <SCORE2Calculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'SCORE2-OP' && <SCORE2OPCalculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'QRISK3' && <QRISK3Calculator onResult={handleResult} isDoctor={false} />}
            {selectedCalc === 'SLICC' && <SLICCCalculator onResult={handleResult} isDoctor={false} />}
            
            {result && (
              (result.instrument === 'FRAX' || result.instrument === 'FRAXplus') ? (
                <FRAXResultCard
                  result={result}
                  onSave={handleSave}
                  saved={saved}
                  saving={saving}
                  isDoctor={false}
                />
              ) : (
                <ResultCard
                  score={result.score}
                  interpretation={result.interpretation}
                  instrument={result.instrument}
                  onSave={handleSave}
                  saved={saved}
                  saving={saving}
                />
              )
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
          {availableInstruments.map(inst => {
            const displayNames = {
              'BASDAI': 'BASDAI',
              'ASDAS_CRP': 'ASDAS-PCR',
              'ASDAS_ESR': 'ASDAS-VSG',
              'BASFI': 'BASFI',
              'ASQoL': 'ASQoL',
              'ASASHI': 'ASAS-HI',
              'DAPSA': 'DAPSA',
              'MDA': 'MDA',
              'DAS28_PCR_APS': 'DAS28-PCR (APs)',
              'PSAQoL': 'PSAQoL',
              'DAS28_CRP': 'DAS28-PCR',
              'DAS28_ESR': 'DAS28-VSG',
              'SLEDAI': 'SLEDAI',
              'SLICC': 'SLICC',
              'FACIT': 'FACIT',
              'SF36': 'SF-36',
              'LupusPRO': 'LupusPRO',
              'ESSPRI': 'ESSPRI',
              'SSDAI': 'SSDAI',
              'FRAX': 'FRAX',
              'FRAXplus': 'FRAX+',
              'SCORE2': 'SCORE2 (40-69 años)',
              'SCORE2-OP': 'SCORE2-OP (+70 años)',
              'QRISK3': 'QRISK3'
            };
            return (
              <option key={inst} value={inst}>
                {displayNames[inst] || inst}
              </option>
            );
          })}
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
                else if (score.instrument === 'MDA') interpretation = interpretMDAScore(score.total_score);
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
          <button className={view === 'home' ? 'active' : ''} onClick={() => navigateView('home')}>Inicio</button>
          <button className={view === 'calculators' ? 'active' : ''} onClick={() => navigateView('calculators')}>Calculadoras</button>
          <button className={view === 'history' ? 'active' : ''} onClick={() => navigateView('history')}>Histórico</button>
          <button className={view === 'profile' ? 'active' : ''} onClick={() => navigateView('profile')}>Perfil</button>
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
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', marginTop: '8px' }}>
          <a href="#" onClick={(e) => { e.preventDefault(); window.open('', '_blank').document.write('Cargando...'); }} style={{ color: '#999' }}>Aviso Legal</a>
          <span style={{ color: '#ccc' }}>|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: '#999' }}>Política de Privacidad</a>
          <span style={{ color: '#ccc' }}>|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: '#999' }}>Política de Cookies</a>
        </div>
      </footer>
    </div>
  );
};

const DoctorDashboard = ({ user, onLogout }) => {
  const [view, setView] = useState('search');
  const [searchNhc, setSearchNhc] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientScores, setPatientScores] = useState([]);
  const [pendingCalcs, setPendingCalcs] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userHospital, setUserHospital] = useState(null);
  const [patientHospital, setPatientHospital] = useState(null);
  const [selectedCalc, setSelectedCalc] = useState(null);
  const [selectedPending, setSelectedPending] = useState(null);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ espondilo: false, aps: false, ar: false, lupus: false, sjogren: false, osteoporosis: false, calidad: false, cardiovascular: false });
  const toggleSection = (s) => setExpandedSections(p => ({ ...p, [s]: !p[s] }));
  
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
  
  const navigateView = (newView) => {
    setView(newView);
    // Usar pushState para añadir al historial del navegador
    window.history.pushState(
      { page: 'doctor-dashboard', doctorView: newView }, 
      '', 
      `#doctor-dashboard?view=${newView}`
    );
  };

  useEffect(() => {
    // Restaurar vista desde URL al cargar
    const hash = window.location.hash;
    if (hash.includes('view=')) {
      const urlView = hash.split('view=')[1];
      if (['search', 'patient', 'calculator'].includes(urlView)) {
        setView(urlView);
      }
    }
    
    // Escuchar cambios en el historial (botón atrás/adelante)
    const handleViewChange = () => {
      const hash = window.location.hash;
      if (hash.includes('view=')) {
        const urlView = hash.split('view=')[1];
        if (['search', 'patient', 'calculator'].includes(urlView)) {
          setView(urlView);
        }
      } else if (hash === '#doctor-dashboard') {
        setView('search');
      }
    };
    
    window.addEventListener('popstate', handleViewChange);
    return () => window.removeEventListener('popstate', handleViewChange);
  }, []);

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
    const pendings = await Storage.getPendingCalculations(patient.id);
    
    setSelectedPatient(patient);
    setPatientScores(scores);
    setPendingCalcs(pendings || []);
    navigateView('patient');
    setLoading(false);
  };
  
  const filteredScores = historyFilter === 'ALL'
    ? patientScores
    : patientScores.filter(s => s.instrument === historyFilter);
  
  const availableInstruments = useMemo(() => {
    const unique = [...new Set(patientScores.map(s => s.instrument))];
    return unique.sort();
  }, [patientScores]);
  
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
    const instruments = ['BASDAI', 'ASDAS_CRP', 'ASDAS_ESR', 'BASFI', 'ASQoL', 'ASASHI',
                        'DAPSA', 'MDA', 'DAS28_PCR_APS', 'PSAQoL',
                        'DAS28_CRP', 'DAS28_ESR',
                        'SLEDAI', 'SLICC',
                        'FACIT', 'SF36', 'LupusPRO',
                        'ESSPRI', 'SSDAI',
                        'SCORE2', 'SCORE2-OP', 'QRISK3'];
    return instruments.reduce((acc, inst) => {
      const last = patientScores.find(s => s.instrument === inst);
      if (last) acc[inst] = last;
      return acc;
    }, {});
  }, [patientScores]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleResult = async (resultData) => {
    setResult(resultData);
    setSaved(false);
  };
  
  const handleSaveScore = async () => {
    if (!selectedPatient || !result) {
      console.error('Falta selectedPatient o result:', { selectedPatient, result });
      return;
    }
    
    console.log('=== GUARDANDO SCORE ===');
    console.log('Paciente:', selectedPatient.id);
    console.log('Result:', result);
    console.log('SelectedPending:', selectedPending);
    
    setSaving(true);
    
    // Si estamos completando una pendiente, marcarla como completada
    if (selectedPending) {
      console.log('Completando pendiente:', selectedPending.id);
      const completed = await Storage.completePendingCalculation(selectedPending.id, user.id);
      console.log('Pendiente completada:', completed);
    }
    
    // Guardar el score completo
    const score = {
      patient_id: selectedPatient.id,
      instrument: result.instrument,
      total_score: result.score.toFixed(2),
      components_json: result.components
    };
    
    console.log('Guardando score:', score);
    const savedScore = await Storage.createScore(score);
    console.log('Score guardado:', savedScore);
    
    if (savedScore) {
      setSaved(true);
      
      // Recargar scores y pendientes del paciente
      console.log('Recargando scores y pendientes...');
      const updatedScores = await Storage.getScoresByPatientId(selectedPatient.id);
      const updatedPendings = await Storage.getPendingCalculations(selectedPatient.id);
      console.log('Scores actualizados:', updatedScores?.length || 0);
      console.log('Pendientes actualizadas:', updatedPendings?.length || 0);
      
      setPatientScores(updatedScores);
      setPendingCalcs(updatedPendings || []);
      
      // Limpiar estados
      setSelectedPending(null);
      setSelectedCalc(null);
      setResult(null);
      
      // Volver a vista de paciente después de 1 segundo
      setTimeout(() => {
        setView('patient');
        setSaved(false);
        console.log('=== GUARDADO COMPLETADO ===');
      }, 1500);
    } else {
      console.error('Error: No se pudo guardar el score');
    }
    setSaving(false);
  };
  
  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      // Eliminar el score de la base de datos
      const success = await Storage.deleteScore(scoreId);
      
      if (success) {
        // Recargar los scores del paciente
        const updatedScores = await Storage.getScoresByPatientId(selectedPatient.id);
        setPatientScores(updatedScores);
        
        alert('Registro eliminado correctamente');
      } else {
        alert('Error al eliminar el registro');
      }
    } catch (error) {
      console.error('Error eliminando score:', error);
      alert('Error al eliminar el registro');
    }
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
      <button className="btn-back-calc" onClick={() => { 
        setSelectedPatient(null);
        setView('search');
      }}>
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {!selectedCalc && (
            <button 
              className="btn-print" 
              onClick={() => navigateView('calculator')}
              style={{ backgroundColor: '#3b82f6' }}
            >
              ➕ Nueva Calculadora
            </button>
          )}
          <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir</button>
        </div>
      </div>
      
      {/* Sección de calculadoras pendientes */}
      {pendingCalcs.length > 0 && (
        <div className="pending-section" style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ color: '#92400e', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⏳ Calculadoras pendientes de completar
          </h3>
          <p style={{ margin: '0.5rem 0', color: '#78350f', fontSize: '0.9rem' }}>
            El paciente ha completado su parte. Completa los datos clínicos:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {pendingCalcs.map((pending) => (
              <button
                key={pending.id}
                onClick={() => {
                  setSelectedPending(pending);
                  // Mantener el instrumento completo para saber la variante
                  const baseInstrument = pending.instrument.includes('_') 
                    ? pending.instrument.split('_')[0] 
                    : pending.instrument;
                  setSelectedCalc(baseInstrument);
                  navigateView('calculator');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fbbf24',
                  color: '#78350f',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                📋 Completar {pending.instrument}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="patient-summary">
        <h3>Resumen última medición</h3>
        <div className="summary-grid">
          {Object.entries(lastScores).map(([inst, score]) => {
            let interpretation;
            if (inst === 'BASDAI') interpretation = interpretBASDAI(score.total_score);
            else if (inst.startsWith('ASDAS')) interpretation = interpretASDAS(score.total_score);
            else if (inst === 'DAPSA') interpretation = interpretDAPSA(score.total_score);
            else if (inst === 'MDA') interpretation = interpretMDAScore(score.total_score);
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
            {availableInstruments.map(inst => {
              const displayNames = {
                'BASDAI': 'BASDAI',
                'ASDAS_CRP': 'ASDAS-PCR',
                'ASDAS_ESR': 'ASDAS-VSG',
                'BASFI': 'BASFI',
                'ASQoL': 'ASQoL',
                'ASASHI': 'ASAS-HI',
                'DAPSA': 'DAPSA',
                'MDA': 'MDA',
                'DAS28_PCR_APS': 'DAS28-PCR (APs)',
                'PSAQoL': 'PsAQoL',
                'DAS28_CRP': 'DAS28-PCR',
                'DAS28_ESR': 'DAS28-VSG',
                'SLEDAI': 'SLEDAI',
                'SLICC': 'SLICC',
                'FACIT': 'FACIT',
                'SF36': 'SF-36',
                'LupusPRO': 'LupusPRO',
                'ESSPRI': 'ESSPRI',
                'SSDAI': 'SSDAI',
                'FRAX': 'FRAX',
                'FRAXplus': 'FRAX+',
                'SCORE2': 'SCORE2',
                'SCORE2-OP': 'SCORE2-OP',
                'QRISK3': 'QRISK3'
              };
              return (
                <option key={inst} value={inst}>
                  {displayNames[inst] || inst}
                </option>
              );
            })}
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((score) => {
                let interpretation;
                if (score.instrument === 'BASDAI') interpretation = interpretBASDAI(score.total_score);
                else if (score.instrument.startsWith('ASDAS')) interpretation = interpretASDAS(score.total_score);
                else if (score.instrument === 'DAPSA') interpretation = interpretDAPSA(score.total_score);
                else if (score.instrument === 'MDA') interpretation = interpretMDAScore(score.total_score);
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
                      <button 
                        className="btn-delete-score"
                        onClick={() => handleDeleteScore(score.id)}
                        title="Eliminar registro"
                      >
                        🗑️
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
      </div>
    </div>
  );
  
  const renderCalculator = () => (
    <div className="calculator-view">
      <button className="btn-back-calc" onClick={() => { 
        setSelectedCalc(null); 
        setResult(null); 
        setSaved(false);
        setSelectedPending(null);
        setView('patient');
      }}>
        ← Volver al paciente
      </button>
      
      {selectedPending ? (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <h2 style={{ color: '#92400e', margin: 0 }}>
            ✏️ Completando calculadora pendiente - {selectedPatient.nhc}
          </h2>
          <p style={{ margin: '0.5rem 0 0 0', color: '#78350f', fontSize: '0.9rem' }}>
            El paciente completó su parte. Añade los datos clínicos que faltan.
          </p>
        </div>
      ) : (
        <h2>Nueva Calculadora - {selectedPatient.nhc}</h2>
      )}
      
      {!selectedCalc ? (
        <>
          <p style={{ marginBottom: '2rem', color: '#64748b' }}>Selecciona una calculadora para realizar una nueva medición:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('aps')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔴</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Artritis psoriásica</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>4 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.aps ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.aps && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('DAPSA'); setResult(null); }}>
                    <span className="calc-icon">📉</span>
                    <span className="calc-name">DAPSA</span>
                    <span className="calc-desc">Actividad de la enfermedad en artritis psoriásica</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('DAS28_PCR_APS'); setResult(null); }}>
                    <span className="calc-icon">🩺</span>
                    <span className="calc-name">DAS28-PCR</span>
                    <span className="calc-desc">Actividad de la enfermedad con PCR</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('MDA'); setResult(null); }}>
                    <span className="calc-icon">🎯</span>
                    <span className="calc-name">MDA</span>
                    <span className="calc-desc">Actividad mínima de la enfermedad</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('PSAQoL'); setResult(null); }}>
                    <span className="calc-icon">💚</span>
                    <span className="calc-name">PsAQoL</span>
                    <span className="calc-desc">Calidad de vida en artritis psoriásica</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('ar')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔵</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Artritis reumatoide</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>1 calculadora</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.ar ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.ar && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('DAS28'); setResult(null); }}>
                    <span className="calc-icon">📋</span>
                    <span className="calc-name">DAS28</span>
                    <span className="calc-desc">Actividad de la enfermedad en artritis reumatoide</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('espondilo')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦴</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Espondiloartritis</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>5 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.espondilo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.espondilo && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ASDAS'); setResult(null); }}>
                    <span className="calc-icon">📈</span>
                    <span className="calc-name">ASDAS</span>
                    <span className="calc-desc">Actividad espondiloartritis</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('BASDAI'); setResult(null); }}>
                    <span className="calc-icon">📊</span>
                    <span className="calc-name">BASDAI</span>
                    <span className="calc-desc">Actividad de la enfermedad en espondiloartritis axial</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('BASFI'); setResult(null); }}>
                    <span className="calc-icon">🚶</span>
                    <span className="calc-name">BASFI</span>
                    <span className="calc-desc">Función espondilitis</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ASQoL'); setResult(null); }}>
                    <span className="calc-icon">😊</span>
                    <span className="calc-name">ASQoL</span>
                    <span className="calc-desc">Calidad de vida en espondiloartritis axial</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('ASASHI'); setResult(null); }}>
                    <span className="calc-icon">💡</span>
                    <span className="calc-name">ASAS-HI</span>
                    <span className="calc-desc">Impacto en salud</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('lupus')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦋</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Lupus eritematoso sistémico</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>3 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.lupus ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.lupus && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SLEDAI'); setResult(null); }}>
                    <span className="calc-icon">🦋</span>
                    <span className="calc-name">SLEDAI</span>
                    <span className="calc-desc">Actividad lupus</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SLICC'); setResult(null); }}>
                    <span className="calc-icon">📋</span>
                    <span className="calc-name">SLICC</span>
                    <span className="calc-desc">Daño en lupus</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('LupusPRO'); setResult(null); }}>
                    <span className="calc-icon">💚</span>
                    <span className="calc-name">LupusPRO</span>
                    <span className="calc-desc">Calidad de vida lupus</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('sjogren')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💧</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Síndrome de Sjögren</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>2 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.sjogren ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.sjogren && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
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
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('osteoporosis')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🦴</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Osteoporosis</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>2 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.osteoporosis ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.osteoporosis && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('FRAX'); setResult(null); }}>
                    <span className="calc-icon">📊</span>
                    <span className="calc-name">FRAX</span>
                    <span className="calc-desc">Riesgo de fractura a 10 años</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('FRAXplus'); setResult(null); }}>
                    <span className="calc-icon">📈</span>
                    <span className="calc-name">FRAX+</span>
                    <span className="calc-desc">Riesgo de fractura mejorado</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('calidad')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💚</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Calidad de vida general</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>2 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.calidad ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.calidad && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('FACIT'); setResult(null); }}>
                    <span className="calc-icon">💪</span>
                    <span className="calc-name">FACIT</span>
                    <span className="calc-desc">Fatiga</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SF36'); setResult(null); }}>
                    <span className="calc-icon">🏥</span>
                    <span className="calc-name">SF-36</span>
                    <span className="calc-desc">Encuesta de salud</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ border: '2px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
              <button onClick={() => toggleSection('cardiovascular')} style={{ width: '100%', padding: '1.25rem', backgroundColor: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>❤️</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>Riesgo cardiovascular</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>3 calculadoras</div>
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem', transform: expandedSections.cardiovascular ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
              </button>
              {expandedSections.cardiovascular && (
                <div className="calc-grid" style={{ padding: '1rem', backgroundColor: 'white' }}>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SCORE2'); setResult(null); }}>
                    <span className="calc-icon">💗</span>
                    <span className="calc-name">SCORE2</span>
                    <span className="calc-desc">Riesgo cardiovascular 40-69 años</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('SCORE2-OP'); setResult(null); }}>
                    <span className="calc-icon">❤️</span>
                    <span className="calc-name">SCORE2-OP</span>
                    <span className="calc-desc">Riesgo cardiovascular ≥70 años</span>
                  </button>
                  <button className="calc-card" onClick={() => { setSelectedCalc('QRISK3'); setResult(null); }}>
                    <span className="calc-icon">🫀</span>
                    <span className="calc-name">QRISK3</span>
                    <span className="calc-desc">Riesgo cardiovascular</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </>
      ) : (
        <>
          {selectedCalc === 'BASDAI' && <BASDAICalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'ASDAS' && <ASDASCalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'DAPSA' && <DAPSACalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'MDA' && <MDACalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'DAS28_PCR_APS' && <DAS28Calculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'DAS28' && <DAS28Calculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'SLEDAI' && <SLEDAICalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'LupusPRO' && <LupusPROCalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'FACIT' && <FACITCalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'SF36' && <SF36Calculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'BASFI' && <BASFICalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'ASASHI' && <ASASHICalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'ASQoL' && <ASQoLCalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'PSAQoL' && <PSAQoLCalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'ESSPRI' && <ESSPRICalculator onResult={handleResult} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'SSDAI' && <SSDAICalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'FRAX' && <FRAXCalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'FRAXplus' && <FRAXplusCalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'SCORE2' && <SCORE2Calculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'SCORE2-OP' && <SCORE2OPCalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'QRISK3' && <QRISK3Calculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          {selectedCalc === 'SLICC' && <SLICCCalculator onResult={handleResult} isDoctor={true} initialData={selectedPending?.patient_data} />}
          
          {result && (
            (result.instrument === 'FRAX' || result.instrument === 'FRAXplus') ? (
              <FRAXResultCard
                result={result}
                onSave={handleSaveScore}
                saved={saved}
                saving={saving}
                isDoctor={true}
              />
            ) : (
              <ResultCard
                score={result.score}
                interpretation={result.interpretation}
                instrument={result.instrument}
                onSave={handleSaveScore}
                saved={saved}
                saving={saving}
              />
            )
          )}
        </>
      )}
    </div>
  );
  
  return (
    <div className="dashboard doctor-dashboard">
      <header className="dashboard-header doctor-header">
        <div className="header-brand">
          <span className="logo-mini">🩺</span>
          <span className="app-name">ReumaCal</span>
          <span className="role-badge">Reumatólogo/a</span>
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
        {view === 'calculator' && selectedPatient && renderCalculator()}
      </main>
      
      <footer className="dashboard-footer">
        <Brand size="small" />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '12px', marginTop: '8px', color: '#999' }}>
          Aviso Legal | Política de Privacidad | Política de Cookies
        </div>
      </footer>
    </div>
  );
};
// ============================================
// PÁGINAS LEGALES
// ============================================

const PoliticaPrivacidadPage = ({ onBack }) => (
  <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#333', lineHeight: '1.7' }}>
    <button onClick={() => onBack()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', color: '#4f46e5' }}>← Volver</button>
    <h1>🔒 Política de Privacidad</h1>
    <p style={{ color: '#666' }}>Última actualización: febrero 2026</p>

    {/* ⚠️ CAMBIA LOS DATOS ENTRE CORCHETES POR LOS TUYOS */}

    <h2>1. Identificación del responsable y del encargado del tratamiento</h2>
    <p><strong>Encargado del tratamiento (proveedor de la plataforma):</strong></p>
    <ul>
      <li>Plataforma: <strong>ReumaCal</strong> (@reumacastro)</li>
      <li>Titular: [David Castro Corredor]</li>
      <li>Domicilio: [Avda. de los Reyes Católicos 5A, 13005 Ciudad Real]</li>
      <li>Email de contacto: [d.castrocorredor@gmail.com]</li>
    </ul>
    <p><strong>Responsable del tratamiento:</strong></p>
    <p>ReumaCal actúa como <strong>encargado del tratamiento</strong> conforme al artículo 28 del RGPD. El responsable del tratamiento de los datos de cada paciente es el <strong>centro hospitalario o servicio de reumatología</strong> al que pertenece el profesional sanitario que utiliza esta herramienta como apoyo clínico.</p>

    <h2>2. Datos personales que se recopilan</h2>
    <p><strong>Datos de identificación:</strong></p>
    <ul>
      <li>Dirección de correo electrónico</li>
      <li>Nombre y apellidos</li>
      <li>NHC (Número de Historia Clínica)</li>
      <li>Centro hospitalario</li>
    </ul>
    <p><strong>Datos de salud (categoría especial, art. 9 RGPD):</strong></p>
    <ul>
      <li>Resultados de calculadoras reumatológicas (BASDAI, ASDAS, DAS28, SLEDAI, HAQ, SF-36, etc.)</li>
      <li>Fechas de evaluaciones</li>
      <li>Histórico de puntuaciones y evolución clínica</li>
    </ul>

    <h2>3. Finalidad del tratamiento</h2>
    <ul>
      <li>Seguimiento clínico de tu enfermedad reumatológica</li>
      <li>Evaluación de la actividad de tu enfermedad</li>
      <li>Monitorización de tu calidad de vida y respuesta al tratamiento</li>
      <li>Apoyo en la toma de decisiones terapéuticas por parte de tu reumatólogo</li>
    </ul>
    <p>En ningún caso tus datos serán utilizados con fines comerciales, publicitarios ni serán cedidos a terceros ajenos a tu atención sanitaria.</p>

    <h2>4. Base legal del tratamiento</h2>
    <ul>
      <li><strong>Consentimiento explícito (art. 6.1.a y art. 9.2.a RGPD):</strong> Al registrarte y aceptar las condiciones, otorgas tu consentimiento explícito para el tratamiento de tus datos de salud.</li>
      <li><strong>Fines asistenciales (art. 9.2.h RGPD):</strong> El tratamiento es necesario para fines de medicina preventiva, diagnóstico médico y gestión de sistemas sanitarios.</li>
      <li><strong>Obligación legal (art. 6.1.c RGPD):</strong> Conservación de datos clínicos conforme a la Ley 41/2002 reguladora de la autonomía del paciente.</li>
    </ul>

    <h2>5. Almacenamiento y seguridad</h2>
    <p>Tus datos se almacenan en servidores de <strong>Supabase</strong> (infraestructura cloud certificada) ubicados en la <strong>Unión Europea</strong>. No se realizan transferencias internacionales fuera del EEE.</p>
    <p>Medidas de seguridad:</p>
    <ul>
      <li>Cifrado de datos en tránsito (HTTPS/TLS) y en reposo</li>
      <li>Autenticación segura mediante Supabase Auth</li>
      <li>Compartimentación de datos por centro hospitalario (Row Level Security)</li>
      <li>Acceso restringido según rol (reumatólogo / paciente)</li>
    </ul>

    <h2>6. Acceso a los datos</h2>
    <ul>
      <li>Tu médico reumatólogo responsable de tu atención</li>
      <li>Otros reumatólogos del mismo centro hospitalario (solo si tu médico lo autoriza)</li>
      <li>Tú mismo, como paciente, a tus propios datos</li>
    </ul>
    <p>Los datos están compartimentados por hospital. Un profesional de otro centro no puede acceder a tus datos.</p>

    <h2>7. Tus derechos (RGPD)</h2>
    <p>Conforme al RGPD (UE) 2016/679 y la LOPDGDD (LO 3/2018), tienes derecho a:</p>
    <ul>
      <li><strong>Acceso:</strong> Consultar qué datos tenemos sobre ti</li>
      <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
      <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos (salvo obligación legal)</li>
      <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento</li>
      <li><strong>Portabilidad:</strong> Obtener copia de tus datos en formato estructurado</li>
      <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
    </ul>
    <p>Para ejercer estos derechos, contacta con tu reumatólogo o directamente en: <strong>[d.castrocorredor@gmail.com]</strong></p>
    <p><strong>Derecho de reclamación:</strong> Puedes presentar una reclamación ante la <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">Agencia Española de Protección de Datos (AEPD)</a>, C/ Jorge Juan 6, 28001 Madrid.</p>

    <h2>8. Conservación de datos</h2>
    <p>Tus datos se conservarán mientras dure tu relación asistencial y posteriormente durante el plazo de la normativa sanitaria vigente (mínimo 5 años desde la última asistencia, Ley 41/2002). Si solicitas la supresión de tu cuenta, los datos clínicos podrán conservarse anonimizados.</p>

    <h2>9. Consentimiento</h2>
    <p>Al registrarte consientes expresamente el tratamiento de tus datos de salud. Puedes retirar tu consentimiento en cualquier momento en <strong>[d.castrocorredor@gmail.com]</strong>, sin que ello afecte a la licitud del tratamiento previo.</p>

    <h2>10. Modificaciones</h2>
    <p>ReumaCal se reserva el derecho de modificar esta Política de Privacidad. En caso de cambios sustanciales, se notificará a los usuarios a través de la aplicación.</p>

    <footer style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px', color: '#666', fontSize: '14px' }}>
      <p>© {new Date().getFullYear()} ReumaCal (@reumacastro). Todos los derechos reservados.</p>
    </footer>
  </div>
);

const AvisoLegalPage = ({ onBack }) => (
  <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#333', lineHeight: '1.7' }}>
    <button onClick={() => onBack()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', color: '#4f46e5' }}>← Volver</button>
    <h1>⚖️ Aviso Legal</h1>
    <p style={{ color: '#666' }}>Última actualización: febrero 2026</p>

    {/* ⚠️ CAMBIA LOS DATOS ENTRE CORCHETES POR LOS TUYOS */}

    <h2>1. Datos identificativos del titular</h2>
    <p>En cumplimiento del artículo 10 de la Ley 34/2002 (LSSI-CE):</p>
    <ul>
      <li><strong>Titular:</strong> [David Castro Corredor]</li>
      <li><strong>Domicilio:</strong> [Avda. de los Reyes Católicos 5A, 13005 Ciudad Real]</li>
      <li><strong>Email:</strong> [d.castrocorredor@gmail.com]</li>
      <li><strong>Sitio web:</strong> www.reumacal.com</li>
    </ul>

    <h2>2. Objeto y ámbito de aplicación</h2>
    <p>ReumaCal es una plataforma web de apoyo clínico con calculadoras reumatológicas para el seguimiento de enfermedades reumáticas. Está dirigida a profesionales sanitarios y sus pacientes. <strong>No sustituye en ningún caso el criterio médico profesional.</strong></p>

    <h2>3. Condiciones de uso</h2>
    <p>El usuario se compromete a:</p>
    <ul>
      <li>Hacer un uso adecuado y lícito del sitio web</li>
      <li>No utilizar la plataforma para fines distintos del apoyo clínico reumatológico</li>
      <li>No intentar acceder a datos de otros usuarios o centros hospitalarios</li>
      <li>No introducir datos falsos o de terceros sin su consentimiento</li>
      <li>No realizar acciones que puedan dañar o sobrecargar el sitio web</li>
    </ul>

    <h2>4. Exención de responsabilidad</h2>
    <p><strong>Uso clínico:</strong> Los resultados de las calculadoras tienen carácter orientativo y <strong>no constituyen un diagnóstico médico ni una recomendación terapéutica</strong>. Las decisiones clínicas deben ser tomadas por un profesional sanitario cualificado.</p>
    <p><strong>Disponibilidad:</strong> No se garantiza la disponibilidad continua e ininterrumpida del sitio web.</p>

    <h2>5. Propiedad intelectual e industrial</h2>
    <p>Todos los contenidos del sitio web (textos, diseño gráfico, código fuente, logotipos, marcas, algoritmos de cálculo y estructura de la base de datos) son propiedad del titular y están protegidos por las leyes de propiedad intelectual e industrial.</p>
    <p>La marca «ReumaCal» es propiedad del titular. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.</p>

    <h2>6. Protección de datos</h2>
    <p>El tratamiento de datos personales se rige por nuestra <span style={{ color: '#4f46e5', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onBack('politica-privacidad')}>Política de Privacidad</span>. ReumaCal cumple con el RGPD (UE) 2016/679 y la LOPDGDD (LO 3/2018).</p>

    <h2>7. Legislación aplicable y jurisdicción</h2>
    <p>Este Aviso Legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de [Ciudad Real].</p>

    <h2>8. Modificaciones</h2>
    <p>El titular se reserva el derecho a modificar este Aviso Legal en cualquier momento.</p>

    <footer style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px', color: '#666', fontSize: '14px' }}>
      <p>© {new Date().getFullYear()} ReumaCal (@reumacastro). Todos los derechos reservados.</p>
    </footer>
  </div>
);

const PoliticaCookiesPage = ({ onBack }) => (
  <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#333', lineHeight: '1.7' }}>
    <button onClick={() => onBack()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', color: '#4f46e5' }}>← Volver</button>
    <h1>🍪 Política de Cookies</h1>
    <p style={{ color: '#666' }}>Última actualización: febrero 2026</p>

    <h2>1. ¿Qué son las cookies?</h2>
    <p>Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo cuando los visitas. Sirven para recordar tu sesión de usuario y tus preferencias.</p>

    <h2>2. Cookies que utiliza ReumaCal</h2>
    <h3>Cookies estrictamente necesarias (técnicas)</h3>
    <p>Son imprescindibles para el funcionamiento de la aplicación y no requieren tu consentimiento.</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', fontSize: '14px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f5f5f5' }}>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Cookie</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Proveedor</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Finalidad</th>
          <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Duración</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>sb-*-auth-token</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Supabase</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Autenticación y sesión del usuario</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Sesión / 1 año</td>
        </tr>
        <tr>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>sb-*-auth-token-code-verifier</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Supabase</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Verificación de autenticación (PKCE)</td>
          <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>Sesión</td>
        </tr>
      </tbody>
    </table>

    <h2>3. ¿Cómo gestionar las cookies?</h2>
    <p>Puedes configurar tu navegador para aceptar o rechazar cookies. Si desactivas las cookies técnicas, es posible que no puedas iniciar sesión.</p>
    <ul>
      <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
      <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
      <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
      <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
    </ul>

    <h2>4. Base legal</h2>
    <p>La utilización de cookies se rige por el artículo 22.2 de la Ley 34/2002 (LSSI-CE) y la Guía de uso de cookies de la AEPD. Las cookies estrictamente necesarias no requieren consentimiento.</p>

    <h2>5. Contacto</h2>
    <p>Si tienes dudas: <strong>[d.castrocorredor@gmail.com]</strong></p>

    <footer style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px', color: '#666', fontSize: '14px' }}>
      <p>© {new Date().getFullYear()} ReumaCal (@reumacastro). Todos los derechos reservados.</p>
    </footer>
  </div>
);

// ============================================
// MAIN APP
// ============================================

export default function App() {
  const [page, setPage] = useState('landing');
  const navigateToPage = (newPage) => {
    setPage(newPage);
    window.history.pushState({ page: newPage }, '', `#${newPage}`);
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setPage(event.state.page);
        
        // Limpiar sesión si vuelves a landing o auth
        if (event.state.page === 'landing' || event.state.page === 'auth') {
          setCurrentUser(null);
          setCurrentPatient(null);
        }
      } else {
        const hash = window.location.hash.substring(1);
        const basePage = hash.split('?')[0]; // Extraer la página sin query params
        
        if (basePage && ['landing', 'auth', 'patient-dashboard', 'doctor-dashboard', 'forgot-password', 'reset-password', 'politica-privacidad', 'aviso-legal', 'politica-cookies'].includes(basePage)) {
          setPage(basePage);
          
          // Limpiar sesión si vuelves a landing o auth
          if (basePage === 'landing' || basePage === 'auth') {
            setCurrentUser(null);
            setCurrentPatient(null);
          }
        } else {
          setPage('landing');
          setCurrentUser(null);
          setCurrentPatient(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
      const basePage = initialHash.split('?')[0];
      window.history.replaceState({ page: basePage }, '', `#${initialHash}`);
    } else {
      window.history.replaceState({ page: 'landing' }, '', '#landing');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [authRole, setAuthRole] = useState(null);
  const [resetEmail, setResetEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  
  const handleNavigate = (newPage, role = null) => {
    navigateToPage(newPage);
    if (role) {
      if (role === 'forgot-password') {
        navigateToPage('forgot-password');
      } else if (role === 'reset-password') {
        setResetEmail(newPage); // newPage contiene el email
        navigateToPage('reset-password');
      } else {
        setAuthRole(role);
      }
    }
  };
  
  const handleLogin = (user, patient) => {
    setCurrentUser(user);
    setCurrentPatient(patient);
    setTimeout(() => {
      navigateToPage(user.role === 'PATIENT' ? 'patient-dashboard' : 'doctor-dashboard');
    }, 50);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPatient(null);
    navigateToPage('landing');
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
        .brand.small { font-size: 1.5rem; opacity: 1; }
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
          z-index: 10;
          margin-bottom: 2rem;
        }
        .landing-hero { margin-bottom: 3rem; }
        .logo-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          margin-top: 2rem;
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
          flex-direction: column;
          align-items: center;
          gap: 0;
          width: 100%;
          max-width: 900px;
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
        
        .btn-delete-score {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-delete-score:hover {
          background: #fecaca;
          border-color: #dc2626;
        }
        
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
        
        /* Estilos para radio buttons */
        input[type="radio"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--primary);
        }
        
        input[type="radio"]:checked + span {
          font-weight: 600;
          color: var(--primary);
        }
        
        label:has(input[type="radio"]) {
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: background-color 0.2s;
        }
        
        label:has(input[type="radio"]:checked) {
          background-color: #e0f2fe;
        }
        
        label:has(input[type="radio"]) span {
          user-select: none;
          font-size: 1rem;
          color: var(--text);
          text-decoration: none !important;
        }
      `}</style>
      
      {page === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {page === 'auth' && <AuthPage role={authRole} onLogin={handleLogin} onBack={handleNavigate} />}
      {page === 'forgot-password' && <ForgotPasswordPage onBack={(action, email) => {
        if (action === 'reset-password') {
          setResetEmail(email);
          setPage('reset-password');
        } else {
          setPage('landing');
        }
      }} />}
      {page === 'reset-password' && <ResetPasswordPage email={resetEmail} onBack={() => setPage('landing')} onSuccess={() => setPage('landing')} />}
      {page === 'patient-dashboard' && currentUser && currentPatient && (
        <PatientDashboard user={currentUser} patient={currentPatient} onLogout={handleLogout} />
      )}
      {page === 'doctor-dashboard' && currentUser && (
        <DoctorDashboard user={currentUser} onLogout={handleLogout} />
      )}
      {page === 'politica-privacidad' && <PoliticaPrivacidadPage onBack={() => setPage('landing')} />}
      {page === 'aviso-legal' && <AvisoLegalPage onBack={(dest) => dest ? setPage(dest) : setPage('landing')} />}
      {page === 'politica-cookies' && <PoliticaCookiesPage onBack={() => setPage('landing')} />}
    </>
  );
}