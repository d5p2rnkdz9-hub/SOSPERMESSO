/**
 * Template for permit detail pages (permesso-*.html)
 * Generates static HTML from structured Notion Q&A content
 */

const { escapeHtml, linkToDizionario } = require('./helpers.js');

/**
 * Get border color based on section index or question keywords
 * @param {number} index - Section index (0-based)
 * @param {string} question - The section question text
 * @returns {string} CSS color variable or empty string
 */
function getSectionBorderColor(index, question) {
  const q = question.toLowerCase();

  // Match by keywords first
  if (q.includes("cos'è") || q.includes("che cos'è") || q.includes("che cosa")) {
    return 'var(--accent-blue)';
  }
  if (q.includes('requisiti') || q.includes('chi può') || q.includes('chi puo')) {
    return 'var(--taxi-yellow)';
  }
  if (q.includes('lavorare') || q.includes('lavoro') || q.includes('diritti')) {
    return 'var(--lighthouse-red)';
  }
  if (q.includes('conversione') || q.includes('convertire')) {
    return 'var(--accent-teal)';
  }
  if (q.includes('durata') || q.includes('quanto dura')) {
    return 'var(--accent-blue)';
  }
  if (q.includes('costi') || q.includes('quanto costa')) {
    return 'var(--accent-orange)';
  }

  // Fallback by index for variety
  const colors = [
    'var(--accent-blue)',
    'var(--taxi-yellow)',
    'var(--lighthouse-red)',
    'var(--accent-teal)',
    'var(--accent-purple)',
    'var(--accent-orange)'
  ];
  return colors[index % colors.length];
}

/**
 * Render a single Q&A section as a card
 * @param {Object} section - Section data
 * @param {string} section.question - The question/title
 * @param {string} section.content - HTML content (already sanitized)
 * @param {number} index - Section index for styling
 * @returns {string} HTML string for the section card
 */
function renderSection(section, index) {
  const { question, content } = section;
  const borderColor = getSectionBorderColor(index, question);
  const borderStyle = borderColor ? `border-left: 4px solid ${borderColor};` : '';

  return `
      <!-- Section ${index + 1}: ${escapeHtml(question)} -->
      <div class="card" style="margin-bottom: 2rem;${borderStyle ? ' ' + borderStyle : ''}">
        <h2>${escapeHtml(question)}</h2>
        ${content}
      </div>`;
}

/**
 * Generate a complete permit detail page
 * @param {Object} permit - Permit data from Notion
 * @param {string} permit.tipo - Permit type name (e.g., "Studio")
 * @param {string} permit.slug - URL slug (e.g., "studio")
 * @param {string} permit.emoji - Emoji icon (e.g., "📖")
 * @param {string} permit.subtitle - Brief description
 * @param {Array<Object>} permit.sections - Array of {question, content} pairs
 * @returns {string} Complete HTML page
 */
