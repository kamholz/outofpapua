const defaultMarkers = Object.fromEntries(
  [
    'an',
    'cf',
    'd',
    'ee',
    'et',
    'g',
    'lc',
    'lx',
    'mr',
    'nt',
    'ps',
    'r',
    'rf',
    'sc',
    'sd',
    'se',
    'sn',
    'so',
    'sy',
    'ue',
    'va',
    'x',
    'xv',
  ].map((v) => [v, new Set([v])])
);

const defaultMarkerConversion = {
  de: 'd_Eng',
  ge: 'g_Eng',
  re: 'r_Eng',
  xe: 'x_Eng',
};

const langMarkerKey = {
  d: 'definition',
  g: 'gloss',
  r: 'reverse',
};
const langMarkers = Object.keys(langMarkerKey).sort();

const entryMarkerKey = {
  an: 'antonym',
  cf: 'crossref',
  ee: 'encyclopedic',
  et: 'etymology',
  lc: 'citation',
  mr: 'morph',
  nt: 'note',
  rf: 'reference',
  sc: 'scientific',
  sd: 'domain',
  so: 'source',
  sy: 'synonym',
  ue: 'usage',
  va: 'variant',
};
const entryMarkers = Object.keys(entryMarkerKey).sort();

export function parseRecord(record) {
  // const { formatting } = record.source;
  const markers = getMarkers();
  const markerConversion = getMarkerConversion();
  const output = {};

  let entry = output;
  let sense, example;
  let state = 'entry';

  for (const [m, value] of record.data) {
    const [marker, lang] = getMarkerLang(m);

    if (markers.lx.has(marker)) {
      pushKey(entry, 'headword', value);
    } else if (markers.se.has(marker)) {
      if (state !== 'subentry') {
        entry = {};
        pushKey(output, 'subentry', entry);
        state = 'subentry';
      }
      pushKey(entry, 'headword', value);
    } else {
      if (state === 'entry' || state === 'subentry') {
        state = 'post-entry';
      }

      if (state === 'example') {
        if (markers.x.has(marker)) {
          push(example, [value, lang]);
        } else {
          state = 'sense';
        }
      }

      if (markers.ps.has(marker)) {
        if (state === 'post-entry') {
          entry.pos = value;
        } else {
          sense.pos = value;
        }
      } else if (markers.sn.has(marker)) {
        addSense(true);
      } else if (markers.xv.has(marker)) {
        addSense(false);
        addExample();
        push(example, value);
      } else {
        for (const m of langMarkers) {
          if (markers[m].has(marker)) {
            addSense(false);
            const key = langMarkerKey[m];
            addKey(sense, key);
            pushKey(sense[key], lang, value);
            break;
          }
        }

        for (const m of entryMarkers) {
          if (markers[m].has(marker)) {
            pushKey(entry, entryMarkerKey[m], value);
            break;
          }
        }
      }
    }
  }

  return output;

  function getMarkers() {
    return defaultMarkers;
  }

  function getMarkerConversion() {
    return defaultMarkerConversion;
  }

  function getMarkerLang(marker) {
    if (marker in markerConversion) {
      marker = markerConversion[marker];
    }
    let lang = null;
    const match = marker.match(/^([a-z]+)_([A-Z][a-z]{2})$/);
    if (match) {
      /* eslint-disable prefer-destructuring */
      marker = match[1];
      lang = match[2].toLowerCase();
    }
    return [marker, lang];
  }

  function pushKey(obj, key, value) {
    if (!(key in obj)) {
      obj[key] = [];
    }
    obj[key].push(value);
  }

  function push(obj, value) {
    if (obj) {
      obj.push(value);
    }
  }

  function addKey(obj, key) {
    if (!(key in obj)) {
      obj[key] = {};
    }
  }

  function addSense(force) {
    if (force || state === 'post-entry') {
      sense = {};
      pushKey(entry, 'sense', sense);
      state = 'sense';
    }
  }

  function addExample() {
    example = [];
    pushKey(sense, 'example', example);
    state = 'example';
  }
}

export function langMarkerSorted(marker) {
  const sorted = [];
  if ('eng' in marker) {
    push('eng');
    delete marker.eng;
  }
  for (const key of Object.keys(marker).sort()) {
    push(key);
  }
  return sorted;

  function push(lang) {
    sorted.push([marker[lang], lang]);
  }
}
