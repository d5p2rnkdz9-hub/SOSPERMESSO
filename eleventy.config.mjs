import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Import template helpers (CommonJS module)
const helpers = require('./scripts/templates/helpers.js');
const dizionarioMap = require('./scripts/templates/dizionario-map.json');

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

  // Register Liquid filters for template helpers
  // Used in document page templates for linking to dizionario, formatting, etc.

  /**
   * linkToDizionario - Converts document name to HTML with dizionario links
   * Usage in templates: {{ documentName | linkToDizionario | safe }}
   */
  eleventyConfig.addFilter("linkToDizionario", helpers.linkToDizionario);

  /**
   * normalizeDocumentName - Normalize document names (capitalize, fix spacing)
   * Usage: {{ documentName | normalizeDocumentName }}
   */
  eleventyConfig.addFilter("normalizeDocumentName", helpers.normalizeDocumentName);

  /**
   * getDocumentClass - Return CSS class for document item
   * Usage: {{ documentName | getDocumentClass }}
   */
  eleventyConfig.addFilter("getDocumentClass", helpers.getDocumentClass);

  /**
   * isDisputed - Check if document is disputed (varies by Questura)
   * Usage: {% if documentName | isDisputed %}...{% endif %}
   */
  eleventyConfig.addFilter("isDisputed", helpers.isDisputed);

  /**
   * escapeHtml - Escape HTML special characters to prevent XSS
   * Usage: {{ text | escapeHtml }}
   */
  eleventyConfig.addFilter("escapeHtml", helpers.escapeHtml);

  /**
   * parseDocNotes - Parse document notes into Q&A sections
   * Usage: {% assign sections = docNotes | parseDocNotes %}
   */
  eleventyConfig.addFilter("parseDocNotes", helpers.parseDocNotes);

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
      output: "_site",
      includes: "_includes"
    },
    templateFormats: ["html", "liquid", "md"],
    htmlTemplateEngine: "liquid"
  };
}
