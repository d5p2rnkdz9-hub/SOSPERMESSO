module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates
      if (data.pagination) return data.permalink;
      return `ur/${data.page.fileSlug}.html`;
    }
  }
};
