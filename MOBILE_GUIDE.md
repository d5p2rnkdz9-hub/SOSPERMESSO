# 📱 SOS Permesso - Mobile Optimization Guide

## Overview

Il sito SOS Permesso è stato **ottimizzato completamente per mobile** con design mobile-first, touch gestures e performance ottimizzate.

## 🎯 Mobile Features Implementate

### 1. **Responsive Design Mobile-First**
- ✅ Layout adaptive da 320px a 768px+
- ✅ Breakpoints: 480px (small), 768px (tablet), 1200px (desktop)
- ✅ Grid che si adatta: 3 colonne → 1 colonna su mobile
- ✅ Typography scalabile e leggibile

### 2. **Touch-Optimized Interface**
- ✅ Tap targets minimi 44x44px (standard iOS/Android)
- ✅ Touch feedback visivo su tutti i bottoni
- ✅ Haptic feedback (vibrazione) su dispositivi supportati
- ✅ Swipe gestures per navigazione menu

### 3. **Mobile Navigation**
- ✅ Hamburger menu fullscreen
- ✅ Chiusura con swipe a sinistra
- ✅ Backdrop blur quando aperto
- ✅ Transizioni smooth
- ✅ Safe area support (iPhone notch)

### 4. **Performance Optimization**
- ✅ Animazioni ridotte su schermi piccoli
- ✅ Lazy loading per immagini
- ✅ Lighthouse SVG ottimizzato (animazioni semplificate)
- ✅ CSS minificato e mobile-specific
- ✅ JavaScript chunking per caricamento progressivo

### 5. **Gestures & Interactions**
- ✅ Swipe left/right detection
- ✅ Pull to refresh (opzionale)
- ✅ Scroll position memory
- ✅ Smooth scroll con offset per header fisso

### 6. **Mobile UX Enhancements**
- ✅ Network status indicator (online/offline)
- ✅ Viewport height fix per iOS
- ✅ Prevent zoom on input focus
- ✅ No horizontal scroll
- ✅ Safe area insets per notch devices

## 📏 Breakpoints

```css
/* Small Mobile */
@media (max-width: 480px) {
  /* 320px - 480px */
}

/* Mobile / Tablet */
@media (max-width: 768px) {
  /* 481px - 768px */
}

/* Desktop */
@media (min-width: 769px) {
  /* 769px+ */
}

/* Landscape Mobile */
@media (max-width: 768px) and (orientation: landscape) {
  /* Landscape specific */
}
```

## 🎨 Mobile-Specific CSS

Il file `mobile.css` include:

### Navigation
- Fullscreen mobile menu
- Swipe-to-close support
- Backdrop overlay
- Fixed positioning

### Cards
- Single column layout
- Reduced hover effects (usa :active)
- Touch feedback
- Optimal spacing

### Typography
```css
/* Mobile */
.hero-title: 2rem (32px)
.section-title: 1.75rem (28px)
.card-title: 1.125rem (18px)
p: 1rem (16px) - line-height: 1.7
```

### Lighthouse
```css
/* Mobile: 280px max-width */
/* Small: 240px max-width */
/* Animazioni semplificate per performance */
```

## 📱 JavaScript Mobile Features

Il file `mobile.js` fornisce:

### SwipeDetector Class
```javascript
new SwipeDetector(element, {
  threshold: 50,      // Min px per swipe
  restraint: 100,     // Max px verticale
  allowedTime: 300,   // Max ms
  onSwipeLeft: () => {},
  onSwipeRight: () => {}
});
```

### Viewport Height Fix (iOS)
```javascript
// Risolve il problema vh su iOS
const vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
```

### Haptic Feedback
```javascript
vibrate(10); // Vibra per 10ms
```

### Network Status
```javascript
// Mostra automaticamente alert online/offline
showNetworkStatus();
```

### Scroll Position Memory
```javascript
// Salva/ripristina posizione scroll tra navigazioni
```

## 🧪 Testing Mobile

### Browser Testing
1. **Chrome DevTools**
   - F12 → Toggle Device Toolbar
   - Test su: iPhone SE, iPhone 12 Pro, Pixel 5, iPad

2. **Firefox Responsive Design Mode**
   - Ctrl+Shift+M
   - Test orientamento portrait/landscape

3. **Safari Responsive Design Mode**
   - Develop → Enter Responsive Design Mode

