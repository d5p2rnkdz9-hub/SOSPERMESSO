module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates
      if (data.pagination) return data.permalink;
      return `ar/${data.page.fileSlug}.html`;
    }
  }
};
