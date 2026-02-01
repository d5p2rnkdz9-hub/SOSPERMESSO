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
  // Fix common typo: "mi da" should be "mi dà" (with accent)
  const fixedQuestion = question.replace(/\bmi da\b/gi, 'mi dà');
  const borderColor = getSectionBorderColor(index, fixedQuestion);
  const borderStyle = borderColor ? `border-left: 4px solid ${borderColor};` : '';

  return `
      <!-- Section ${index + 1}: ${escapeHtml(fixedQuestion)} -->
      <div class="card" style="margin-bottom: 2rem;${borderStyle ? ' ' + borderStyle : ''}">
        <h2>${escapeHtml(fixedQuestion)}</h2>
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
              <a href="database.html" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="database.html" class="dropdown-link" role="menuitem">Tutti i permessi</a></li>
                <li role="none"><a href="documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
              </ul>
            </li>

            <!-- Guide with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="dizionario.html" class="nav-link" aria-haspopup="true" aria-expanded="false">Guide</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="protezione-internazionale.html" class="dropdown-link" role="menuitem">Protezione internazionale</a></li>
                <li role="none"><a href="permesso-ricongiungimento-familiare.html" class="dropdown-link" role="menuitem">Ricongiungimento familiare</a></li>
                <li role="none"><a href="dizionario.html" class="dropdown-link" role="menuitem">Dizionario</a></li>
              </ul>
            </li>

            <!-- Test with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="https://form.typeform.com/to/kt7P9Ejk" class="nav-link" aria-haspopup="true" aria-expanded="false" target="_blank">Test</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="https://form.typeform.com/to/kt7P9Ejk" class="dropdown-link" role="menuitem" target="_blank">Posso AVERE un permesso?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/oc9jhdkJ" class="dropdown-link" role="menuitem" target="_blank">Posso CONVERTIRE?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/R7HY8nBp" class="dropdown-link" role="menuitem" target="_blank">Posso RINNOVARE il permesso?</a></li>
              </ul>
            </li>

            <!-- Collabora with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="chi-siamo.html" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
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

/**
 * Generate a placeholder page for permits without Notion content
 * @param {Object} permit - Permit data
 * @param {string} permit.tipo - Permit type name
 * @param {string} permit.slug - URL slug
 * @param {string} permit.emoji - Emoji icon (optional)
 * @returns {string} Complete HTML page
 */
function generatePlaceholderPage(permit) {
  const { tipo, slug, emoji } = permit;
  const escapedTipo = escapeHtml(tipo || 'questo permesso');
  const pageEmoji = emoji || '📄';

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Permesso di soggiorno per ${escapedTipo} - pagina in costruzione">
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
              <a href="database.html" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="database.html" class="dropdown-link" role="menuitem">Tutti i permessi</a></li>
                <li role="none"><a href="documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
              </ul>
            </li>

            <!-- Guide with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="dizionario.html" class="nav-link" aria-haspopup="true" aria-expanded="false">Guide</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="protezione-internazionale.html" class="dropdown-link" role="menuitem">Protezione internazionale</a></li>
                <li role="none"><a href="permesso-ricongiungimento-familiare.html" class="dropdown-link" role="menuitem">Ricongiungimento familiare</a></li>
                <li role="none"><a href="dizionario.html" class="dropdown-link" role="menuitem">Dizionario</a></li>
              </ul>
            </li>

            <!-- Test with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="https://form.typeform.com/to/kt7P9Ejk" class="nav-link" aria-haspopup="true" aria-expanded="false" target="_blank">Test</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="https://form.typeform.com/to/kt7P9Ejk" class="dropdown-link" role="menuitem" target="_blank">Posso AVERE un permesso?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/oc9jhdkJ" class="dropdown-link" role="menuitem" target="_blank">Posso CONVERTIRE?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/R7HY8nBp" class="dropdown-link" role="menuitem" target="_blank">Posso RINNOVARE il permesso?</a></li>
              </ul>
            </li>

            <!-- Collabora with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="chi-siamo.html" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
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
      </div>
    </div>
  </section>

  <!-- PLACEHOLDER CONTENT -->
  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="card text-center" style="padding: 3rem;">
        <span style="font-size: 4rem;">${pageEmoji}</span>
        <h2 style="margin: 1rem 0;">Contenuto in arrivo</h2>
        <p style="color: var(--gray-medium); max-width: 500px; margin: 0 auto 1.5rem;">
          Stiamo ancora lavorando per completare le informazioni
          su questo permesso di soggiorno.
        </p>
        <a href="https://form.typeform.com/to/USx16QN3"
           class="btn btn-primary"
           target="_blank"
           rel="noopener noreferrer">
          Dai una mano
        </a>
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

/**
 * Generate a parent page for permit variants
 * Includes general info + links to specific variant pages
 * @param {Object} group - Variant group data
 * @param {string} group.baseName - Base permit name (e.g., "Lavoro subordinato")
 * @param {string} group.baseSlug - URL slug for the group
 * @param {Array<Object>} group.variants - Array of variant permit objects
 * @param {Array<Object>} generalSections - Q&A sections for general parent content
 * @returns {string} Complete HTML page
 */
function generateVariantParentPage(group, generalSections = [], emoji = '📄') {
  const { baseName, baseSlug, variants } = group;
  const escapedBaseName = escapeHtml(baseName);
  const pageEmoji = emoji;

  // Generate general content sections (cos'è, durata, diritti, etc.)
  const generalContentHtml = generalSections.length > 0
    ? generalSections.map((section, index) => renderSection(section, index)).join('\n')
    : `
      <div class="card" style="margin-bottom: 2rem;">
        <h2>Cos'è il permesso per ${escapedBaseName}?</h2>
        <p>Il permesso di soggiorno per ${escapedBaseName} permette di lavorare in Italia in modo regolare.</p>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <h2>Durata</h2>
        <p>La durata varia in base alla tipologia di contratto e alle circostanze specifiche di ottenimento.</p>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <h2>Che diritti mi dà?</h2>
        <ul>
          <li>Lavoro subordinato presso datori di lavoro italiani</li>
          <li>Accesso al servizio sanitario nazionale</li>
          <li>Possibilità di aprire un conto corrente</li>
          <li>Diritto all'istruzione e alla formazione</li>
        </ul>
      </div>`;

  // Generate variant links
  const variantLinksHtml = variants.map(v => {
    const isSanatoria = v.variantSlug === 'sanatoria';
    const variantEmoji = isSanatoria ? '🚧' : '📄';
    const statusBadge = isSanatoria ? '<span style="background: var(--accent-orange); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">In costruzione</span>' : '';

    return `
        <a href="${v.variantSlug}.html" class="card card-link">
          <span class="card-icon">${variantEmoji}</span>
          <h3 class="card-title">
            ${escapeHtml(v.variantName)}
            ${statusBadge}
          </h3>
          <p style="color: var(--gray-medium); font-size: 0.875rem;">
            ${isSanatoria ? 'Contenuto in arrivo' : `Informazioni specifiche per ${escapeHtml(v.variantName.toLowerCase())}`}
          </p>
        </a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Permesso di soggiorno per ${escapedBaseName} - informazioni generali e tipologie specifiche">
  <title>Permesso per ${escapedBaseName} - SOS Permesso</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../../../images/logo-full.png">
  <link rel="shortcut icon" type="image/png" href="../../../images/logo-full.png">
  <link rel="apple-touch-icon" href="../../../images/logo-full.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../../styles/main.css">
  <link rel="stylesheet" href="../../styles/components.css">
  <link rel="stylesheet" href="../../styles/animations.css">
  <link rel="stylesheet" href="../../styles/mobile.css">
  <link rel="stylesheet" href="../../styles/mobile-fix.css">
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <a href="../../../index.html" class="logo">
          <img src="../../../images/logo-full.png" alt="SOS Permesso" class="logo-image">
        </a>
        <button class="menu-toggle" id="menu-toggle">☰</button>

        <div class="nav-wrapper">
          <ul class="nav-menu" id="nav-menu">
            <!-- Database with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#database" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="../database.html" class="dropdown-link" role="menuitem">Tutti i permessi</a></li>
                <li role="none"><a href="../documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
              </ul>
            </li>

            <!-- Guide with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#guide" class="nav-link" aria-haspopup="true" aria-expanded="false">Guide</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="../protezione-internazionale.html" class="dropdown-link" role="menuitem">Protezione internazionale</a></li>
                <li role="none"><a href="../permesso-ricongiungimento-familiare.html" class="dropdown-link" role="menuitem">Ricongiungimento familiare</a></li>
                <li role="none"><a href="../dizionario.html" class="dropdown-link" role="menuitem">Dizionario</a></li>
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
                <li role="none"><a href="../chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>
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
        <a href="../../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
        <a href="../database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
        <span>Permesso per ${escapedBaseName}</span>
      </div>

      <!-- ERROR BUTTON -->
      <a href="https://form.typeform.com/to/FsqvzdXI#page_url=${encodeURIComponent('https://sospermesso.it/src/pages/permesso-' + baseSlug + '/index.html')}"
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
        <h1 class="page-title">Permesso per ${escapedBaseName}</h1>
      </div>
    </div>
  </section>

  <!-- GENERAL CONTENT -->
  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="alert alert-info" style="margin-bottom: 2rem;">
        <span class="alert-icon">ℹ️</span>
        <div>
          <strong>Questa pagina contiene informazioni comuni a tutte le tipologie.</strong>
          <p style="margin-top: 0.5rem; margin-bottom: 0;">
            Le pagine specifiche sotto contengono solo gli elementi <strong>distinti</strong> per ogni variante
            (ad esempio: come si ottiene, requisiti specifici, documenti particolari).
          </p>
        </div>
      </div>