### Real Device Testing
- **iOS**: Safari, Chrome
- **Android**: Chrome, Samsung Internet, Firefox
- Test su diverse dimensioni schermo (4", 5", 6"+)

### Checklist Testing Mobile

#### Visual
- [ ] Tutto il testo è leggibile senza zoom
- [ ] Immagini si adattano correttamente
- [ ] Nessun overflow orizzontale
- [ ] Bottoni sufficientemente grandi (44x44px min)
- [ ] Spacing adeguato tra elementi clickable

#### Functionality
- [ ] Menu hamburger si apre/chiude correttamente
- [ ] Swipe chiude il menu
- [ ] Links e bottoni rispondono al tap
- [ ] Forms utilizzabili (no zoom su focus)
- [ ] Scroll smooth funziona

#### Performance
- [ ] Pagina carica < 3 secondi su 3G
- [ ] Animazioni fluide (60fps)
- [ ] Lighthouse score mobile > 90
- [ ] No layout shift (CLS < 0.1)

## 🚀 Performance Tips

### Lighthouse Optimization
```bash
# Run Lighthouse audit
lighthouse https://yoursite.com --view

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 95+
```

### Critical CSS
Carica solo CSS essenziale inline per first paint:
```html
<style>
  /* Critical CSS here */
  @import url('styles/mobile.css') screen and (max-width: 768px);
</style>
```

### Image Optimization
```html
<!-- Use responsive images -->
<img
  srcset="image-320.jpg 320w,
          image-640.jpg 640w,
          image-1280.jpg 1280w"
  sizes="(max-width: 768px) 100vw, 50vw"
  src="image-640.jpg"
  alt="Description"
  loading="lazy"
>
```

### Font Loading
```css
/* Use font-display for faster text rendering */
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Prevents FOIT */
}
```

## 🔧 Common Issues & Solutions

### Issue: Inputs zoom on focus (iOS)
```css
/* Solution */
input, select, textarea {
  font-size: 16px !important; /* Prevent zoom */
}
```

### Issue: 100vh broken on mobile
```css
/* Solution */
.fullscreen {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100); /* Fallback */
}
```

### Issue: Sticky header jumps
```css
/* Solution */
.header {
  position: sticky;
  top: 0;
  z-index: 1020;
  will-change: transform; /* GPU acceleration */
}
```

### Issue: Touch delay (300ms)
```html
<!-- Solution -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>
  // Or use touch-action CSS
  document.addEventListener('touchstart', () => {}, {passive: true});
</script>
```

### Issue: Horizontal scroll
```css
/* Solution */
body {
  overflow-x: hidden;
  max-width: 100vw;
}

* {
  box-sizing: border-box;
}
```

## 📊 Mobile Analytics

Traccia questi eventi:
- Menu hamburger apertura/chiusura
- Swipe gestures utilizzati
- Scroll depth
- Click su CTA mobile
- Errori di rete (offline)
- Performance metrics (FCP, LCP, CLS)

```javascript
// Example tracking
function trackMobileEvent(event, data) {
  if (window.innerWidth <= 768) {
    // Send to analytics
    console.log('Mobile Event:', event, data);
  }
}
```

## 🎯 Mobile Accessibility

### Touch Targets
- Minimo 44x44px (Apple guideline)
- Minimo 48x48px (Android guideline)
- Spacing 8px tra target adiacenti

### Focus Visible
```css
*:focus-visible {
  outline: 3px solid var(--taxi-yellow);
  outline-offset: 2px;
}
```

### Screen Reader Support
```html
<!-- Skip to content link -->
<a href="#main" class="skip-to-content">
  Vai al contenuto principale
</a>

<!-- ARIA labels -->
<button aria-label="Apri menu" class="menu-toggle">
  ☰
</button>
```

### Color Contrast
- Testo normale: 4.5:1 minimum
- Testo grande: 3:1 minimum
- UI components: 3:1 minimum

## 📦 Deploy Checklist

Prima di andare in produzione:

- [ ] Test su dispositivi reali (iOS + Android)
- [ ] Lighthouse audit > 90 su tutte le pagine
- [ ] Verifica safe area su iPhone con notch
- [ ] Test con slow 3G network throttling
- [ ] Verifica tutti i breakpoints
- [ ] Test orientamento landscape
- [ ] Validate HTML/CSS
- [ ] Compress images (WebP quando possibile)
- [ ] Enable GZIP compression
- [ ] Setup CDN per assets statici
- [ ] Configure browser caching
- [ ] Setup service worker (PWA - opzionale)

## 🔮 Future Enhancements

Possibili miglioramenti futuri:

1. **PWA Support**
   - Service worker per offline
   - App manifest
   - Add to home screen

2. **Advanced Gestures**
   - Pinch to zoom su immagini
   - Swipe between pages
   - Drag to refresh

3. **Native Features**
   - Share API
   - Geolocation
   - Push notifications

4. **Performance**
   - Lazy load below fold
   - Intersection Observer per tutto
   - Critical CSS inline

---

Made with 💛 for the immigrant community in Italy
