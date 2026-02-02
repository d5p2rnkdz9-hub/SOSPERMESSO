/* ===============================================
   SOS PERMESSO - MAIN APPLICATION SCRIPT
   =============================================== */

// ===============================================
// MOBILE MENU TOGGLE
// ===============================================

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const navWrapper = navMenu?.parentElement;

if (menuToggle && navWrapper) {
  menuToggle.addEventListener('click', () => {
    navWrapper.classList.toggle('active');
    menuToggle.textContent = navWrapper.classList.contains('active') ? '✕' : '☰';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !navWrapper.contains(e.target)) {
      navWrapper.classList.remove('active');
      menuToggle.textContent = '☰';
    }
  });

  // Close menu when clicking any link (nav-link OR dropdown-link)
  navWrapper.querySelectorAll('.nav-link, .dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      navWrapper.classList.remove('active');
      menuToggle.textContent = '☰';
    });
  });
}

// ===============================================
// DROPDOWN ARIA STATE MANAGEMENT
// ===============================================

// Update aria-expanded on hover (desktop only)
function initDropdownAria() {
  if (window.innerWidth > 768) {
    const dropdownParents = document.querySelectorAll('.has-dropdown');

    dropdownParents.forEach(parent => {
      const link = parent.querySelector('.nav-link');
      if (!link) return;

      // Mouse events
      parent.addEventListener('mouseenter', () => {
        link.setAttribute('aria-expanded', 'true');
      });

      parent.addEventListener('mouseleave', () => {
        link.setAttribute('aria-expanded', 'false');
      });

      // Keyboard support - focus within dropdown
      parent.addEventListener('focusin', () => {
        link.setAttribute('aria-expanded', 'true');
      });

      parent.addEventListener('focusout', (e) => {
        // Only close if focus leaves the entire dropdown parent
        if (!parent.contains(e.relatedTarget)) {
          link.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDropdownAria);

// Re-initialize on resize (in case viewport crosses 768px threshold)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initDropdownAria, 250);
});

// ===============================================
// LANGUAGE SWITCHER
// ===============================================

const languageSwitcher = document.querySelector('.language-switcher');
const languageToggle = document.getElementById('language-toggle');
const languageOptions = document.querySelectorAll('.language-option');
const currentLanguageDisplay = document.getElementById('current-language');

// Mobile: toggle dropdown on button click
if (languageToggle && languageSwitcher) {
  languageToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    languageSwitcher.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!languageSwitcher.contains(e.target)) {
      languageSwitcher.classList.remove('active');
    }
  });
}

// Language configuration
const languageConfig = {
  'it': { label: 'IT 🇮🇹', path: '/it/' },
  'en': { label: 'EN 🇬🇧', path: '/en/' },
  'fr': { label: 'FR 🇫🇷', path: '/fr/' },
  'es': { label: 'ES 🇪🇸', path: '/es/' },
  'zh': { label: 'ZH 🇨🇳', path: '/zh/' }
};

// Detect current language from URL path (takes priority over localStorage)
function detectLanguageFromPath() {
  const path = window.location.pathname;
  if (path.startsWith('/en/') || path === '/en') {
    return 'en';
  }
  // Add more languages here when available:
  // if (path.startsWith('/fr/') || path === '/fr') return 'fr';
  // if (path.startsWith('/es/') || path === '/es') return 'es';
  // if (path.startsWith('/zh/') || path === '/zh') return 'zh';
  return 'it'; // Default to Italian
}

// Get current language from URL path
let currentLanguage = detectLanguageFromPath();

// Sync localStorage with detected language
localStorage.setItem('sospermesso-lang', currentLanguage);

// Update display
if (currentLanguageDisplay) {
  currentLanguageDisplay.textContent = languageConfig[currentLanguage].label;
}

// Handle language selection
languageOptions.forEach(option => {
  option.addEventListener('click', function() {
    const selectedLang = this.getAttribute('data-lang');

    // Close dropdown
    if (languageSwitcher) {
      languageSwitcher.classList.remove('active');
    }

    if (selectedLang !== currentLanguage) {
      // Only IT and EN are available for now
      if (selectedLang !== 'it' && selectedLang !== 'en') {
        alert('This language is coming soon! / Questa lingua arriverà presto!');
        return;
      }

      // Save to localStorage
      localStorage.setItem('sospermesso-lang', selectedLang);

      // Get current path
      const currentPath = window.location.pathname;
      let newPath;

      // Determine current language from path
      const isCurrentlyEnglish = currentPath.startsWith('/en/') || currentPath === '/en';

      if (selectedLang === 'en') {
        // Switching TO English
        if (isCurrentlyEnglish) {
          return; // Already on English
        }
        // Add /en/ prefix
        if (currentPath === '/' || currentPath === '/index.html') {
          newPath = '/en/';
        } else {
          newPath = '/en' + currentPath;
        }
      } else if (selectedLang === 'it') {
        // Switching TO Italian
        if (!isCurrentlyEnglish) {
          return; // Already on Italian
        }
        // Remove /en/ prefix
        if (currentPath === '/en/' || currentPath === '/en' || currentPath === '/en/index.html') {
          newPath = '/';
        } else {
          newPath = currentPath.replace(/^\/en/, '');
        }
      }

      // Navigate to the new path
      window.location.href = newPath;
    }
  });
});

// ===============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ===============================================

// SCROLL REVEAL ANIMATION - DISABLED
// Was causing elements to be hidden until scrolled into view
// const observerOptions = {
//   threshold: 0.1,
//   rootMargin: '0px 0px -50px 0px'
// };
//
// const animateOnScroll = new IntersectionObserver((entries) => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       entry.target.classList.add('slide-up');
//       animateOnScroll.unobserve(entry.target);
//     }
//   });
// }, observerOptions);
//
// document.addEventListener('DOMContentLoaded', () => {
//   const elementsToAnimate = document.querySelectorAll('.card, .section-header, .alert');
//   elementsToAnimate.forEach((element, index) => {
//     element.style.opacity = '0';
//     element.classList.add(`stagger-${Math.min(index % 6 + 1, 6)}`);
//     animateOnScroll.observe(element);
//   });
// });

// ===============================================
// ADD ANIMATION CLASSES TO BUTTONS
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    // Add squeeze effect on click
    button.classList.add('squeeze-click');

    // Add hover bounce to primary buttons
    if (button.classList.contains('btn-primary')) {
      button.closest('.card')?.classList.add('hover-lift');
    }
  });
});

