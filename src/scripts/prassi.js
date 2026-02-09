/* ===============================================
   SOS PERMESSO - PRASSI LOCALI CLIENT SCRIPT
   =============================================== */

(function() {
  'use strict';

  // ===============================================
  // QUESTURA CITIES (105 provincial capitals)
  // ===============================================
  const QUESTURA_CITIES = [
    "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno",
    "Asti", "Avellino", "Bari", "Barletta-Andria-Trani", "Belluno", "Benevento",
    "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia", "Brindisi",
    "Cagliari", "Caltanissetta", "Campobasso", "Caserta", "Catania", "Catanzaro",
    "Chieti", "Como", "Cosenza", "Cremona", "Crotone", "Cuneo",
    "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena",
    "Frosinone", "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia",
    "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco", "Livorno",
    "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera",
    "Messina", "Milano", "Modena", "Monza e Brianza", "Napoli", "Novara",
    "Nuoro", "Oristano", "Padova", "Palermo", "Parma", "Pavia",
    "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia",
    "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria",
    "Reggio Emilia", "Rieti", "Rimini", "Roma", "Rovigo", "Salerno",
    "Sassari", "Savona", "Siena", "Siracusa", "Sondrio", "Sud Sardegna",
    "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento",
    "Treviso", "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola",
    "Vercelli", "Verona", "Vibo Valentia", "Vicenza", "Viterbo"
  ];

  // ===============================================
  // MODAL INJECTION AND MANAGEMENT
  // ===============================================

  // Global function to open modal (called from onclick in templates)
  window.openPrassiModal = function(pageUrl, pageSlug) {
    // Inject modal HTML and styles if not already present
    if (!document.getElementById('prassi-modal')) {
      injectModal();
    }

    const modal = document.getElementById('prassi-modal');
    const pageUrlField = document.getElementById('prassi-page-url');
    const pageSlugField = document.getElementById('prassi-page-slug');

    // Pre-fill hidden fields
    if (pageUrlField) pageUrlField.value = pageUrl || '';
    if (pageSlugField) pageSlugField.value = pageSlug || '';

    // Open modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function injectModal() {
    const modalHTML = `
      <div class="prassi-modal" id="prassi-modal">
        <div class="prassi-modal-backdrop" id="prassi-backdrop"></div>
        <div class="prassi-modal-content">
          <button class="prassi-modal-close" id="prassi-close" aria-label="Chiudi">✕</button>

          <div class="prassi-header">
            <span class="prassi-icon">📝</span>
            <h2 class="prassi-title">Condividi la tua esperienza</h2>
            <p class="prassi-subtitle">Aiuta la community con le prassi della tua Questura</p>
          </div>

          <form class="prassi-form" id="prassi-form">
            <!-- City with datalist -->
            <div class="form-group">
              <label for="prassi-city" class="form-label">
                Questura <span class="required">*</span>
              </label>
              <input
                type="text"
                id="prassi-city"
                name="city"
                class="form-input"
                required
                placeholder="Inizia a digitare..."
                list="questura-cities"
                autocomplete="off"
              >
              <datalist id="questura-cities">
                ${QUESTURA_CITIES.map(city => `<option value="${city}">`).join('')}
              </datalist>
              <span class="form-hint">Seleziona una delle 105 questure disponibili</span>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label for="prassi-description" class="form-label">
                Descrizione <span class="required">*</span>
              </label>
              <textarea
                id="prassi-description"
                name="description"
                class="form-textarea"
                rows="5"
                required
                placeholder="Descrivi la prassi locale che hai sperimentato (es. 'A Torino chiedono anche una copia extra del contratto di lavoro')"
              ></textarea>
              <span class="form-hint">Minimo 20 caratteri</span>
            </div>

            <!-- Date (optional) -->
            <div class="form-group">
              <label for="prassi-date" class="form-label">
                Data esperienza (opzionale)
              </label>
              <input
                type="date"
                id="prassi-date"
                name="date"
                class="form-input"
              >
            </div>

            <!-- Category (optional) -->
            <div class="form-group">
              <label for="prassi-category" class="form-label">
                Categoria (opzionale)
              </label>
              <input
                type="text"
                id="prassi-category"
                name="category"
                class="form-input"
                placeholder="es. Documenti, Tempi, Sportello"
              >
            </div>

            <!-- Hidden fields -->
            <input type="hidden" id="prassi-page-url" name="pageUrl">
            <input type="hidden" id="prassi-page-slug" name="pageSlug">

            <!-- Submit Button -->
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-lg" id="prassi-submit">
                <span class="btn-text">Invia segnalazione</span>
                <span class="btn-loader" style="display: none;">
                  <span class="loader"></span> Invio...
                </span>
              </button>
            </div>

            <!-- Response Messages -->
            <div class="form-response" id="prassi-response" style="display: none;"></div>
          </form>
        </div>
      </div>
    `;

    const modalStyles = `
      <style>
      /* ===============================================
         PRASSI MODAL STYLES
         =============================================== */

      .prassi-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      .prassi-modal.active {
        display: flex;
      }

      .prassi-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        animation: fadeIn 0.3s ease;
      }

      .prassi-modal-content {
        position: relative;
        background: var(--white);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        padding: 2rem;
        animation: slideUp 0.3s ease;
        z-index: 1;
      }

      .prassi-modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--gray-light);
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);
        color: var(--gray-dark);
        z-index: 2;
      }

      .prassi-modal-close:hover {
        background: var(--lighthouse-red);
        color: var(--white);
        transform: rotate(90deg);
      }

      /* ===============================================
         PRASSI HEADER
         =============================================== */

      .prassi-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .prassi-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: 0.5rem;
        animation: bounce 2s ease-in-out infinite;
      }

      .prassi-title {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: var(--black);
      }

      .prassi-subtitle {
        color: var(--gray-medium);
        font-size: 1rem;
      }

      /* ===============================================
         FORM STYLES (reuse contact form patterns)
         =============================================== */

      .prassi-form {
        width: 100%;
      }

      .prassi-pending-preview {
        margin-top: 1rem;
        padding: 1.5rem;
        border: 2px dashed var(--gray-medium);
        border-radius: var(--radius-md);
        background-color: var(--gray-light);
      }

      .prassi-pending-preview h3 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        color: var(--gray-dark);
        font-size: 1.25rem;
      }

      .prassi-pending-preview .pending-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background-color: var(--gray-medium);
        color: var(--white);
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }

      .prassi-pending-preview p {
        margin: 0.5rem 0;
        color: var(--gray-dark);
        font-size: 0.9375rem;
      }

      /* ===============================================
         MOBILE RESPONSIVE
         =============================================== */

      @media (max-width: 768px) {
        .prassi-modal {
          padding: 0.5rem;
        }

        .prassi-modal-content {
          padding: 1.5rem;
          max-height: 95vh;
          border-radius: var(--radius-md);
        }

        .prassi-icon {
          font-size: 2.5rem;
        }

        .prassi-title {
          font-size: 1.5rem;
        }

        .prassi-subtitle {
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          font-size: 16px; /* Prevent zoom on iOS */
        }

        .btn {
          width: 100%;
        }
      }

      @media (max-width: 480px) {
        .prassi-modal-content {
          padding: 1.25rem;
        }

        .prassi-header {
          margin-bottom: 1.5rem;
        }
      }
      </style>
    `;

    // Inject into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.head.insertAdjacentHTML('beforeend', modalStyles);

    // Attach event listeners
    attachModalListeners();
  }

  function attachModalListeners() {
    const modal = document.getElementById('prassi-modal');
    const backdrop = document.getElementById('prassi-backdrop');
    const closeBtn = document.getElementById('prassi-close');
    const form = document.getElementById('prassi-form');
    const cityInput = document.getElementById('prassi-city');

    // Close modal
    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // City validation on blur
    if (cityInput) {
      cityInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && !QUESTURA_CITIES.includes(value)) {
          this.setCustomValidity('Seleziona una città dalla lista delle 105 questure');
        } else {
          this.setCustomValidity('');
        }
      });

      // Clear custom validity on input
      cityInput.addEventListener('input', function() {
        this.setCustomValidity('');
      });
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validation
        if (!QUESTURA_CITIES.includes(data.city.trim())) {
          showResponse('Seleziona una città dalla lista delle 105 questure', 'error');
          return;
        }

        if (data.description.length < 20) {
          showResponse('La descrizione deve essere di almeno 20 caratteri', 'error');
          return;
        }

        // Show loading
        const submitBtn = document.getElementById('prassi-submit');
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'flex';

        try {
          const response = await fetch('/.netlify/functions/submit-prassi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Errore durante l\'invio');
          }

          // Show success with preview
          showSuccessWithPreview(data);

          // Reset form
          form.reset();

          // Close modal after 3 seconds
          setTimeout(() => {
            closeModal();
            document.getElementById('prassi-response').style.display = 'none';
          }, 3000);

        } catch (error) {
          showResponse(`❌ ${error.message}`, 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.querySelector('.btn-text').style.display = 'inline';
          submitBtn.querySelector('.btn-loader').style.display = 'none';
        }
      });
    }
  }

  function showResponse(message, type) {
    const response = document.getElementById('prassi-response');
    response.innerHTML = message;
    response.className = `form-response ${type}`;
    response.style.display = 'block';
  }

  function showSuccessWithPreview(data) {
    const response = document.getElementById('prassi-response');
    const previewHTML = `
      <div style="text-align: center; margin-bottom: 1rem;">
        ✅ Segnalazione inviata con successo!
      </div>
      <div class="prassi-pending-preview">
        <span class="pending-badge">In attesa di approvazione</span>
        <h3>Anteprima della tua segnalazione</h3>
        <p><strong>Questura:</strong> ${data.city}</p>
        <p><strong>Descrizione:</strong> ${data.description}</p>
        ${data.date ? `<p><strong>Data:</strong> ${data.date}</p>` : ''}
        ${data.category ? `<p><strong>Categoria:</strong> ${data.category}</p>` : ''}
      </div>
    `;
    response.innerHTML = previewHTML;
    response.className = 'form-response success';
    response.style.display = 'block';
  }

  // ===============================================
  // VOTING UI ENHANCEMENT
  // ===============================================

  document.addEventListener('DOMContentLoaded', () => {
    enhanceVotingUI();
  });

  function enhanceVotingUI() {
    const prassiCards = document.querySelectorAll('.prassi-card');

    prassiCards.forEach(card => {
      const prassiId = card.dataset.prassiId;
      if (!prassiId) return;

      const votesDiv = card.querySelector('.prassi-card-votes');
      if (!votesDiv) return;

      // Parse current counts from text
      const confermoSpan = votesDiv.querySelector('.vote-confermo');
      const nonConfermoSpan = votesDiv.querySelector('.vote-non-confermo');

      const confermoCount = parseInt(confermoSpan.textContent.match(/\d+/)?.[0] || 0);
      const nonConfermoCount = parseInt(nonConfermoSpan.textContent.match(/\d+/)?.[0] || 0);

      // Replace with interactive buttons
      votesDiv.innerHTML = `
        <button class="vote-btn vote-confermo-btn" data-vote="confermo" data-prassi-id="${prassiId}">
          <span class="vote-icon">✓</span> Confermo <span class="vote-count">${confermoCount}</span>
        </button>
        <button class="vote-btn vote-non-confermo-btn" data-vote="non_confermo" data-prassi-id="${prassiId}">
          <span class="vote-icon">✗</span> Non confermo <span class="vote-count">${nonConfermoCount}</span>
        </button>
        <div class="vote-message" style="display: none;"></div>
      `;

      // Check if already voted
      const voteData = getVoteData(prassiId);
      if (voteData) {
        markAsVoted(votesDiv, voteData.voteType);
      }

      // Attach click listeners
      const buttons = votesDiv.querySelectorAll('.vote-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', handleVoteClick);
      });
    });
  }

  async function handleVoteClick(e) {
    const btn = e.currentTarget;
    const prassiId = btn.dataset.prassiId;
    const voteType = btn.dataset.vote;
    const votesDiv = btn.parentElement;
    const messageDiv = votesDiv.querySelector('.vote-message');

    // Check localStorage for existing vote
    const existingVote = getVoteData(prassiId);
    if (existingVote) {
      showVoteMessage(messageDiv, 'Hai già votato per questa prassi', 'info');
      return;
    }

    // Disable buttons temporarily
    const allButtons = votesDiv.querySelectorAll('.vote-btn');
    allButtons.forEach(b => b.disabled = true);

    try {
      const response = await fetch('/.netlify/functions/vote-prassi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prassiId, voteType })
      });

      if (response.status === 429) {
        showVoteMessage(messageDiv, 'Troppi voti, riprova tra poco', 'error');
        allButtons.forEach(b => b.disabled = false);
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore durante il voto');
      }

      // Update count
      const countSpan = btn.querySelector('.vote-count');
      const currentCount = parseInt(countSpan.textContent);
      countSpan.textContent = currentCount + 1;

      // Store vote in localStorage
      storeVote(prassiId, voteType);

      // Mark as voted
      markAsVoted(votesDiv, voteType);

      showVoteMessage(messageDiv, '✓ Voto registrato', 'success');

    } catch (error) {
      showVoteMessage(messageDiv, error.message, 'error');
      allButtons.forEach(b => b.disabled = false);
    }
  }

  function getVoteData(prassiId) {
    const key = `voted:${prassiId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const data = JSON.parse(stored);
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (Date.now() - data.timestamp > twentyFourHours) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  }

  function storeVote(prassiId, voteType) {
    const key = `voted:${prassiId}`;
    const data = {
      voteType,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  function markAsVoted(votesDiv, voteType) {
    const allButtons = votesDiv.querySelectorAll('.vote-btn');
    allButtons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.vote === voteType) {
        btn.classList.add('voted');
      }
    });
  }

  function showVoteMessage(messageDiv, text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `vote-message vote-message-${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 3000);
  }

})();