${generalContentHtml}
    </div>
  </section>

  <!-- VARIANT LINKS -->
  <section class="section bg-off-white">
    <div class="container">
      <h2 class="text-center mb-lg">Tipologie specifiche</h2>
      <div class="grid grid-2" style="max-width: 800px; margin: 0 auto;">
${variantLinksHtml}
      </div>
    </div>
  </section>

  <!-- RELATED -->
  <section class="section">
    <div class="container">
      <h2 class="text-center mb-lg">Potrebbero interessarti anche</h2>
      <div class="grid grid-3">
        <a href="../database.html" class="card card-link card-compact">
          <span class="card-icon">📚</span>
          <h3 class="card-title">Tutti i permessi</h3>
        </a>
        <a href="../documenti-questura.html" class="card card-link card-compact">
          <span class="card-icon">📋</span>
          <h3 class="card-title">Documenti Questura</h3>
        </a>
        <a href="../dizionario.html" class="card card-link card-compact">
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
        <a href="../chi-siamo.html" class="footer-project-link">Il Progetto</a>
        <span class="footer-separator">|</span>
        <a href="https://form.typeform.com/to/USx16QN3" class="footer-project-link" target="_blank">Contatti</a>
        <span class="footer-separator">|</span>
        <p class="footer-copyright">© 2025 SOS Permesso</p>
      </div>
    </div>
  </footer>

  <!-- Contact Form Container -->
  <div id="contact-form-container"></div>

  <script src="../../scripts/app.js"></script>
  <script src="../../scripts/mobile.js"></script>
  <script>
    // Load contact form
    fetch('../../components/contact-form.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contact-form-container').innerHTML = html;
      });
  </script>
