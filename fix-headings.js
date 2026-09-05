const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/components');
files.push('./src/App.tsx');

let updatedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content.replace(/<(h[1-6])[^>]*className=(["'\{`])([^>"'\}]+)(["'\}`])[^>]*>/g, (match, tag, openQ, classNames, closeQ) => {
    // Replace text-slate-800 and text-slate-900 with text-black
    let newClassNames = classNames.replace(/text-slate-900/g, 'text-black').replace(/text-slate-800/g, 'text-black');
    return match.replace(classNames, newClassNames);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    updatedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Updated ${updatedFiles} files.`);
