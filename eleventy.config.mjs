export default function(eleventyConfig) {
  // Ignore directories and files that shouldn't be processed as templates
  eleventyConfig.ignores.add(".planning/**");
  eleventyConfig.ignores.add("node_modules/**");
  eleventyConfig.ignores.add("scripts/**");
  eleventyConfig.ignores.add("build/**");
  eleventyConfig.ignores.add("NOTION_WEBSITE/**");
  eleventyConfig.ignores.add(".claude/**");
  eleventyConfig.ignores.add(".git/**");
  // Ignore root-level markdown files (documentation, not website content)
  eleventyConfig.ignores.add("*.md");
  eleventyConfig.ignores.add("CLAUDE.md");

  // Passthrough copy for asset directories
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("src/components");
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy("IMAGES");
  eleventyConfig.addPassthroughCopy("public");

  // Note: EN site uses IT assets via relative paths (../../../src/styles, etc.)
  // No separate en/src/styles, en/src/scripts, etc. directories exist

  // Passthrough copy for root-level files
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap-it.xml");
  eleventyConfig.addPassthroughCopy("sitemap-en.xml");
  eleventyConfig.addPassthroughCopy("sitemap-index.xml");
  eleventyConfig.addPassthroughCopy("netlify.toml");

  return {
    dir: {
      input: ".",
      output: "_site"
    },
    templateFormats: ["html", "liquid", "md"],
    htmlTemplateEngine: "liquid"
  };
}
