const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else {
            if (dirFile.endsWith('.html') || dirFile.endsWith('.js') || dirFile.endsWith('.css')) {
                filelist.push(dirFile);
            }
        }
    });
    return filelist;
};

const files = walkSync('d:/ETF-Project/frontend');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove emojis (keeping basic text and punctuation)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F251}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu;
    content = content.replace(emojiRegex, '');

    // Specifically for style.css: remove gradients
    if (file.endsWith('.css')) {
        content = content.replace(/background:\s*linear-gradient\([^)]+\);/g, 'background: var(--primary);');
        content = content.replace(/background:\s*linear-gradient\([^)]+\)/g, 'background: var(--primary)');
        content = content.replace(/-webkit-background-clip:\s*text;/g, '');
        content = content.replace(/-webkit-text-fill-color:\s*transparent;/g, '');
        content = content.replace(/background-clip:\s*text;/g, '');
    }
    
    // Specifically for index.html inline gradients
    if (file.endsWith('index.html') || file.endsWith('delete.html')) {
        content = content.replace(/background:linear-gradient\([^)]+\);?/g, 'background:var(--primary);');
    }

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Done stripping emojis and gradients.');