</body>
</html>`;
}

/**
 * Generate a variant child page (in subfolder)
 * Adjusted paths for subfolder location
 * @param {Object} permit - Variant permit data
 * @param {string} permit.tipo - Full variant name
 * @param {string} permit.variantName - Just the variant part
 * @param {string} permit.variantSlug - URL slug for variant
 * @param {string} permit.baseName - Parent permit name
 * @param {string} permit.baseSlug - Parent permit slug
 * @param {string} permit.emoji - Emoji icon
 * @param {Array<Object>} permit.sections - Q&A sections
 * @returns {string} Complete HTML page
 */
function generateVariantChildPage(permit) {
  const { tipo, variantName, variantSlug, baseName, baseSlug, emoji, sections } = permit;

  const escapedTipo = escapeHtml(tipo);
  const escapedVariantName = escapeHtml(variantName);
  const escapedBaseName = escapeHtml(baseName);
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
  <meta name="description" content="Permesso per ${escapedTipo} - requisiti specifici e procedure">
  <title>${escapedTipo} - SOS Permesso</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../../../images/logo-full.png">
  <link rel="shortcut icon" type="image/png" href="../../../images/logo-full.png">
  <link rel="apple-touch-icon" href="../../../images/logo-full.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../../styles/main.css">
  <link rel="stylesheet" href="../../styles/components.css">
  <link rel="stylesheet" href="../../styles/animations.css">
  <link rel="stylesheet" href="../../styles/mobile.css">
  <link rel="stylesheet" href="../../styles/mobile-fix.css">
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <a href="../../../index.html" class="logo">
          <img src="../../../images/logo-full.png" alt="SOS Permesso" class="logo-image">
        </a>
        <button class="menu-toggle" id="menu-toggle">☰</button>

        <div class="nav-wrapper">
          <ul class="nav-menu" id="nav-menu">
            <!-- Database with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#database" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="../database.html" class="dropdown-link" role="menuitem">Tutti i permessi</a></li>
                <li role="none"><a href="../documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
              </ul>
            </li>

            <!-- Guide with dropdown -->
            <li class="nav-item has-dropdown">
              <a href="#guide" class="nav-link" aria-haspopup="true" aria-expanded="false">Guide</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="../protezione-internazionale.html" class="dropdown-link" role="menuitem">Protezione internazionale</a></li>
                <li role="none"><a href="../permesso-ricongiungimento-familiare.html" class="dropdown-link" role="menuitem">Ricongiungimento familiare</a></li>
                <li role="none"><a href="../dizionario.html" class="dropdown-link" role="menuitem">Dizionario</a></li>
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
                <li role="none"><a href="../chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>
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
        <a href="../../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
        <a href="../database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
        <a href="index.html" style="color: var(--taxi-yellow-dark);">Permesso per ${escapedBaseName}</a> →
        <span>${escapedVariantName}</span>
      </div>

      <!-- ERROR BUTTON -->
      <a href="https://form.typeform.com/to/FsqvzdXI#page_url=${encodeURIComponent('https://sospermesso.it/src/pages/permesso-' + baseSlug + '/' + variantSlug + '.html')}"
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
        <h1 class="page-title">${escapedTipo}</h1>
      </div>
    </div>
  </section>

  <!-- BACK TO PARENT LINK -->
  <section class="section" style="padding: 1rem 0;">
    <div class="container" style="max-width: 900px;">
      <a href="index.html" style="display: inline-flex; align-items: center; gap: 0.5rem; color: var(--taxi-yellow-dark); text-decoration: none; font-weight: 500;">
        ← Torna alle informazioni generali su ${escapedBaseName}
      </a>
    </div>
  </section>

  <!-- CONTENT -->
  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="alert alert-info" style="margin-bottom: 2rem;">
        <span class="alert-icon">ℹ️</span>
        <div>
          <strong>Questa pagina contiene solo le informazioni specifiche per ${escapedVariantName.toLowerCase()}.</strong>
          <p style="margin-top: 0.5rem; margin-bottom: 0;">
            Per informazioni generali (cos'è, durata, diritti), vedi la
            <a href="index.html" style="color: var(--taxi-yellow-dark); font-weight: 600;">pagina principale</a>.
          </p>
        </div>
      </div>

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
        <a href="index.html" class="card card-link card-compact">
          <span class="card-icon">📄</span>
          <h3 class="card-title">Info generali</h3>
        </a>
        <a href="../database.html" class="card card-link card-compact">
          <span class="card-icon">📚</span>
          <h3 class="card-title">Tutti i permessi</h3>
        </a>
        <a href="../dizionario.html" class="card card-link card-compact">
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
        <a href="../chi-siamo.html" class="footer-project-link">Il Progetto</a>
        <span class="footer-separator">|</span>
        <a href="https://form.typeform.com/to/USx16QN3" class="footer-project-link" target="_blank">Contatti</a>
        <span class="footer-separator">|</span>
        <p class="footer-copyright">© 2025 SOS Permesso</p>
      </div>
    </div>
  </footer>

  <!-- Contact Form Container -->
  <div id="contact-form-container"></div>

  <script src="../../scripts/app.js"></script>
  <script src="../../scripts/mobile.js"></script>
  <script>
    // Load contact form
    fetch('../../components/contact-form.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contact-form-container').innerHTML = html;
      });
  </script>
</body>
</html>`;
}

