// =============================================================================
// PoliticaCookies.jsx
// Página de Política de Cookies para ReumaCal
// Ruta sugerida: /politica-cookies
// =============================================================================

import React from 'react';

const PoliticaCookies = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>🍪 Política de Cookies</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>Última actualización: febrero 2026</p>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>1. ¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en tu dispositivo
          (ordenador, tablet o móvil) cuando los visitas. Sirven para que el sitio web recuerde
          información sobre tu visita, como tu sesión de usuario o tus preferencias, lo que facilita
          tu próxima visita y hace que el sitio te resulte más útil.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>2. ¿Qué cookies utiliza ReumaCal?</h2>

        <h3 style={{ fontSize: '17px', marginTop: '20px', color: '#2d2d44' }}>
          Cookies estrictamente necesarias (técnicas)
        </h3>
        <p>
          Estas cookies son imprescindibles para el funcionamiento de la aplicación y no requieren
          tu consentimiento. Sin ellas, el sitio web no puede funcionar correctamente.
        </p>
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
            {/* Añade aquí más cookies si usas alguna adicional */}
          </tbody>
        </table>

      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>3. ¿Cómo gestionar las cookies?</h2>
        <p>
          Puedes configurar tu navegador para aceptar o rechazar cookies, o para que te avise
          cuando un sitio web intente instalar una cookie. Ten en cuenta que si desactivas las
          cookies estrictamente necesarias, es posible que no puedas acceder a algunas funciones
          de la plataforma (como el inicio de sesión).
        </p>
        <p>A continuación, te indicamos cómo gestionar las cookies en los principales navegadores:</p>
        <ul>
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
              Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
              Microsoft Edge
            </a>
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>4. Base legal</h2>
        <p>
          La utilización de cookies en este sitio web se rige por el artículo 22.2 de la
          Ley 34/2002 (LSSI-CE), las Directrices sobre cookies y técnicas de rastreo del
          Comité Europeo de Protección de Datos, y la Guía de uso de cookies de la AEPD.
        </p>
        <p>
          Las cookies estrictamente necesarias no requieren consentimiento. Para cualquier
          otro tipo de cookies, se solicitará tu consentimiento previo antes de su instalación.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#1a1a2e' }}>5. Contacto</h2>
        <p>
          Si tienes dudas sobre nuestra política de cookies, puedes contactarnos en:{' '}
          <strong>[tu-email@ejemplo.com]</strong>.
        </p>
      </section>

      <footer style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '40px', color: '#666', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} ReumaCal (@reumacastro). Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default PoliticaCookies;
