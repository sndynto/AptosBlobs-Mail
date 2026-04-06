const fs = require('fs');
try {
  let text = fs.readFileSync('src/LandingPage.tsx', 'utf8');
  const replacements = {
      'â¬¡': '⬡',
      'â›“': '⛓️',
      'ðŸ”’': '🔒',
      'ðŸ“¬': '📬',
      'âœ‰': '✉️',
      'â†’': '→',
      'Ã—': '×',
      'â†—': '↗',
      'âœ…': '✅',
      'ðŸ” ': '🔒',
      'ðŸ”‘': '🔑',
      'ðŸ›¡': '🛡️',
      'âš¡': '⚡',
      'ðŸ¦Š': '🦊',
      'â€”': '—',
      'â€¢': '•',
      'Â·': '·',
      'ðŸŒ ': '🌍',
      'âž¤': '➤',
      'x"': '⏳',
      'x }': '📎',
      '': '”' // Generic corrupted character fallback catch if needed, though risky. Better omit.
  };

  // Safe manual array of exact corrupted characters we know
  for (const [k, v] of Object.entries(replacements)) {
      if (k !== '') text = text.split(k).join(v);
  }

  // Handle the specific one from screenshot like Ã°Å¸â€œ¥ -> 📥
  // Actually, sometimes the exact corruption string matches differently.
  text = text.split('Ã°Å¸â€œ¥').join('📥');

  fs.writeFileSync('src/LandingPage.tsx', text, 'utf8');
  console.log('Successfully fixed encoding for LandingPage.tsx');
} catch (e) {
  console.error(e);
}
