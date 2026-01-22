# SOS Permesso - Project Documentation

## Project Overview

**SOS Permesso** is a comprehensive, multilingual website providing information about residence permits (permessi di soggiorno) in Italy. The website aims to make complex bureaucratic information accessible, easy to understand, and available in multiple languages.

## Design Philosophy

- **Bright & Colorful**: Vibrant color palette with gradients to create a friendly, welcoming atmosphere
- **Mobile-First**: Optimized for mobile devices with responsive design throughout
- **Accessible**: Clear typography, simple language, and intuitive navigation
- **Cartoon-Style**: Friendly graphics including an adorable lighthouse mascot and paperwork illustrations
- **Multilingual**: Architecture supports multiple languages (IT, EN, FR, ES, ZH)

## Color Palette

### Primary Colors
- **Taxi Yellow**: #FFD700 (main brand color)
  - Light: #FFF176
  - Dark: #FFC107
  - Bright: #FFEB3B
- **Lighthouse Red**: #FF5252 (accent color)
  - Dark: #E02B2B
  - Bright: #FF6B6B

### Accent Colors (Bright & Vibrant)
- **Blue**: #42A5F5 / #64B5F6
- **Teal**: #26A69A / #4DB6AC
- **Orange**: #FF9800 / #FFB74D
- **Purple**: #AB47BC / #BA68C8
- **Pink**: #EC407A / #F06292
- **Green**: #66BB6A / #81C784

### Neutrals
- Black: #1A1A1A
- Gray Dark: #2D2D2D
- Gray Medium: #757575
- Gray Light: #F5F5F5
- White: #FFFFFF
- Off-white: #FAFAFA

## Project Structure

```
Sito_Nuovo/
├── PREVIEW.html                 # Main demo/preview file
├── claude.md                    # This documentation file
├── src/
│   ├── components/              # Reusable components
│   │   ├── contact-form.html    # Contact modal form
│   │   ├── lighthouse.html      # Lighthouse hero animation
│   │   └── paperwork-illustration.html # Cartoon illustrations (4 variations)
│   ├── pages/                   # Website pages
│   │   ├── index.html           # Home page
│   │   ├── database.html        # Database landing page
│   │   ├── chi-siamo.html       # About us page
│   │   ├── permesso-studio.html
│   │   ├── permesso-lavoro-subordinato.html
│   │   ├── permesso-lavoro-autonomo.html
│   │   ├── permesso-asilo.html
│   │   ├── permesso-ue-lungo-periodo.html
│   │   ├── permesso-ricongiungimento-familiare.html
│   │   └── permesso-protezione-sussidiaria.html
│   ├── styles/                  # CSS files
│   │   ├── main.css             # Base styles & color system
│   │   ├── components.css       # Component-specific styles
│   │   ├── animations.css       # Animation definitions
│   │   ├── mobile.css           # Mobile responsive styles
│   │   └── mobile-fix.css       # Critical mobile fixes
│   ├── scripts/                 # JavaScript files
│   │   ├── app.js               # Main application logic
│   │   └── mobile.js            # Mobile-specific functionality
│   └── data/                    # Content data
│       ├── content-it.json      # Italian content
│       └── content-en.json      # English content
```

## Key Features

### 1. Lighthouse Hero Animation
- Red-white striped lighthouse with adorable cartoon face
- Animated features:
  - Rotating light beam (4s loop)
  - Blinking eyes (4s loop)
  - Animated ocean waves
  - Pulsing star on top
  - Sway animation on hover
- Fully responsive (scales from 400px to 180px on landscape mobile)

### 2. Colorful Gradient Cards
- Each card has:
  - Subtle gradient background
  - Rainbow gradient top border (visible on hover)
  - Golden glow shadow on hover
  - Scale and lift animation
- Category sections have unique gradient backgrounds

### 3. Vibrant Gradient Buttons
- Primary buttons: Yellow gradient with golden glow
- Secondary buttons: Red gradient with red glow
- Smooth hover transitions with scale and shadow effects

