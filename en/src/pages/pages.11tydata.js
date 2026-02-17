module.exports = {
  eleventyComputed: {
    permalink: (data) => `en/${data.page.fileSlug}.html`
  }
};
