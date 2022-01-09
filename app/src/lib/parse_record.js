import { capitalizeFirstLetter } from '$lib/util';

const nationalRegionalMarkers = ['c', 'd', 'g', 'r', 'v', 'x'];

const defaultMarkerConversion = Object.fromEntries(
  nationalRegionalMarkers.map((m) => [`${m}e`, `${m}_Eng`])
);

const langMarker = {
  d: 'definition',
  g: 'gloss',
  r: 'reverse',
};

const senseMarker = {
  lt: 'literal',
  nt_sn: 'note',
};

const multiMarker = {
  crossref: { form: 'cf', trans: 'c', level: 'entry' },
  example: { form: 'xv', trans: 'x', level: 'sense' },
  variant: { form: 'va', trans: 'v', level: 'entry' },
};
const multiMarkerForm = Object.fromEntries(
  Object.keys(multiMarker).map((state) => [multiMarker[state].form, state])
);

const entryMarker = {
  an: 'antonym',
  ee: 'encyclopedic',
  et: 'etymology',
  lc: 'citation',
  mr: 'morph',
  na: 'anthro',
  nd: 'discourse',
  ng: 'grammar',
  np: 'phono',
  nq: 'question',
  ns: 'socio',
  nt: 'note',
  pl: 'plural',
  rf: 'reference',
  sc: 'scientific',
  sd: 'domain',
  sg: 'singular',
  so: 'source',
  sy: 'synonym',
  ue: 'usage',
};

const entryMarkerArray = {
  mn: 'crossref',
};

export function parseRecord(data, formatting) {
  const markerConversion = getMarkerConversion();
  const output = {};

  let entry = output;
  let sense, multi;
  let state = 'entry';
  let savedState;

  marker:
  for (const [m, value] of data) {
    const [marker, lang] = getMarkerLang(m);

    if (marker === 'lx') {
      pushKey(entry, 'headword', value);
    } else if (marker === 'se') {
      if (state !== 'subentry') {
        entry = {};
        pushKey(output, 'subentry', entry);
        state = 'subentry';
      }
      pushKey(entry, 'headword', value);
    } else {
      if (state === 'entry' || state === 'subentry') {
        state = 'post-entry';
      } else if (state in multiMarker) {
        if (marker === multiMarker[state].trans) {
          push(multi, [value, lang]);
          continue marker;
        } else {
          state = savedState;
        }
      }

      if (marker === 'ps') {
        if (state === 'post-entry') {
          entry.pos = value;
        } else {
          // fix missing \sn markers
          if (entry.pos !== undefined && ['definition', 'example', 'gloss', 'reverse'].some((v) => v in sense)) {
            sense.pos = entry.pos;
            delete entry.pos;
            addSense(true);
          }
          sense.pos = value;
        }
      } else if (marker === 'sn') {
        addSense(true);
      } else if (marker === 'ph') {
        entry.ph = value;
      } else if (marker in multiMarkerForm) {
        const newState = multiMarkerForm[marker];
        savedState = state;
        state = newState;
        const { level } = multiMarker[state];
        if (level === 'sense') {
          addSense(false);
        }
        multi = [];
        pushKey(level === 'sense' ? sense : entry, state, multi);
        push(multi, value);
      } else if (marker in langMarker) {
        addSense(false);
        const key = langMarker[marker];
        addKey(sense, key);
        pushKey(sense[key], lang, value);
      } else if (marker in senseMarker) {
        addSense(false);
        pushKey(sense, senseMarker[marker], value);
      } else if (marker in entryMarker) {
        pushKey(entry, entryMarker[marker], value);
      } else if (marker in entryMarkerArray) { // stored in same key as multi item, but with no translations
        pushKey(entry, entryMarker[marker], [value]);
      }
    }
  }

  fixPos(output);
  if (output.subentry) {
    for (const sub of output.subentry) {
      fixPos(sub);
    }
  }

  return output;

  function getMarkerConversion() {
    const markerConversion = { ...defaultMarkerConversion };
    if (formatting) {
      if (formatting.markerConversion) {
        Object.assign(markerConversion, formatting.markerConversion);
      }
      if (formatting.langNational) {
        const lang = capitalizeFirstLetter(formatting.langNational);
        Object.assign(markerConversion, Object.fromEntries(
          nationalRegionalMarkers.map((m) => [`${m}n`, `${m}_${lang}`])
        ));
      }
      if (formatting.langRegional) {
        const lang = capitalizeFirstLetter(formatting.langRegional);
        Object.assign(markerConversion, Object.fromEntries(
          nationalRegionalMarkers.map((m) => [`${m}r`, `${m}_${lang}`])
        ));
      }
    }
    return markerConversion;
  }

  function getMarkerLang(marker) {
    let lang = null;
    if (marker in markerConversion) {
      marker = markerConversion[marker];
    }
    const match = marker.match(/^([a-z]+)_([A-Z][a-z]{2})$/);
    if (match) {
      marker = match[1]; // eslint-disable-line prefer-destructuring
      lang = match[2].toLowerCase();
    }
    if (marker in markerConversion) {
      marker = markerConversion[marker];
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

  function fixPos(entry) {
    if (entry.pos && entry.sense) {
      for (const s of entry.sense) {
        if (!s.pos) {
          s.pos = entry.pos;
        }
      }
    }
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
