# Technology Stack

**Analysis Date:** 2026-01-25

## Languages

**Primary:**
- HTML5 - Page markup and structure
- CSS3 - Styling with CSS custom properties and animations
- JavaScript (Vanilla/ES6+) - Client-side interactivity and DOM manipulation

**Secondary:**
- JSON - Content data files for multilingual support

## Runtime

**Environment:**
- Browser-based (no server-side runtime)
- Modern browsers with ES6+ support required

**Package Manager:**
- None (no package.json, no npm/yarn dependencies)
- Static HTML/CSS/JavaScript architecture

## Frameworks

**Core:**
- None - Pure HTML, CSS, JavaScript (no framework)

**Testing:**
- None detected

**Build/Dev:**
- None - Direct file serving (no build process)

## Key Dependencies

**External CDN Resources:**
- Google Fonts: Inter (weights: 400, 500, 600, 700), Poppins (weights: 600, 700, 800)
  - Source: `https://fonts.googleapis.com`
  - Used in: All pages via `<link>` tag in head
  - Critical for typography system

**Internal Assets:**
- SVG assets (Favicon.svg)
- PNG images (Logo.png)
- Location: `/images/` directory

## Configuration

**Environment:**
- No environment variables required for development
- No .env files detected
- All configuration is hardcoded in CSS custom properties (`:root`)

**Build:**
- No build configuration
- No bundler (webpack, Vite, Parcel, etc.)
- Files served directly

**CSS Configuration:**
- CSS custom properties (variables) system in `src/styles/main.css`
- Defines all colors, spacing, typography, shadows, and transitions
- Variables referenced throughout component styles

## File Structure

**Stylesheets:**
- `src/styles/main.css` - CSS variables, base styles, typography
- `src/styles/components.css` - Component-specific styles (cards, buttons, alerts)
- `src/styles/animations.css` - Animation definitions (@keyframes)
- `src/styles/mobile.css` - Mobile responsive styles
- `src/styles/mobile-fix.css` - Critical mobile fixes and workarounds

**Scripts:**
- `src/scripts/app.js` - Main application logic (navigation, language switcher, animations, content loading)
- `src/scripts/mobile.js` - Mobile-specific functionality
- Inline scripts in component HTML files (e.g., contact-form.html)

**Content:**
- `src/data/content-it.json` - Italian content data
- `src/data/content-en.json` - English content data
- Structure: JSON objects with sections (header, hero, tests, database categories, footer)

**Components:**
- `src/components/contact-form.html` - Reusable contact form modal with embedded styles and scripts
- `src/components/lighthouse.html` - Lighthouse hero animation
- `src/components/paperwork-illustration.html` - Cartoon illustrations

**Pages:**
- `index.html` - Main home page (in root)
- `src/pages/database.html` - Database/permit categories landing page
- `src/pages/permesso-studio.html` - Study permit detail page
- `src/pages/permesso-lavoro-*.html` - Work permit variations
- `src/pages/permesso-asilo.html` - Asylum permit page
- Additional permit-specific pages (~39 total page files)

## Platform Requirements

**Development:**
- Text editor (VS Code, Sublime, etc.)
- Modern browser for testing (Chrome, Firefox, Safari, Edge)
- HTTP server for local development (if needed for fetch API)
- Git for version control

**Production:**
- Static file hosting (Netlify, Vercel, GitHub Pages, traditional web server)
- HTTPS support (required for form submissions)
- CDN for Google Fonts (public, no credentials needed)

## Browser Support

- Modern browsers with:
  - ES6+ JavaScript support
  - CSS Grid and Flexbox
  - CSS custom properties (CSS variables)
  - SVG support
  - Fetch API
  - LocalStorage API

**Tested on:**
- Chrome/Chromium (desktop and mobile)
- Firefox (desktop)
- Safari (desktop and iOS)
- Edge (desktop)

## No External Dependencies

**Important:** This project has ZERO npm dependencies. It is a pure static site with:
- No Node.js runtime required
- No build process
- No package manager needed
- Direct CSS and JavaScript execution in browser
- Lightweight and performant by design

---

*Stack analysis: 2026-01-25*