/**
 * Generate a placeholder page for variant in subfolder
 * @param {Object} permit - Variant permit data
 * @returns {string} Complete HTML page
 */
function generateVariantPlaceholderPage(permit) {
  const { tipo, variantName, baseName, emoji } = permit;
  const escapedTipo = escapeHtml(tipo);
  const escapedVariantName = escapeHtml(variantName);
  const escapedBaseName = escapeHtml(baseName);
  const pageEmoji = emoji || '🚧';

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Permesso per ${escapedTipo} - pagina in costruzione">
  <title>${escapedTipo} - SOS Permesso</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../../../images/logo-full.png">
  <link rel="shortcut icon" type="image/png" href="../../../images/logo-full.png">
  <link rel="apple-touch-icon" href="../../../images/logo-full.png">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="../../styles/main.css">
  <link rel="stylesheet" href="../../styles/components.css">
  <link rel="stylesheet" href="../../styles/animations.css">
  <link rel="stylesheet" href="../../styles/mobile.css">
  <link rel="stylesheet" href="../../styles/mobile-fix.css">
</head>
<body>

  <!-- HEADER -->
  <header class="header">
    <div class="container">
      <nav class="navbar">
        <a href="../../../index.html" class="logo">
          <img src="../../../images/logo-full.png" alt="SOS Permesso" class="logo-image">
        </a>
        <button class="menu-toggle" id="menu-toggle">☰</button>

        <div class="nav-wrapper">
          <ul class="nav-menu" id="nav-menu">
            <li class="nav-item has-dropdown">
              <a href="#database" class="nav-link" aria-haspopup="true" aria-expanded="false">Database</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="../database.html" class="dropdown-link" role="menuitem">Tutti i permessi</a></li>
                <li role="none"><a href="../documenti-questura.html" class="dropdown-link" role="menuitem">Che documenti porto in Questura</a></li>
              </ul>
            </li>
            <li class="nav-item has-dropdown">
              <a href="#guide" class="nav-link" aria-haspopup="true" aria-expanded="false">Guide</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="../protezione-internazionale.html" class="dropdown-link" role="menuitem">Protezione internazionale</a></li>
                <li role="none"><a href="../permesso-ricongiungimento-familiare.html" class="dropdown-link" role="menuitem">Ricongiungimento familiare</a></li>
                <li role="none"><a href="../dizionario.html" class="dropdown-link" role="menuitem">Dizionario</a></li>
              </ul>
            </li>
            <li class="nav-item has-dropdown">
              <a href="#test" class="nav-link" aria-haspopup="true" aria-expanded="false">Test</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="https://form.typeform.com/to/kt7P9Ejk" class="dropdown-link" role="menuitem" target="_blank">Posso AVERE un permesso?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/oc9jhdkJ" class="dropdown-link" role="menuitem" target="_blank">Posso CONVERTIRE?</a></li>
                <li role="none"><a href="https://form.typeform.com/to/R7HY8nBp" class="dropdown-link" role="menuitem" target="_blank">Posso RINNOVARE il permesso?</a></li>
              </ul>
            </li>
            <li class="nav-item has-dropdown">
              <a href="#collabora" class="nav-link" aria-haspopup="true" aria-expanded="false">Collabora</a>
              <ul class="nav-dropdown" role="menu">
                <li role="none"><a href="https://form.typeform.com/to/FsqvzdXI" class="dropdown-link" role="menuitem" target="_blank">Segnala un errore</a></li>
                <li role="none"><a href="https://form.typeform.com/to/USx16QN3" class="dropdown-link" role="menuitem" target="_blank">Dai una mano</a></li>
                <li role="none"><a href="../chi-siamo.html" class="dropdown-link" role="menuitem">Il progetto</a></li>
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
    <div class="container">
      <div style="font-size: 0.875rem; color: var(--gray-medium);">
        <a href="../../../index.html" style="color: var(--taxi-yellow-dark);">Home</a> →
        <a href="../database.html" style="color: var(--taxi-yellow-dark);">Database</a> →
        <a href="index.html" style="color: var(--taxi-yellow-dark);">Permesso per ${escapedBaseName}</a> →
        <span>${escapedVariantName}</span>
      </div>
    </div>
  </section>

  <!-- PAGE HEADER -->
  <section class="section bg-off-white">
    <div class="container">
      <div class="page-header text-center">
        <span class="page-icon" style="font-size: 4rem;">${pageEmoji}</span>
        <h1 class="page-title">${escapedTipo}</h1>
      </div>
    </div>
  </section>

  <!-- PLACEHOLDER CONTENT -->
  <section class="section">
    <div class="container" style="max-width: 900px;">
      <div class="card text-center" style="padding: 3rem;">
        <span style="font-size: 4rem;">🚧</span>
        <h2 style="margin: 1rem 0;">Contenuto in arrivo</h2>
        <p style="color: var(--gray-medium); max-width: 500px; margin: 0 auto 1.5rem;">
          Stiamo ancora lavorando per completare le informazioni specifiche
          su questa tipologia di permesso di soggiorno.
        </p>
        <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center;">
          <a href="index.html"
             class="btn btn-primary">
            Vedi informazioni generali
          </a>
          <a href="https://form.typeform.com/to/USx16QN3"
             class="btn btn-secondary"
             target="_blank"
             rel="noopener noreferrer">
            Dai una mano
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- RELATED -->
  <section class="section bg-off-white">
    <div class="container">
      <h2 class="text-center mb-lg">Potrebbero interessarti anche</h2>
      <div class="grid grid-3">
        <a href="index.html" class="card card-link card-compact">
          <span class="card-icon">📄</span>
          <h3 class="card-title">Info generali</h3>
        </a>
        <a href="../database.html" class="card card-link card-compact">
          <span class="card-icon">📚</span>
          <h3 class="card-title">Tutti i permessi</h3>
        </a>
        <a href="../dizionario.html" class="card-link card-compact">
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
        <a href="../chi-siamo.html" class="footer-project-link">Il Progetto</a>
        <span class="footer-separator">|</span>
        <a href="https://form.typeform.com/to/USx16QN3" class="footer-project-link" target="_blank">Contatti</a>
        <span class="footer-separator">|</span>
        <p class="footer-copyright">© 2025 SOS Permesso</p>
      </div>
    </div>
  </footer>

  <!-- Contact Form Container -->
  <div id="contact-form-container"></div>

  <script src="../../scripts/app.js"></script>
  <script src="../../scripts/mobile.js"></script>
  <script>
    // Load contact form
    fetch('../../components/contact-form.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('contact-form-container').innerHTML = html;
      });
  </script>
</body>
</html>`;
}

module.exports = {
  generatePermessoPage,
  generatePlaceholderPage,
  generateVariantParentPage,
  generateVariantChildPage,
  generateVariantPlaceholderPage
};

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
