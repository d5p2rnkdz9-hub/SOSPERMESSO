#!/usr/bin/env python3
"""
Script to add CTA buttons and remove inline document sections from permit pages.
Part of Phase 15-02: Document Deduplication
"""

import re
import os
from pathlib import Path

# Directory containing permit pages
PAGES_DIR = Path("src/pages")

# Pages to process (excluding permesso-studio.html which was done in 15-01, and permesso-asilo.html which is a redirect)
PERMIT_PAGES = [
    "permesso-asilo-politico.html",
    "permesso-assistenza-minore.html",
    "permesso-attesa-occupazione.html",
    "permesso-calamita-naturale.html",
    "permesso-coesione-familiare.html",
    "permesso-conviventi-familiari-italiani.html",
    "permesso-cure-mediche.html",
    "permesso-genitore-minore-italiano.html",
    "permesso-gravi-motivi-salute.html",
    "permesso-gravidanza.html",
    "permesso-lavoro-autonomo.html",
    "permesso-lavoro-subordinato.html",
    "permesso-minore-eta.html",
    "permesso-minori-stranieri-affidati.html",
    "permesso-prosieguo-amministrativo.html",
    "permesso-protezione-speciale.html",
    "permesso-protezione-sussidiaria.html",
    "permesso-richiesta-asilo.html",
    "permesso-ricongiungimento-familiare.html",
    "permesso-ue-lungo-periodo.html"
]

def extract_permit_slug(filename):
    """Extract permit slug from filename: permesso-[slug].html -> [slug]"""
    match = re.match(r'permesso-(.+)\.html', filename)
    return match.group(1) if match else None

def create_cta_section(permit_slug):
    """Generate CTA section HTML with permit-specific links"""
    return f'''  <!-- DOCUMENT CTA -->
  <section class="section" style="padding: 1.5rem 0;">
    <div class="container" style="max-width: 900px;">
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        <a href="documenti-{permit_slug}-primo.html" class="btn btn-primary btn-lg">
          Documenti per il primo rilascio
        </a>
        <a href="documenti-{permit_slug}-rinnovo.html" class="btn btn-secondary btn-lg">
          Documenti per il rinnovo
        </a>
      </div>
    </div>
  </section>

'''

def find_page_header_end(content):
    """Find the end of PAGE HEADER section (before <!-- CONTENT -->)"""
    # Look for the closing </section> after PAGE HEADER, before CONTENT comment
    # Pattern: find section with bg-off-white that contains page-header
    pattern = r'(</section>\s*\n)(\s*<!-- CONTENT -->|\s*<section class="section">)'
    match = re.search(pattern, content)
    if match:
        return match.start(1) + len(match.group(1))

    # Fallback: look for <!-- CONTENT --> comment
    content_match = re.search(r'<!-- CONTENT -->', content)
    if content_match:
        return content_match.start()

    # Alternative: find section after page-header div
    alt_pattern = r'<div class="page-header[^>]*>.*?</div>\s*</div>\s*</section>\s*\n'
    alt_match = re.search(alt_pattern, content, re.DOTALL)
    if alt_match:
        return alt_match.end()

    return None

def remove_document_sections(content):
    """Remove inline document sections (various patterns)"""
    removed_count = 0

    # Pattern 1: Explicit comment markers with card divs
    # Matches: <!-- Documenti Primo Rilascio --> ... <!-- END card -->
    pattern1 = r'\s*<!-- Documenti[^>]*?-->\s*<div class="card"[^>]*>.*?</div>\s*(?:<!-- END card -->)?\s*\n'
    content, count1 = re.subn(pattern1, '', content, flags=re.DOTALL)
    removed_count += count1

    # Pattern 2: Document cards with specific headers
    # Matches cards with h2/h3/h4 containing document-related text
    doc_headers = [
        r'Documenti - Primo Rilascio',
        r'Documenti - Rinnovo',
        r'Documenti per il primo rilascio',
        r'Documenti per il rinnovo',
        r'Che documenti servono per la prima richiesta\?',
        r'Che documenti servono per il rinnovo',
        r'Che documenti porto in questura',
        r'Che documenti ti servono\?',
        r'Che documenti mi servono\?',
        r'Documenti necessari',
        r'Che documenti mi servono per chiederlo\?'
    ]

    for header_pattern in doc_headers:
        # Match card div with this header
        pattern = rf'\s*(?:<!-- [^>]*? -->)?\s*<div class="card"[^>]*>\s*<h[234][^>]*>(?:📄|🔄|📋)?\s*{header_pattern}.*?</div>\s*(?:<!-- [^>]*? -->)?\s*\n'
        content, count = re.subn(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)
        if count > 0:
            removed_count += count
            print(f"    Removed {count} section(s) matching: {header_pattern}")

    # Pattern 3: Nested document sections within "Dove si chiede" cards
    # These are h3/h4 sections within a larger card
    nested_pattern = r'<h[34][^>]*>Che documenti[^<]*</h4>.*?(?=<h[234]|</div>)'
    content, count3 = re.subn(nested_pattern, '', content, flags=re.DOTALL)
    if count3 > 0:
        removed_count += count3
        print(f"    Removed {count3} nested document subsection(s)")

    return content, removed_count

def process_permit_page(filename):
    """Process a single permit page: add CTA, remove document sections"""
    filepath = PAGES_DIR / filename

    if not filepath.exists():
        print(f"⚠️  {filename}: File not found, skipping")
        return False

    print(f"\nProcessing {filename}...")

    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        original_content = f.read()

    # Check if CTA already exists
    if '<!-- DOCUMENT CTA -->' in original_content:
        print(f"  ✓ CTA already exists, skipping")
        return False

    # Extract permit slug
    permit_slug = extract_permit_slug(filename)
    if not permit_slug:
        print(f"  ✗ Could not extract permit slug")
        return False

    # Remove document sections first
    content, removed_count = remove_document_sections(original_content)

    # Find insertion point for CTA
    insert_pos = find_page_header_end(content)
    if not insert_pos:
        print(f"  ✗ Could not find PAGE HEADER end")
        return False

    # Insert CTA section
    cta_html = create_cta_section(permit_slug)
    new_content = content[:insert_pos] + cta_html + content[insert_pos:]

    # Write updated file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    # Report changes
    lines_before = len(original_content.splitlines())
    lines_after = len(new_content.splitlines())
    lines_diff = lines_after - lines_before

    print(f"  ✓ Added CTA section")
    print(f"  ✓ Removed {removed_count} document section(s)")
    print(f"  ✓ Lines: {lines_before} -> {lines_after} ({lines_diff:+d})")

    return True

def main():
    """Process all permit pages"""
    print("=" * 60)
    print("Phase 15-02: CTA Button Propagation")
    print("=" * 60)
    print(f"Processing {len(PERMIT_PAGES)} permit pages...")

    processed = 0
    skipped = 0
    errors = 0

    for filename in PERMIT_PAGES:
        try:
            if process_permit_page(filename):
                processed += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  ✗ ERROR: {e}")
            errors += 1

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Processed: {processed}")
    print(f"Skipped:   {skipped}")
    print(f"Errors:    {errors}")
    print(f"Total:     {len(PERMIT_PAGES)}")

    if errors > 0:
        print("\n⚠️  Some pages had errors. Review output above.")
        return 1
    elif processed == 0:
        print("\n✓ All pages already have CTAs or were skipped.")
        return 0
    else:
        print(f"\n✓ Successfully updated {processed} permit pages!")
        return 0

if __name__ == '__main__':
    exit(main())
