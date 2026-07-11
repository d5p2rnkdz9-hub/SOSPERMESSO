const { permitLangSwitch } = require('../../../scripts/templates/lang-switch');

module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates
      if (data.pagination) return data.permalink;
      return `ru/${data.page.fileSlug}.html`;
    },
    // Permits missing from some translated trees: point those languages'
    // switcher links at their database landing instead of a 404, and drop
    // them from hreflang (see scripts/templates/lang-switch.js).
    langSwitchPath: (data) => (data.permit ? permitLangSwitch(data).path : data.langSwitchPath),
    langSwitchAvailable: (data) => (data.permit ? permitLangSwitch(data).available : data.langSwitchAvailable),
  }
};
