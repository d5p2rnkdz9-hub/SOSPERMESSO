module.exports = {
  eleventyComputed: {
    permalink: (data) => `${data.page.fileSlug}.html`
  }
};
