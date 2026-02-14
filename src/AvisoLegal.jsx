// =============================================================================
// AvisoLegal.jsx
// Página de Aviso Legal para ReumaCal (obligatorio LSSI-CE)
// Ruta sugerida: /aviso-legal
// =============================================================================

import React from 'react';

const AvisoLegal = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>⚖️ Aviso Legal</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Última actualización: febrero 2026</p>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>1. Datos identificativos del titular</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
          Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa a los
          usuarios de los siguientes datos:
        </p>
        <ul>
          <li><strong>Titular:</strong> [David Castro Corredor]</li>
          <li><strong>Domicilio:</strong> [Avda. de los Reyes Católicos 5A, 13005 Ciudad Real]</li>
          <li><strong>Correo electrónico:</strong> [d.castrocorredor@gmail.com]</li>
          <li><strong>Sitio web:</strong> www.reumacal.com</li>
          {/* Si estás colegiado o registrado en algún registro profesional, añade: */}
          {/* <li><strong>Colegio profesional:</strong> [Nombre del colegio]</li> */}
          {/* <li><strong>Nº de colegiado:</strong> [Número]</li> */}
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>2. Objeto y ámbito de aplicación</h2>
        <p>
          ReumaCal (www.reumacal.com) es una plataforma web de apoyo clínico que proporciona
          calculadoras reumatológicas para el seguimiento de enfermedades reumáticas. La plataforma
          está dirigida a profesionales sanitarios (reumatólogos) y a sus pacientes, y su uso está
          destinado exclusivamente como herramienta de apoyo clínico, sin sustituir en ningún caso
          el criterio médico profesional.
        </p>
        <p>
          El acceso y uso de este sitio web atribuye la condición de usuario e implica la
          aceptación plena de todas las condiciones incluidas en este Aviso Legal. Si no estás
          de acuerdo con alguna de estas condiciones, no debes usar este sitio web.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>3. Condiciones de uso</h2>
        <p>El usuario se compromete a:</p>
        <ul>
          <li>Hacer un uso adecuado y lícito del sitio web, de conformidad con la legislación aplicable</li>
          <li>No utilizar la plataforma para fines distintos de los previstos (apoyo clínico reumatológico)</li>
          <li>No intentar acceder a datos de otros usuarios o centros hospitalarios</li>
          <li>No introducir datos falsos o de terceros sin su consentimiento</li>
          <li>No realizar acciones que puedan dañar, inutilizar o sobrecargar el sitio web</li>
        </ul>
        <p>
          El titular se reserva el derecho a retirar el acceso al sitio web a cualquier usuario
          que incumpla estas condiciones, sin necesidad de preaviso.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>4. Exención de responsabilidad</h2>
        <p>
          <strong>Uso clínico:</strong> ReumaCal es una herramienta de apoyo al cálculo de índices
          reumatológicos estandarizados. Los resultados proporcionados por las calculadoras tienen
          carácter orientativo y <strong>no constituyen un diagnóstico médico ni una recomendación
          terapéutica</strong>. Las decisiones clínicas deben ser tomadas siempre por un profesional
          sanitario cualificado.
        </p>
        <p>
          <strong>Disponibilidad del servicio:</strong> El titular no garantiza la disponibilidad
          continua e ininterrumpida del sitio web, pudiendo realizarse tareas de mantenimiento,
          actualización o mejora que requieran la suspensión temporal del servicio.
        </p>
        <p>
          <strong>Enlaces externos:</strong> En caso de que el sitio web contenga enlaces a sitios
          web de terceros, el titular no asume responsabilidad alguna sobre el contenido, la
          política de privacidad o las prácticas de dichos sitios.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>5. Propiedad intelectual e industrial</h2>
        <p>
          Todos los contenidos del sitio web, incluyendo a título enunciativo pero no limitativo:
          textos, imágenes, diseño gráfico, código fuente, logotipos, marcas, nombres comerciales,
          algoritmos de cálculo y estructura de la base de datos, son propiedad del titular o
          cuenta con las licencias necesarias para su uso, y están protegidos por las leyes
          españolas e internacionales de propiedad intelectual e industrial.
        </p>
        <p>
          La marca «ReumaCal» es propiedad del titular. Queda prohibida su reproducción,
          distribución, comunicación pública o transformación sin autorización expresa.
        </p>
        <p>
          Queda prohibida la reproducción total o parcial de los contenidos de este sitio web
          sin la autorización expresa y por escrito del titular.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>6. Protección de datos</h2>
        <p>
          El tratamiento de datos personales se rige por nuestra{' '}
          <a href="/politica-privacidad">Política de Privacidad</a>, que forma parte integrante
          de este Aviso Legal. ReumaCal cumple con el Reglamento (UE) 2016/679 (RGPD) y la
          Ley Orgánica 3/2018 (LOPDGDD).
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>7. Legislación aplicable y jurisdicción</h2>
        <p>
          El presente Aviso Legal se rige por la legislación española. Para cualquier controversia
          que pudiera derivarse del acceso o uso de este sitio web, las partes se someten a los
          Juzgados y Tribunales de [tu ciudad], con renuncia expresa a cualquier otro fuero que
          pudiera corresponderles.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>8. Modificaciones</h2>
        <p>
          El titular se reserva el derecho a modificar el presente Aviso Legal en cualquier momento,
          siendo vigente la última versión publicada en este sitio web.
        </p>
      </section>

      <footer style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px', color: '#666', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} ReumaCal (@reumacastro). Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default AvisoLegal;
