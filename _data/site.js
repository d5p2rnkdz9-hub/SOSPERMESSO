const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Content-hash of the JS/CSS assets so we can append ?v=<hash> to their <link>/<script>
// tags. Any change to these files changes the hash, which busts the browser cache —
// no more stale app.js / components.css served alongside fresh HTML.
function assetVersion() {
  const files = [
    'src/scripts/app.js',
    'src/scripts/mobile.js',
    'src/scripts/prassi.js',
    'src/scripts/chatbot.js',
    'src/scripts/legale-db.js',
    'src/styles/main.css',
    'src/styles/components.css',
    'src/styles/mobile.css',
    'src/styles/mobile-fix.css',
    'src/styles/animations.css',
    'src/styles/rtl.css',
    'src/styles/cjk.css',
    'src/styles/bengali.css',
    'src/styles/document-page.css',
    'src/styles/prassi.css',
    'src/styles/chatbot.css',
    'src/styles/legale.css',
  ];
  const hash = crypto.createHash('md5');
  for (const f of files) {
    try {
      hash.update(fs.readFileSync(path.join(__dirname, '..', f)));
    } catch (e) {
      // ignore missing files
    }
  }
  return hash.digest('hex').slice(0, 8);
}

module.exports = {
  name: "SOS Permesso",
  url: "https://www.sospermesso.it",
  year: new Date().getFullYear(),
  defaultDescription: "Guida completa ai permessi di soggiorno in Italia",
  assetVersion: assetVersion()
};
