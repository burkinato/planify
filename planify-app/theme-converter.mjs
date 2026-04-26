import fs from 'fs';
import path from 'path';

const EDITOR_DIR = path.join(process.cwd(), 'src/components/editor');
const DASHBOARD_DIR = path.join(process.cwd(), 'src/app/dashboard');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Create a mapping dictionary for replacements
  const replacements = [
    { from: /bg-surface-950/g, to: 'bg-slate-50' },
    { from: /bg-surface-900/g, to: 'bg-white' },
    { from: /bg-surface-800/g, to: 'bg-white border-slate-200' },
    { from: /bg-surface-700/g, to: 'bg-slate-100' },
    { from: /border-surface-600/g, to: 'border-slate-200' },
    { from: /border-surface-500/g, to: 'border-slate-300' },
    { from: /border-white\/5/g, to: 'border-slate-200' },
    { from: /text-surface-500/g, to: 'text-slate-400' },
    { from: /text-surface-400/g, to: 'text-slate-500' },
    { from: /text-surface-300/g, to: 'text-slate-600' },
    { from: /text-surface-200/g, to: 'text-slate-700' },
    { from: /shadow-inner/g, to: 'shadow-sm' },
    { from: /glass/g, to: 'bg-white border-slate-200' }
  ];

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  // Handle text-white specifically to avoid breaking primary buttons
  // Split into lines to be more careful
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    // If line has 'accent-indigo' or 'safety-red', it's likely a primary button, keep text-white
    if (line.includes('bg-accent-indigo') || line.includes('from-accent-indigo') || line.includes('bg-safety-red')) {
      return line;
    }
    // Otherwise replace text-white with text-slate-800
    return line.replace(/text-white/g, 'text-slate-800');
  });

  content = newLines.join('\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${filePath}`);
}

const editorFiles = fs.readdirSync(EDITOR_DIR).filter(f => f.endsWith('.tsx'));
editorFiles.forEach(f => processFile(path.join(EDITOR_DIR, f)));

processFile(path.join(DASHBOARD_DIR, 'page.tsx'));
processFile(path.join(DASHBOARD_DIR, 'layout.tsx'));
