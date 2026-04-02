module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates
      if (data.pagination) return data.permalink;
      return `fa/${data.page.fileSlug}.html`;
    }
  }
};
