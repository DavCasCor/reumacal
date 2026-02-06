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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// ============================================
// SUPABASE STORAGE FUNCTIONS
// ============================================

const Storage = {
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) { console.error('Error getting users:', error); return []; }
    return data || [];
  },
  
  async createUser(user) {
    const { data, error } = await supabase.from('users').insert([user]).select();
    if (error) { console.error('Error creating user:', error); return null; }
    return data?.[0] || null;
  },
  
  async getUserByEmailAndPassword(email, passwordHash) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();
    if (error) return null;
    return data;
  },
  
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return null;
    return data;
  },
  
  async getPatientByUserId(userId) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data;
  },
  
  async getPatientByNhc(nhc) {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('nhc', nhc)
      .single();
    if (error) return null;
    return data;
  },
  
  async createPatient(patient) {
    const { data, error } = await supabase.from('patients').insert([patient]).select();
    if (error) { console.error('Error creating patient:', error); return null; }
    return data?.[0] || null;
  },
  
  async getScoresByPatientId(patientId) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) { console.error('Error getting scores:', error); return []; }
    return data || [];
  },
  
  async createScore(score) {
    const { data, error } = await supabase.from('scores').insert([score]).select();
    if (error) { console.error('Error creating score:', error); return null; }
    return data?.[0] || null;
  },
  
  async createAccessLog(log) {
    const { data, error } = await supabase.from('access_logs').insert([log]).select();
    if (error) { console.error('Error creating log:', error); return null; }
    return data?.[0] || null;
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        // Login
        const user = await Storage.getUserByEmailAndPassword(email, hashPassword(password));
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
          patient = await Storage.getPatientByUserId(user.id);
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
        
        if (role === 'patient' && !nhc) {
          setError('El NHC es obligatorio');
          setLoading(false);
          return;
        }
        
        if (role === 'patient') {
          const existingPatient = await Storage.getPatientByNhc(nhc);
          if (existingPatient) {
            setError('Este NHC ya está registrado');
            setLoading(false);
            return;
          }
        }
        
        const newUser = await Storage.createUser({
          email,
          password_hash: hashPassword(password),
          role: role === 'patient' ? 'PATIENT' : 'DOCTOR'
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
            display_name: displayName || null
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
    const instruments = ['BASDAI', 'ASDAS_CRP', 'ASDAS_ESR', 'DAPSA', 'DAS28_CRP', 'DAS28_ESR'];
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
              else interpretation = interpretDAS28(score.total_score);
              
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
  
  const searchPatient = async () => {
    setError('');
    setLoading(true);
    
    const patient = await Storage.getPatientByNhc(searchNhc);
    
    if (!patient) {
      setError('No se encontró ningún paciente con ese NHC');
      setSelectedPatient(null);
      setLoading(false);
      return;
    }
    
    // Log access
    await Storage.createAccessLog({
      doctor_id: user.id,
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
        {selectedPatient.display_name && <p className="patient-name">{selectedPatient.display_name}</p>}
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