function generatePermessoPage(permit) {
  const { tipo, slug, emoji, subtitle, sections } = permit;

  const escapedTipo = escapeHtml(tipo);
  const escapedSubtitle = escapeHtml(subtitle || '');
  const pageEmoji = emoji || '📄';

  // Generate content sections
  const sectionsHtml = sections.map((section, index) =>
    renderSection(section, index)
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Permesso di soggiorno per ${escapedTipo} - informazioni, requisiti, documenti e procedure">
  <title>Permesso per ${escapedTipo} - SOS Permesso</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../../images/logo-full.png">
  <link rel="shortcut icon" type="image/png" href="../../images/logo-full.png">
  <link rel="apple-touch-icon" href="../../images/logo-full.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../styles/main.css">
  <link rel="stylesheet" href="../styles/components.css">
  <link rel="stylesheet" href="../styles/animations.css">
  <link rel="stylesheet" href="../styles/mobile.css">
  <link rel="stylesheet" href="../styles/mobile-fix.css">
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <a href="../../index.html" class="logo">
          <img src="../../images/logo-full.png" alt="SOS Permesso" class="logo-image">
        </a>
        <button class="menu-toggle" id="menu-toggle">☰</button>

        <div class="nav-wrapper">
          <ul class="nav-menu" id="nav-menu">
            <!-- Database with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#database" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="database.html" class="dropdown-link" role="menuitem">Database di permessi</a></li>
                <li role="none"><a href="documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
              </ul>
            </li>

            <!-- Guide with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#guide" class="nav-link" aria-haspopup="true" aria-expanded="false">Guide</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="protezione-internazionale.html" class="dropdown-link" role="menuitem">Protezione internazionale</a></li>
                <li role="none"><a href="permesso-ricongiungimento-familiare.html" class="dropdown-link" role="menuitem">Ricongiungimento familiare</a></li>
                <li role="none"><a href="dizionario.html" class="dropdown-link" role="menuitem">Dizionario</a></li>
              </ul>
            </li>

            <!-- Test with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#test" class="nav-link" aria-haspopup="true" aria-expanded="false">Test</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="https://form.typeform.com/to/kt7P9Ejk" class="dropdown-link" role="menuitem" target="_blank">Posso AVERE un permesso?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/oc9jhdkJ" class="dropdown-link" role="menuitem" target="_blank">Posso CONVERTIRE?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/R7HY8nBp" class="dropdown-link" role="menuitem" target="_blank">Posso RINNOVARE il permesso?</a></li>
              </ul>
            </li>

            <!-- Collabora with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#collabora" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="https://form.typeform.com/to/FsqvzdXI" class="dropdown-link" role="menuitem" target="_blank">Segnala un errore</a></li>
                <li role="none"><a href="https://form.typeform.com/to/USx16QN3" class="dropdown-link" role="menuitem" target="_blank">Dai una mano</a></li>
                <li role="none"><a href="chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>
              </ul>
            </li>
          </ul>

          <div class="language-switcher">
            <button class="language-button" id="language-toggle">
              <span id="current-language">IT</span>
              <span>▾</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <!-- BREADCRUMB -->
  <section class="section" style="padding: 1rem 0;">
    <div class="container" style="position: relative;">
      <div style="font-size: 0.875rem; color: var(--gray-medium);">
        <a href="../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
        <a href="database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
        <span>Permesso per ${escapedTipo}</span>
      </div>

      <!-- ERROR BUTTON -->
      <a href="https://form.typeform.com/to/FsqvzdXI#page_url=${encodeURIComponent('https://sospermesso.it/src/pages/permesso-' + slug + '.html')}"
         class="error-report-btn"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Segnala un errore in questa pagina">
        🚨 Segnala errore
      </a>
    </div>
  </section>

  <!-- PAGE HEADER -->
  <section class="section bg-off-white">
    <div class="container">
      <div class="page-header text-center">
        <span class="page-icon" style="font-size: 4rem;">${pageEmoji}</span>
        <h1 class="page-title">Permesso per ${escapedTipo}</h1>
        <p class="section-subtitle">${escapedSubtitle}</p>
      </div>
    </div>
  </section>

  <!-- DOCUMENT CTA -->
  <section class="section" style="padding: 1.5rem 0;">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        <a href="documenti-${slug}-primo.html" class="btn btn-primary">
          Documenti per il primo rilascio
        </a>
        <a href="documenti-${slug}-rinnovo.html" class="btn btn-rinnovo">
          Documenti per il rinnovo
        </a>
      </div>
    </div>
  </section>

  <!-- CONTENT -->
  <section class="section">
    <div class="container" style="max-width: 900px;">
${sectionsHtml}

      <!-- CTA -->
      <div class="alert alert-info">
        <span class="alert-icon">❓</span>
        <div>
          Hai altre domande sul permesso per ${escapedTipo}?
          <button onclick="openContactModal()" class="btn btn-primary btn-sm" style="margin-left: 0; margin-top: 0.5rem;">
            Scrivici
          </button>
        </div>
      </div>

    </div>
  </section>

  <!-- RELATED -->
  <section class="section bg-off-white">
    <div class="container">
      <h2 class="text-center mb-lg">Potrebbero interessarti anche</h2>
      <div class="grid grid-3">
        <a href="database.html" class="card card-link card-compact">
          <span class="card-icon">📚</span>
          <h3 class="card-title">Tutti i permessi</h3>
        </a>
        <a href="documenti-questura.html" class="card card-link card-compact">
          <span class="card-icon">📋</span>
          <h3 class="card-title">Documenti Questura</h3>
        </a>
        <a href="dizionario.html" class="card card-link card-compact">
          <span class="card-icon">📖</span>
          <h3 class="card-title">Dizionario</h3>
        </a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <a href="chi-siamo.html" class="footer-project-link">Il Progetto</a>
        <span class="footer-separator">|</span>
        <a href="https://form.typeform.com/to/USx16QN3" class="footer-project-link" target="_blank">Contatti</a>
        <span class="footer-separator">|</span>
        <p class="footer-copyright">© 2025 SOS Permesso</p>
      </div>
    </div>
  </footer>

  <!-- Contact Form Container -->
  <div id="contact-form-container"></div>

  <script src="../scripts/app.js"></script>
  <script src="../scripts/mobile.js"></script>
  <script>
    // Load contact form
    fetch('../components/contact-form.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contact-form-container').innerHTML = html;
      });
  </script>
</body>
</html>`;
}

module.exports = { generatePermessoPage };

// Self-test when run directly
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');

  const mockPermit = {
    tipo: 'Studio',
    slug: 'studio',
    emoji: '📖',
    subtitle: 'Per frequentare corsi universitari in Italia',
    sections: [
      {
        question: "Cos'è questo permesso?",
        content: '<p>Il permesso di soggiorno per studio permette di frequentare corsi universitari.</p>'
      },
      {
        question: 'Chi può chiederlo?',
        content: '<ul><li>Studenti con visto per studio</li><li>Iscritti a università italiana</li></ul>'
      },
      {
        question: 'Posso lavorare?',
        content: '<p><strong>Sì, con limiti:</strong> massimo 20 ore settimanali.</p>'
      },
      {
        question: 'Come si converte?',
        content: '<p>Dopo la laurea puoi convertire in permesso per lavoro o attesa occupazione.</p>'
      }
    ]
  };

  const html = generatePermessoPage(mockPermit);
  const outputPath = path.join(__dirname, '../../test-permesso-output.html');

  fs.writeFileSync(outputPath, html, 'utf8');
  console.log('Test page generated: ' + outputPath);
  console.log('Open in browser to verify structure and styling.');
}
