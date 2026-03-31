const fs = require('fs');
const path = require('path');

const BASE = __dirname;

const cssFiles = [
    'css/styles.css', 'css/explore.css', 'css/categories.css',
    'css/discover.css', 'css/landing.css'
];

const jsFiles = [
    'js/app.js', 'js/explore.js', 'js/discover.js',
    'js/profile.js', 'js/data.js'
];

function stripCSSComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function stripJSComments(src) {
    let result = '';
    let i = 0;
    while (i < src.length) {
        if (src[i] === '"' || src[i] === "'" || src[i] === '`') {
            const q = src[i];
            result += src[i++];
            while (i < src.length) {
                if (src[i] === '\\') { result += src[i++]; result += src[i++]; continue; }
                result += src[i];
                if (src[i] === q) { i++; break; }
                i++;
            }
        } else if (src[i] === '/' && src[i + 1] === '*') {
            i += 2;
            while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
            i += 2;
        } else if (src[i] === '/' && src[i + 1] === '/') {
            i += 2;
            while (i < src.length && src[i] !== '\n') i++;
        } else {
            result += src[i++];
        }
    }
    return result.replace(/\n{3,}/g, '\n\n').trim();
}

[...cssFiles, ...jsFiles].forEach(rel => {
    const fp = path.join(BASE, rel);
    if (!fs.existsSync(fp)) return;
    const src = fs.readFileSync(fp, 'utf8');
    const stripped = rel.endsWith('.css') ? stripCSSComments(src) : stripJSComments(src);
    fs.writeFileSync(fp, stripped + '\n', 'utf8');
});
