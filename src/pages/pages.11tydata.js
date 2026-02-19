module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates (permits.liquid, documents-*.liquid)
      // They define their own permalink in front matter
      if (data.pagination) return data.permalink;
      // Preserve explicit .xml permalinks (sitemap templates)
      if (typeof data.permalink === 'string' && data.permalink.endsWith('.xml')) return data.permalink;
      return `${data.page.fileSlug}.html`;
    }
  }
};
