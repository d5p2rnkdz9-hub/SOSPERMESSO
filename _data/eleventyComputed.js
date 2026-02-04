module.exports = {
  permalink: (data) => {
    // Preserve .html extension for all HTML files
    // This prevents 11ty from creating /page/index.html instead of /page.html
    if (data.page && data.page.inputPath && data.page.inputPath.endsWith('.html')) {
      return `${data.page.filePathStem}.html`;
    }
    return data.permalink;
  }
};
