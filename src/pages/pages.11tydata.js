module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates (permits.liquid, documents-*.liquid)
      // They define their own permalink in front matter
      if (data.pagination) return data.permalink;
      // Don't override explicit permalink set in front matter (e.g. sitemap-*.liquid uses .xml extension)
      // A non-default permalink is one that doesn't match the default computed value
      if (typeof data.permalink === 'string' && !data.permalink.endsWith('.html')) return data.permalink;
      return `${data.page.fileSlug}.html`;
    }
  }
};
