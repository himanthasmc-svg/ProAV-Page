import fs from 'fs';
import path from 'path';
import esbuild from 'esbuild';

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// Ensure three-bundle.min.js is built in public/
if (!fs.existsSync('public/three-bundle.min.js')) {
  try {
    esbuild.buildSync({
      stdin: {
        contents: "import * as THREE from 'three'; import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; window.THREE = THREE; window.THREE.OrbitControls = OrbitControls;",
        resolveDir: '.'
      },
      bundle: true,
      minify: true,
      outfile: 'public/three-bundle.min.js'
    });
    console.log('Built public/three-bundle.min.js successfully');
  } catch (e) {
    console.warn('Could not bundle three:', e);
  }
}

const avStyles = fs.readFileSync('src/av-styles.css', 'utf8');

const scripts = [
  'src/scripts/core.js',
  'src/scripts/tab1.js',
  'src/scripts/tab_ifpd.js',
  'src/scripts/tab2.js',
  'src/scripts/tab3_4_5.js',
  'src/scripts/tab6_7.js',
  'src/scripts/tab8_9.js',
  'src/scripts/tab10.js',
  'src/scripts/workspace_and_pdf.js'
].map(file => fs.readFileSync(file, 'utf8')).join('\n\n');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// Replace link to av-styles.css with inline style
const styleTag = `<style>\n${avStyles}\n</style>`;
indexHtml = indexHtml.replace('<link rel="stylesheet" href="/src/av-styles.css">', styleTag);

// Replace script tags with single inline script (using function replacement to avoid $& / $' patterns expanding inside script code)
const scriptTagsRegex = /<!-- Applet Core & Studio Scripts -->[\s\S]*?<\/body>/;
const inlineScriptBlock = `<script>\n${scripts}\n</script>\n</body>`;
indexHtml = indexHtml.replace(scriptTagsRegex, () => inlineScriptBlock);

fs.writeFileSync('public/pro_av_system_architect.html', indexHtml, 'utf8');
console.log('Successfully bundled public/pro_av_system_architect.html. Size:', indexHtml.length, 'bytes');
