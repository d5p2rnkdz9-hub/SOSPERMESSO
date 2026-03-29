/**
 * Permit Search Modal
 * Opens a searchable list of all permits, deep-links to specific sections
 */
(function() {
  'use strict';

  var modal = document.getElementById('permit-search-modal');
  if (!modal) return;

  var input = modal.querySelector('.psm-input');
  var list = modal.querySelector('.psm-list');
  var items = list ? list.querySelectorAll('.psm-item') : [];
  var closeBtn = modal.querySelector('.psm-close');
  var currentAnchor = '';

  // Open modal — called by question cards via data-modal-anchor
  window.openPermitSearch = function(anchor) {
    currentAnchor = anchor || '';
    // Update all links with the target anchor
    for (var i = 0; i < items.length; i++) {
      var base = items[i].getAttribute('data-href');
      items[i].href = base + currentAnchor;
    }
    modal.classList.add('psm-open');
    document.body.style.overflow = 'hidden';
    // Reset search
    input.value = '';
    filterList('');
    // Focus input after transition
    setTimeout(function() { input.focus(); }, 100);
  };

  function closeModal() {
    modal.classList.remove('psm-open');
    document.body.style.overflow = '';
  }

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('psm-open')) {
      closeModal();
    }
  });

  // Filter
  input.addEventListener('input', function() {
    filterList(this.value.toLowerCase().trim());
  });

  function filterList(query) {
    var visibleCount = 0;
    for (var i = 0; i < items.length; i++) {
      var name = (items[i].getAttribute('data-name') || '').toLowerCase();
      var show = !query || name.indexOf(query) !== -1;
      items[i].style.display = show ? '' : 'none';
      if (show) visibleCount++;
    }
    // Show/hide empty state
    var empty = list.querySelector('.psm-empty');
    if (empty) {
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Wire up question cards that trigger the modal
  var triggers = document.querySelectorAll('[data-modal-anchor]');
  for (var i = 0; i < triggers.length; i++) {
    triggers[i].addEventListener('click', function(e) {
      e.preventDefault();
      openPermitSearch(this.getAttribute('data-modal-anchor'));
    });
  }
})();
