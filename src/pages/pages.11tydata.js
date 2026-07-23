const { LANGS, availableLangs, permitLangSwitch } = require('../../scripts/templates/lang-switch');

function isDocTemplate(data) {
  const stem = (data.page && data.page.filePathStem) || '';
  return stem.endsWith('documents-primo') || stem.endsWith('documents-rinnovo');
}

module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates (permits.liquid, documents-*.liquid)
      // They define their own permalink in front matter
      if (data.pagination) return data.permalink;
      // Preserve explicit .xml / .json permalinks (sitemap and JSON data templates)
      if (typeof data.permalink === 'string' && (data.permalink.endsWith('.xml') || data.permalink.endsWith('.json'))) return data.permalink;
      return `${data.page.fileSlug}.html`;
    },
    langSwitchPath: (data) => {
      if (!data.permit) return data.langSwitchPath;
      if (isDocTemplate(data)) {
        // Document pages are IT-only in every language; the checklist renders
        // inline in the translated permit page (#primo / #rinnovo). Only safe
        // as a target when every tree has the permit.
        const avail = availableLangs(data, data.permit.slug);
        if (avail.length !== LANGS.length) return '/database.html';
        const stem = data.page.filePathStem;
        return `/permesso-${data.permit.slug}.html${stem.endsWith('documents-primo') ? '#primo' : '#rinnovo'}`;
      }
      return permitLangSwitch(data).path;
    },
    langSwitchAvailable: (data) => {
      if (!data.permit) return data.langSwitchAvailable;
      // Doc pages have no mirrored counterpart in any language.
      if (isDocTemplate(data)) return '';
      return permitLangSwitch(data).available;
    },
  }
};
