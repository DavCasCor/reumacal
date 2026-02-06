# 🩺 ReumaCal

**Calculadoras reumatológicas para facilitar tu consulta**

Por [@reumacastro](https://twitter.com/reumacastro)

## 📋 Características

- **BASDAI** - Bath Ankylosing Spondylitis Disease Activity Index
- **ASDAS** - Ankylosing Spondylitis Disease Activity Score (PCR y VSG)
- **DAPSA** - Disease Activity in Psoriatic Arthritis
- **DAS28** - Disease Activity Score 28 (PCR y VSG)

### Funcionalidades

✅ Registro/login para pacientes y reumatólogos  
✅ Cálculo automático con interpretación  
✅ Histórico de mediciones con gráficos  
✅ Panel de reumatólogo para consultar por NHC  
✅ Exportar/imprimir resultados  
✅ Diseño responsive (móvil perfecto)  

---

## 📄 Licencia

Desarrollado por @reumacastro para uso clínico.

---

## ⚠️ Aviso Legal

Esta herramienta es de carácter orientativo y no sustituye la valoración médica profesional. Los resultados deben ser interpretados por un profesional sanitario cualificado.


# 📘 Guía de Uso - Nuevas Calculadoras ReumaCal

## 🦋 SLEDAI - Lupus Activity

**Uso**: Medir actividad de lupus eritematoso sistémico

**Cómo completar**:
- Marcar solo los items presentes en las últimas 10 días
- Cada item tiene puntuación específica (1-8 puntos)

**Ejemplo de caso**:
```
Paciente mujer, 32 años, con brote lúpico:
✓ Artritis (4 pts)
✓ Rash malar (2 pts)
✓ Leucopenia (1 pt)
✓ Complemento bajo (2 pts)
= Total: 9 pts (Actividad moderada)
```

**Interpretación**:
- 0: Inactiva
- 1-5: Leve
- 6-10: Moderada
- 11-19: Alta
- ≥20: Muy alta

---

## 💚 LupusPRO v1.8 - Calidad de Vida Lupus

**Uso**: Evaluar impacto del lupus en calidad de vida

**Cómo completar**:
- 11 dominios diferentes
- Escala 0-4 en cada uno (0=Nunca, 4=Siempre)
- Ajustar sliders según frecuencia de problemas

**Ejemplo de caso**:
```
Paciente con lupus bien controlado:
- Síntomas lupus: 1.5 (poco frecuentes)
- Medicaciones: 2.0 (impacto moderado)
- Salud física: 1.5
- Dolor: 1.0
- Salud emocional: 2.0
- Cognición: 1.5
= Promedio: ~1.5 → Escala 0-100: ~38 (Buena CV)
```

**Interpretación**:
- 0-25: Muy buena calidad de vida
- 26-50: Buena
- 51-75: Moderada
- >75: Afectada

---

## 💪 FACIT-General - Calidad de Vida General

**Uso**: Evaluar calidad de vida en enfermedades crónicas

**Cómo completar**:
- 27 preguntas en 4 dominios
- Bienestar físico, social/familiar, emocional, funcional
- Escala 0-4 (0=Nada, 4=Muchísimo)
- **Nota**: Hay scroll para ver todas las preguntas

**Ejemplo de caso**:
```
Paciente con AR en remisión:
- Energía: 3, Náuseas: 0, Dolor: 1
- Apoyo familiar: 4, Amigos: 3
- Tristeza: 1, Nerviosismo: 2
- Disfrute vida: 3, Trabajo: 3
= Total: 65 pts (Buena calidad de vida)
```

**Interpretación**:
- ≥80: Muy buena
- 60-79: Buena
- 40-59: Moderada
- <40: Afectada

---

## 🏥 SF-36 - Encuesta de Salud

**Uso**: Medida genérica de calidad de vida relacionada con salud

**Cómo completar**:
- 8 dimensiones independientes
- Escala 0-100 en cada una
- Ajustar según estado actual

**Ejemplo de caso**:
```
Paciente con artritis controlada:
- Función física: 70 (limitación leve)
- Rol físico: 75
- Dolor corporal: 60
- Salud general: 65
- Vitalidad: 70
- Función social: 80
- Rol emocional: 85
- Salud mental: 75
= Promedio: 72.5 (Muy buena CV)
```

**Interpretación**:
- ≥75: Muy buena
- 50-74: Buena
- 25-49: Moderada
- <25: Afectada

---

## 🚶 BASFI - Función en Espondilitis

**Uso**: Medir limitación funcional en espondilitis anquilosante

**Cómo completar**:
- 10 actividades de vida diaria
- Escala 0-10 (0=Fácil, 10=Imposible)
- Pensar en la última semana

**Ejemplo de caso**:
```
Paciente con EA moderada:
1. Ponerse calcetines: 4
2. Agacharse: 5
3. Alcanzar estante: 3
4. Levantarse silla: 4
5. Levantarse suelo: 6
6. Estar de pie 10min: 4
7. Subir escaleras: 5
8. Mirar hombro: 6
9. Actividad física: 5
10. Día completo: 4
= Promedio: 4.6 (Limitación moderada)
```

**Interpretación**:
- <4: Buena función
- 4-6.9: Limitación moderada
- ≥7: Limitación importante

---

## 💡 ASAS-HI - Impacto en Salud Espondiloartritis

**Uso**: Medir impacto de espondiloartritis en salud

**Cómo completar**:
- 17 items sí/no
- Marcar solo si tiene dificultad actualmente
- Incluye dolor, función, participación

**Ejemplo de caso**:
```
Paciente con espondiloartritis activa:
✓ Dolor
✓ Estar de pie largo tiempo
✓ Subir escaleras
✓ Agacharse
✓ Alcanzar objetos altos
= 5 pts (Impacto bajo)
```

**Interpretación**:
- 0-5: Impacto bajo
- 6-11: Moderado
- ≥12: Alto

---

## 😊 ASQoL - Calidad de Vida EA

**Uso**: Evaluar impacto específico de espondilitis en calidad de vida

**Cómo completar**:
- 18 afirmaciones
- Marcar solo las que se aplican
- **Nota**: Hay scroll para ver todas

**Ejemplo de caso**:
```
Paciente con EA bien controlada:
✓ Rigidez es problema (ocasional)
✓ Me siento cansado a veces
✓ Evito contacto social (rara vez)
= 3 pts (Buena calidad de vida)
```

**Interpretación**:
- 0-6: Buena
- 7-12: Moderada
- ≥13: Afectada

---

## 🎯 PSAQoL - Calidad de Vida Artritis Psoriásica

**Uso**: Medir impacto de artritis psoriásica en calidad de vida

**Cómo completar**:
- 20 afirmaciones específicas de APs
- Marcar las que aplican
- **Nota**: Hay scroll para ver todas

**Ejemplo de caso**:
```
Paciente con APs activa:
✓ Siento frustración
✓ Cansancio frecuente
✓ Dificultad vestirme
✓ No puedo hacer lo que quiero
✓ Rigidez es problema
✓ Dificultad planificar
✓ Me preocupa apariencia
= 7 pts (Límite entre Buena/Moderada)
```

**Interpretación**:
- 0-7: Buena
- 8-14: Moderada
- ≥15: Afectada

---

## 💧 ESSPRI - Síntomas Sjögren

**Uso**: Evaluar síntomas principales en Síndrome de Sjögren

**Cómo completar**:
- Solo 3 síntomas principales
- Escala 0-10 cada uno
- Pensar en las últimas 2 semanas

**Ejemplo de caso**:
```
Paciente con Sjögren primario:
- Sequedad: 7.5 (importante)
- Fatiga: 6.0 (moderada-alta)
- Dolor: 4.0 (moderado)
= Promedio: 5.8 (Síntomas significativos)
```

**Interpretación**:
- <5: Síntomas aceptables
- ≥5: Síntomas significativos (considerar cambio tratamiento)

---

## 🔬 SSDAI - Actividad Sjögren (Vitali 2007)

**Uso**: Medir actividad de enfermedad en Sjögren

**Cómo completar**:
- 8 dominios (constitucional, glandular, articular, etc.)
- Cada item tiene puntuación específica
- Solo marcar manifestaciones activas
- **Nota**: Hay scroll para ver todos los dominios

**Ejemplo de caso**:
```
Paciente con Sjögren con afectación sistémica:
Constitucional:
✓ Fiebre (1 pt)

Glandular/Articular:
✓ Inflamación glandular (2 pts)
✓ Artralgia (2 pts)

Hematológico:
✓ Leucopenia (1 pt)
✓ Hipergammaglobulinemia (1 pt)

= Total: 7 pts (Actividad moderada)
```

**Interpretación**:
- 0: Inactiva
- 1-5: Baja
- 6-13: Moderada
- ≥14: Alta

**Puntuaciones por dominio**:
- Constitucional: 1-3 pts
- Glandular: 2 pts
- Articular: 2-4 pts
- Cutáneo: 3-6 pts
- Órgano mayor (pulmonar, renal, SNC, SNP): 6-9 pts
- Muscular: 6 pts
- Hematológico: 1-2 pts
- Inmunológico: 1-2 pts

---

## 💡 Consejos Generales

### Para todas las calculadoras:

1. **Tiempo de referencia**: Lee bien el periodo a evaluar
   - SLEDAI: últimos 10 días
   - ESSPRI: últimas 2 semanas
   - BASFI: última semana

2. **Honestidad**: Responde basándote en la situación real, no ideal

3. **Consistencia**: Usa los mismos criterios en seguimiento

4. **Guardado**: Siempre guarda los resultados para seguimiento

5. **Interpretación**: Los resultados son orientativos, no diagnósticos

### Navegación:

- **Sliders**: Arrastrar o hacer clic en la posición
- **Checkboxes**: Clic para marcar/desmarcar
- **Scroll**: En cuestionarios largos, scroll interno para ver todos los items
- **Guardar**: Botón al final tras calcular

### Histórico:

- Necesitas al menos 2 mediciones para ver gráficos
- Filtra por instrumento para ver evolución
- Los colores indican gravedad

---

## 🎓 Referencias Rápidas

### Valores de Corte Importantes:

| Calculadora | Remisión/Inactiva | Actividad Alta |
|-------------|-------------------|----------------|
| SLEDAI | 0 | ≥11 |
| ESSPRI | <5 | ≥5 |
| SSDAI | 0 | ≥14 |
| BASFI | <4 | ≥7 |
| ASAS-HI | 0-5 | ≥12 |

### Escalas de Medición:

- **0-10**: ESSPRI, BASFI
- **0-4**: LupusPRO, FACIT
- **0-100**: SF-36
- **Sí/No**: SLEDAI, ASAS-HI, ASQoL, PSAQoL, SSDAI (parcial)

---

**@reumacastro** - ReumaCal 2.0