### 4. Contact Form Modal
- Accessible modal with backdrop blur
- Form fields:
  - Name (required)
  - Email (required)
  - Subject dropdown (7 options)
  - Message textarea (20 char minimum)
  - Privacy checkbox (required)
- Loading states and success/error feedback
- Mobile-optimized (16px font to prevent iOS zoom)

### 5. Cartoon Illustrations (Available but not currently displayed)
Four SVG illustrations of people dealing with paperwork:
- **Confused**: Person overwhelmed with papers, sweat drops, question marks
- **Success**: Person celebrating with checklist, confetti, stars
- **Searching**: Person examining documents with magnifying glass
- **Stack**: Person carrying huge stack of papers, determined expression

Each has smooth CSS animations (floating, waving, bobbing).

## Database Pages Architecture

### Template Structure
All permit detail pages follow a consistent structure:

1. **Header** with breadcrumb navigation
2. **Page Header** with emoji icon, title, and subtitle
3. **Content Sections**:
   - 📝 Cos'è (What it is)
   - ⏱️ Durata (Duration)
   - ✅ Requisiti (Requirements)
   - 📄 Documenti necessari (Required documents)
   - 💼 Si può lavorare? (Can you work?)
   - 🔄 Conversione (Conversion, if applicable)
   - 💰 Costi (Costs)
   - 💡 Aspetti pratici (Practical aspects, if applicable)
4. **Alert boxes** for warnings and tips
5. **Related links** section
6. **Footer** with contact form integration

### Completed Permit Pages
1. **Permesso per Studio** - Study permit
2. **Permesso per Lavoro Subordinato** - Employed work
3. **Permesso per Lavoro Autonomo** - Self-employment
4. **Permesso per Richiesta Asilo** - Asylum request
5. **Permesso UE Lungo Periodo** - EU long-term residence
6. **Permesso per Ricongiungimento Familiare** - Family reunification
7. **Permesso per Protezione Sussidiaria** - Subsidiary protection

### Database Categories (database.html)
- **📋 STUDIO/LAVORO** (Purple-Blue gradient)
  - Study, Employed work, Self-employment, EU long-term, Job seeking
- **🛡️ PROTEZIONE** (Orange-Pink gradient)
  - Asylum request, Refugee status, Subsidiary protection, Special protection, Minors, Natural disaster, Administrative continuation
- **🏥 CURE MEDICHE** (Blue-Green gradient)
  - Pregnancy, Medical treatment, Serious health reasons
- **👨‍👩‍👧‍👦 MOTIVI FAMILIARI** (Teal-Yellow gradient)
  - Family reunification, Family cohesion, Parent of Italian minor, Relatives of Italians, Minor assistance, EU family member, "Famit" permit, Family residence card, Refugee family members

## Multilingual System

### Architecture
- Content stored in JSON files (`src/data/content-*.json`)
- Language switcher in header with dropdown
- Supported languages: IT 🇮🇹, EN 🇬🇧, FR 🇫🇷, ES 🇪🇸, ZH 🇨🇳
- Static site approach: Each language is a separate copy of the site

### Content Structure (JSON)
```json
{
  "tests": {
    "items": [
      {
        "icon": "🤞",
        "title": "Posso AVERE un permesso?",
        "url": "https://form.typeform.com/to/kt7P9Ejk"
      }
    ]
  }
}
```

## Mobile Optimization

### Critical Fixes (mobile-fix.css)
- **Prevent horizontal scroll**: `overflow-x: hidden` on html/body
- **Container width**: 100% max-width with proper padding
- **Lighthouse scaling**: 260px → 220px → 180px (landscape)
- **Grid collapse**: All grids become single column
- **Typography scaling**: Responsive font sizes
- **Touch targets**: Minimum 44x44px for all interactive elements
- **Header optimization**: Compact logo, visible menu toggle

### Responsive Breakpoints
- Desktop: > 768px
- Tablet/Mobile: ≤ 768px
- Small Mobile: ≤ 480px
- Landscape Mobile: ≤ 768px and orientation landscape

## Components Deep Dive

