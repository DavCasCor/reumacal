// =============================================================================
// PoliticaPrivacidad.jsx
// Página de Política de Privacidad para ReumaCal
// Ruta sugerida: /politica-privacidad
// =============================================================================

import React from 'react';

const PoliticaPrivacidad = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>🔒 Política de Privacidad</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Última actualización: febrero 2026</p>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>1. Identificación del responsable y del encargado del tratamiento</h2>
        <p>
          <strong>Encargado del tratamiento (proveedor de la plataforma):</strong>
        </p>
        <ul>
          <li>Plataforma: <strong>ReumaCal</strong> (@reumacastro)</li>
          <li>Titular: [David Castro Corredor]</li>
          <li>Domicilio: [Avda. de los Reyes Católicos 5A, 13005 Ciudad Real]</li>
          <li>Email de contacto: [d.castrocorredor@gmail.com]</li>
        </ul>
        <p>
          <strong>Responsable del tratamiento:</strong>
        </p>
        <p>
          ReumaCal actúa como <strong>encargado del tratamiento</strong> conforme al artículo 28 del RGPD.
          El responsable del tratamiento de los datos de cada paciente es el <strong>centro hospitalario
          o servicio de reumatología</strong> al que pertenece el profesional sanitario que utiliza esta
          herramienta como apoyo clínico. Cada centro hospitalario determina los fines y medios
          del tratamiento de los datos de sus pacientes.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>2. Datos personales que se recopilan</h2>
        <p>A través de esta aplicación se recopilan los siguientes datos:</p>
        <p><strong>Datos de identificación:</strong></p>
        <ul>
          <li>Dirección de correo electrónico</li>
          <li>Nombre y apellidos</li>
          <li>NHC (Número de Historia Clínica)</li>
          <li>Centro hospitalario al que perteneces</li>
        </ul>
        <p><strong>Datos de salud (categoría especial, art. 9 RGPD):</strong></p>
        <ul>
          <li>Resultados de calculadoras reumatológicas (BASDAI, ASDAS, DAS28, SLEDAI, HAQ, SF-36, etc.)</li>
          <li>Fechas de realización de evaluaciones</li>
          <li>Histórico de puntuaciones y evolución clínica</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>3. Finalidad del tratamiento</h2>
        <p>Tus datos serán utilizados exclusivamente para:</p>
        <ul>
          <li>Seguimiento clínico de tu enfermedad reumatológica</li>
          <li>Evaluación de la actividad de tu enfermedad</li>
          <li>Monitorización de tu calidad de vida y respuesta al tratamiento</li>
          <li>Apoyo en la toma de decisiones terapéuticas por parte de tu reumatólogo</li>
        </ul>
        <p>
          En ningún caso tus datos serán utilizados con fines comerciales, publicitarios ni
          serán cedidos a terceros ajenos a tu atención sanitaria.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>4. Base legal del tratamiento</h2>
        <p>El tratamiento de tus datos se fundamenta en las siguientes bases legales:</p>
        <ul>
          <li>
            <strong>Consentimiento explícito (art. 6.1.a y art. 9.2.a RGPD):</strong> Al registrarte
            y aceptar estas condiciones, otorgas tu consentimiento explícito para el tratamiento
            de tus datos de salud.
          </li>
          <li>
            <strong>Interés vital y fines asistenciales (art. 9.2.h RGPD):</strong> El tratamiento
            es necesario para fines de medicina preventiva, diagnóstico médico, prestación de
            asistencia sanitaria y gestión de sistemas y servicios de asistencia sanitaria.
          </li>
          <li>
            <strong>Obligación legal (art. 6.1.c RGPD):</strong> La conservación de datos clínicos
            conforme a la Ley 41/2002, de 14 de noviembre, reguladora de la autonomía del paciente
            y de derechos y obligaciones en materia de información y documentación clínica.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>5. Almacenamiento y seguridad</h2>
        <p>
          Tus datos se almacenan de forma segura en servidores de <strong>Supabase</strong> (infraestructura
          cloud certificada) ubicados en la <strong>Unión Europea</strong>. No se realizan transferencias
          internacionales de datos fuera del Espacio Económico Europeo (EEE).
        </p>
        <p>Las medidas de seguridad implementadas incluyen:</p>
        <ul>
          <li>Cifrado de datos en tránsito (HTTPS/TLS) y en reposo</li>
          <li>Autenticación segura mediante Supabase Auth</li>
          <li>Compartimentación de datos por centro hospitalario (Row Level Security)</li>
          <li>Acceso restringido según rol (reumatólogo / paciente)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>6. Acceso a los datos</h2>
        <p>Únicamente tendrán acceso a tus datos:</p>
        <ul>
          <li>Tu médico reumatólogo responsable de tu atención</li>
          <li>Otros reumatólogos del mismo centro hospitalario (solo si tu médico lo autoriza)</li>
          <li>Tú mismo, como paciente, a tus propios datos</li>
        </ul>
        <p>
          Los datos están compartimentados por hospital. Un profesional de otro centro
          hospitalario no puede acceder a tus datos.
        </p>
        <p>
          <strong>Subencargados del tratamiento:</strong> ReumaCal utiliza Supabase Inc. como
          proveedor de infraestructura cloud para el almacenamiento de datos. Supabase actúa
          como subencargado del tratamiento conforme a su{' '}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            política de privacidad
          </a>{' '}
          y con servidores en la UE.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>7. Tus derechos (RGPD)</h2>
        <p>
          Conforme al Reglamento General de Protección de Datos (UE) 2016/679 y a la
          Ley Orgánica 3/2018 (LOPDGDD), tienes derecho a:
        </p>
        <ul>
          <li><strong>Acceso:</strong> Consultar qué datos personales tenemos sobre ti</li>
          <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
          <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos (salvo obligación legal de conservación)</li>
          <li><strong>Limitación:</strong> Solicitar la limitación del tratamiento de tus datos</li>
          <li><strong>Portabilidad:</strong> Obtener copia de tus datos en formato estructurado y legible por máquina</li>
          <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
        </ul>
        <p>
          Para ejercer estos derechos, puedes contactar con:
        </p>
        <ul>
          <li>Tu reumatólogo o el servicio de atención al paciente de tu hospital (como responsable del tratamiento)</li>
          <li>ReumaCal directamente en: <strong>[tu-email@ejemplo.com]</strong></li>
        </ul>
        <p>
          <strong>Derecho de reclamación:</strong> Si consideras que tus derechos no han sido
          debidamente atendidos, tienes derecho a presentar una reclamación ante la{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
            Agencia Española de Protección de Datos (AEPD)
          </a>
          , C/ Jorge Juan 6, 28001 Madrid.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>8. Conservación de datos</h2>
        <p>
          Tus datos se conservarán mientras dure tu relación asistencial con el servicio de
          reumatología y, posteriormente, durante el plazo establecido por la normativa sanitaria
          vigente (mínimo 5 años desde la última asistencia, conforme a la Ley 41/2002).
        </p>
        <p>
          Los datos de cuenta (email) se conservarán mientras mantengas tu cuenta activa.
          Si solicitas la supresión de tu cuenta, tus datos de identificación serán eliminados,
          si bien los datos clínicos podrán conservarse anonimizados conforme a las obligaciones
          legales sanitarias.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>9. Consentimiento</h2>
        <p>
          Al registrarte y aceptar estas condiciones, consientes expresamente el tratamiento
          de tus datos de salud para las finalidades descritas en esta política. Puedes retirar
          tu consentimiento en cualquier momento contactando a <strong>[tu-email@ejemplo.com]</strong>,
          lo que implicará la imposibilidad de seguir utilizando esta herramienta para tu
          seguimiento clínico, sin que ello afecte a la licitud del tratamiento previo a la retirada.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>10. Modificaciones</h2>
        <p>
          ReumaCal se reserva el derecho de modificar esta Política de Privacidad para adaptarla
          a novedades legislativas o jurisprudenciales. En caso de cambios sustanciales, se
          notificará a los usuarios a través de la aplicación.
        </p>
      </section>

      <footer style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px', color: '#666', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} ReumaCal (@reumacastro). Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default PoliticaPrivacidad;
