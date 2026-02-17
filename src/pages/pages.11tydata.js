module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates (permits.liquid, documents-*.liquid)
      // They define their own permalink in front matter
      if (data.pagination) return data.permalink;
      return `${data.page.fileSlug}.html`;
    }
  }
};
