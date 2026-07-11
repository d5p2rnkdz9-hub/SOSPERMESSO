// Language-switcher / hreflang support for pages without translated counterparts.
//
// nav.liquid and base.liquid normally fabricate /{lang}/{slug}.html links for
// every language. Two data keys override that:
//   - langSwitchPath:      fallback path (e.g. "/database.html"). Languages
//                          without a translated counterpart link to
//                          /{lang}{langSwitchPath} instead of the mirrored URL,
//                          and are dropped from hreflang alternates.
//   - langSwitchAvailable: space-separated lang codes whose mirrored page DOES
//                          exist; those keep the normal link + hreflang.
// Static IT-only pages set langSwitchPath in front matter. Pagination templates
// (permit + document pages) compute both via pages.11tydata.js using these
// helpers.

const LANGS = ['en', 'fr', 'es', 'tr', 'bn', 'ru', 'ar', 'ur', 'fa', 'zh'];

// Lang codes whose permits{Lang} data contains this slug (i.e. the translated
// permit page /{lang}/permesso-{slug}.html is generated).
function availableLangs(data, slug) {
  return LANGS.filter((code) => {
    const key = 'permits' + code.charAt(0).toUpperCase() + code.slice(1);
    return (data[key] || []).some((p) => p.slug === slug);
  });
}

// For permit pages (any language tree): no override when the permit exists in
// every tree; otherwise fall back to the language's database landing.
function permitLangSwitch(data) {
  const avail = availableLangs(data, data.permit.slug);
  if (avail.length === LANGS.length) return { path: undefined, available: undefined };
  return { path: '/database.html', available: avail.join(' ') };
}

module.exports = { LANGS, availableLangs, permitLangSwitch };
