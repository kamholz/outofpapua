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
    let mungedPos = pos;
    if (senses.length === 1 && senses[0].raw_glosses.length === 1) {
      const match = senses[0].raw_glosses[0].match(/^(\((?:transitive|intransitive|demonstrative|stative)\)) (.+)$/);
      if (match) {
        mungedPos += ' ' + match[1];
        senses[0].raw_glosses[0] = match[2];
      }
    }
    console.log(`\\ps ${mungedPos}`);
  }
  for (const [i, sense] of senses.entries()) {
    console.log(`\\sn ${i + 1}`);
    for (const gloss of sense.raw_glosses) {
      console.log(`\\g_Eng ${mungeGloss(gloss)}`);
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