// ===============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // Only prevent default for internal anchors
    if (href !== '#' && href.startsWith('#')) {
      e.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 200; // Must match header height (~190px logo + padding)
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// ===============================================
// STICKY HEADER ON SCROLL
// ===============================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 100) {
    header.style.boxShadow = 'var(--shadow-md)';
  } else {
    header.style.boxShadow = 'var(--shadow-sm)';
  }

  lastScroll = currentScroll;
});

// ===============================================
// CARD HOVER EFFECTS
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    // Add icon animation on hover
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.card-icon');
      if (icon) {
        icon.classList.add('emoji-bounce');
      }
    });

    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.card-icon');
      if (icon) {
        icon.classList.remove('emoji-bounce');
      }
    });
  });
});

// ===============================================
// LOAD CONTENT FROM JSON (for multilingual support)
// ===============================================

async function loadContent(lang = 'it') {
  try {
    const response = await fetch(`../data/content-${lang}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.json();
    return content;
  } catch (error) {
    console.error('Error loading content:', error);
    // Fallback to Italian if there's an error
    if (lang !== 'it') {
      return loadContent('it');
    }
    return null;
  }
}

// ===============================================
// ANALYTICS & TRACKING (placeholder)
// ===============================================

function trackEvent(eventName, eventData = {}) {
  // Placeholder for analytics tracking
  console.log('Track Event:', eventName, eventData);

  // Example: Google Analytics
  // if (typeof gtag !== 'undefined') {
  //   gtag('event', eventName, eventData);
  // }
}

// Track CTA clicks
document.addEventListener('DOMContentLoaded', () => {
  const ctaButtons = document.querySelectorAll('a[href*="typeform"]');

  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const buttonText = button.textContent.trim();
      trackEvent('cta_click', {
        button_text: buttonText,
        destination: button.href
      });
    });
  });
});

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ===============================================
// ACCESSIBILITY ENHANCEMENTS
// ===============================================

// Add focus visible class for keyboard navigation
document.addEventListener('DOMContentLoaded', () => {
  let isUsingKeyboard = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      isUsingKeyboard = true;
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    isUsingKeyboard = false;
    document.body.classList.remove('keyboard-navigation');
  });
});

// ===============================================
// CONSOLE MESSAGE
// ===============================================

console.log(
  '%c🏮 SOS Permesso',
  'font-size: 24px; font-weight: bold; color: #FFD700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
);
console.log(
  '%cCompleto, aggiornato, nella tua lingua',
  'font-size: 14px; color: #666;'
);
console.log(
  '%c💛 Made with care for the immigrant community in Italy',
  'font-size: 12px; color: #FF3B3B;'
);

// ===============================================
// EXPORT FOR MODULE USE (if needed)
// ===============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadContent,
    trackEvent,
    debounce,
    isInViewport
  };
}