### Card Component
```css
.card {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.card::before {
  /* Rainbow gradient top border (visible on hover) */
  background: linear-gradient(90deg,
    var(--taxi-yellow) 0%,
    var(--accent-orange) 25%,
    var(--accent-pink) 50%,
    var(--accent-purple) 75%,
    var(--accent-blue) 100%);
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.3);
}
```

### Button Component
```css
.btn-primary {
  background: linear-gradient(135deg,
    var(--taxi-yellow-bright) 0%,
    var(--taxi-yellow) 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
}
```

## Animations

### Lighthouse Animations
- `rotate-beam`: Light beam rotation (4s linear infinite)
- `wave-flow`: Ocean waves movement (3s ease-in-out infinite)
- `light-pulse`: Light pulsing effect (2s ease-in-out infinite)
- `eye-blink`: Eye blinking (4s ease-in-out infinite)
- `sway`: Gentle sway on hover (2s ease-in-out infinite)

### Paperwork Illustration Animations
- `float-paper`: Paper floating up and down (3s ease-in-out infinite)
- `wave-hand`: Hand waving (2s ease-in-out infinite)
- `bob-head`: Head bobbing (2.5s ease-in-out infinite)

### UI Animations
- `fadeIn`: Opacity 0 → 1 (modal backdrop)
- `slideUp`: TranslateY 30px → 0 (modal content)
- `bounce`: Translate Y 0 → -10px → 0 (contact icon)
- `spin`: Rotate 360deg (loading spinner)

## Integration Points

### External Services
1. **Typeform** - Test/Quiz forms
   - "Posso AVERE un permesso?" - https://form.typeform.com/to/kt7P9Ejk
   - "Posso RINNOVARE il permesso?" - https://form.typeform.com/to/R7HY8nBp
   - Contact form - https://sospermesso.typeform.com/contatti

2. **Google Fonts**
   - Inter: 400, 500, 600, 700
   - Poppins: 600, 700, 800

### Contact Form Backend
Currently simulated (setTimeout 1500ms). To integrate:
```javascript
// Replace simulation with actual API call
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Future Development

### Remaining Database Pages
- Attesa occupazione
- Status di rifugiato (Asilo politico)
- Protezione speciale
- Minore età
- Calamità naturale
- Prosieguo amministrativo
- Gravidanza
- Cure mediche
- Gravi motivi di salute
- Coesione familiare
- Genitore minore italiano
- Conviventi familiari italiani
- Assistenza minore
- Familiare cittadino UE
- Permesso "Famit"
- Carta soggiorno familiari
- Familiari rifugiati

### Additional Guide Pages
- Documenti Questura
- Protezione Internazionale (comprehensive guide)
- Dizionario (bureaucratic terms)
- Kit Postale
- Controlla Permesso
- Aiuto Legale

### Language Translations
- Complete content-en.json
- Create content-fr.json
- Create content-es.json
- Create content-zh.json

## Technical Notes

### CSS Variables System
All colors, spacing, typography, shadows, and transitions are defined as CSS variables in `:root`. This allows:
- Easy theme customization
- Consistent design system
- Maintainable codebase

### Component Loading Pattern
Components are loaded dynamically via fetch API:
```javascript
fetch('src/components/contact-form.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('container-id').innerHTML = html;
  });
```

### Mobile-First Approach
All base styles are designed for mobile, then enhanced for larger screens using media queries.

### Accessibility Features
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast ratios for text
- Touch-friendly tap targets (44x44px minimum)
- Focus states on all interactive elements

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- CSS Grid and Flexbox required
- SVG support required for lighthouse and illustrations

## Performance Considerations
- Inline critical CSS for lighthouse
- Lazy loading for components
- Optimized SVG files
- Minimal external dependencies
- Mobile-optimized images and animations

## Credits & Resources
- Icons: Emoji unicode characters
- Fonts: Google Fonts (Inter, Poppins)
- Color inspiration: Material Design color palette
- Lighthouse mascot: Custom SVG illustration
- Paperwork illustrations: Custom SVG illustrations

---

**Last Updated**: 2025-01-14
**Version**: 1.0
**Built with**: HTML, CSS, JavaScript (Vanilla)
