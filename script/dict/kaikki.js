#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

parse(process.argv[2]);

function parse(path) {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({ input: fileStream });
  rl.on('line', (line) => {
    convertEntry(JSON.parse(line));
  });
  // rl.on('close', () => {
  // });
}

function convertEntry(entry) {
  const { etymology_text, pos, senses, sounds, word } = entry;

  console.log(`\\lx ${word}`);
  const ipa = sounds?.[0]?.ipa;
  if (ipa) {
    console.log(`\\ph ${ipa}`);
  }
  if (pos) {
    console.log(`\\ps ${pos}`);  
  }
  for (const [i, sense] of senses.entries()) {
    console.log(`\\sn ${i + 1}`);
    const glosses  = sense.raw_glosses.map(mungeGloss);
    for (const gloss of glosses) {
      console.log(`\\g_Eng ${gloss}`);
    }
  }
  if (etymology_text) {
    console.log(`\\et ${etymology_text}`);
  }
  console.log('');
}

function mungeGloss(gloss) {
  return gloss.replace(/^(\(.+?\)) (.+)$/, '$2 $1');
}