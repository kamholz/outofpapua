// primitives and validation

export function boolean(value) {
  return value ? 'yes' : 'no';
}

export function isId(param) {
  return /^[1-9][0-9]*$/.test(param);
}

export function isIdArray(param) {
  return Array.isArray(param) && param.every((v) => typeof v === 'number' && Number.isInteger(v) && v > 0);
}

export function nullify(txt) {
  return txt === '' ? null : txt;
}

export function stringify(txt) {
  return txt ?? '';
}

// query/object conversion

export function normalizeParam(txt) {
  return nullify(txt.trim());
}

export function normalizeQuery(searchParams) {
  return Object.fromEntries(
    [...searchParams.entries()]
      .map(([key, value]) => [key, normalizeParam(value)])
      .filter(([, value]) => value !== null)
  );
}

export function optionalQuery(searchParams) {
  const str = searchParams.toString();
  return str === '' ? '' : '?' + str;
}

export function serializeQuery(query) {
  if (Object.entries(query).length === 0) {
    return '';
  }
  const newQuery = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === true) {
      newQuery[key] = '1';
    } else if (value === false) {
      newQuery[key] = '0';
    } else {
      newQuery[key] = value;
    }
  }
  return optionalQuery(new URLSearchParams(newQuery));
}

// param object filtering, parsing, and serialization

export function ensureNfcParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      params[key] = params[key].normalize();
    }
  }
}

export function getFilteredParams(params, set) {
  if (!params) {
    return {};
  }
  const newParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (set.has(key)) {
      newParams[key] = value;
    }
  }
  return newParams;
}

export function parseArrayNumParam(param) {
  return param.split(',')
    .filter((v) => isId(v))
    .map((v) => Number(v));
}

export function parseArrayNumParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      params[key] = parseArrayNumParam(params[key]);
      if (!params[key].length) {
        delete params[key];
      }
    }
  }
}

export function parseArrayParam(param) {
  return param.split(',');
}

export function parseArrayParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      params[key] = parseArrayParam(params[key]);
    }
  }
}

export function parseBooleanParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      params[key] = params[key] !== '0';
    }
  }
}

export function partitionPlus(array) {
  // eslint-disable-next-line arrow-body-style
  const [single, plus] = array.reduce(([single, plus], v) => {
    return v.match(/\+$/) ? [single, [...plus, v.replace(/\+$/, '')]] : [[...single, v], plus];
  }, [[], []]);
  return [
    single.filter((v) => isId(v)).map((v) => Number(v)),
    plus.filter((v) => isId(v)).map((v) => Number(v)),
  ];
}

export function serializeArrayParam(param) {
  return [...param].join(',');
}

export function serializeArrayParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      if (params[key].length) {
        params[key] = serializeArrayParam(params[key]);
      } else {
        delete params[key];
      }
    }
  }
}

export function splitParams(params, set) {
  const splitParams = {};
  for (const key of Object.keys(params)) {
    if (set.has(key)) {
      splitParams[key] = params[key];
      delete params[key];
    }
  }
  return splitParams;
}

export function stripEmptyArrayParams(params) {
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value) && value.length === 0) {
      delete params[key];
    }
  }
}

export function stripParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      delete params[key];
    }
  }
}

// authorization and handlers

export function adminNotSelf(loggedInUser, userId) {
  return isAdmin(loggedInUser) && loggedInUser.id != userId; // eslint-disable-line eqeqeq
}

export function adminOrSelf(loggedInUser, userId) {
  return isAdmin(loggedInUser) || loggedInUser.id == userId; // eslint-disable-line eqeqeq
}

export function isAdmin(loggedInUser) {
  return loggedInUser?.role === 'admin';
}

export function isEditor(loggedInUser) {
  return ['admin', 'editor'].includes(loggedInUser?.role);
}

// gloss formatting and parsing

export function glossesSummary(glosses, preferences) {
  return glosses
    .map((gloss) => glossSummary(gloss, preferences))
    .join('; ');
}

export function glossSummary({ language_code, txt }, preferences) {
  return `‘${joinGlosses(txt)}’` + maybeLanguageName(language_code, preferences);
}

export function glossesSummaryNoLanguage(glosses) {
  return glosses
    .map((gloss) => glossSummaryNoLanguage(gloss))
    .join('; ');
}

export function glossSummaryNoLanguage({ txt }) {
  return `‘${joinGlosses(txt)}’`;
}

export function joinGlosses(txt) {
  return txt.join(', ');
}

export function truncateGloss(txt, maxLength) {
  if (txt.length <= maxLength) {
    return { gloss: txt, truncated: false };
  }
  for (let i = maxLength; i > 0; i--) {
    if (txt[i] === ' ') {
      const gloss = txt.slice(0, i);
      if (i + 1 < txt.length && (txt[i + 1] === '(' || txt[i + 1] === '[')) {
        return { gloss, truncated: false };
      } else {
        return { gloss, truncated: true };
      }
    }
  }
  return { gloss: txt.slice(0, maxLength), truncated: true };
}

export function maybeGloss(senses) {
  return senses[0]?.glosses[0]?.txt[0]
    ? ` ‘${senses[0]?.glosses[0]?.txt[0]}’`
    : '';
}

export function maybeEngGlosses(senses) {
  const senseGlosses = senses.map(({ glosses }) => glosses?.[0]?.txt)
    .filter((txt) => txt);
  return senseGlosses.length
    ? ' ' + senseGlosses.map((txt) => `‘${joinGlosses(txt)}’`).join('; ')
    : '';
}

export function maybeLanguageName(language_code, preferences) {
  return language_code && preferences?.showGlossLang
    ? ` (${language_code})`
    : '';
}

export function parseGlosses(param) {
  return param
    .trim()
    .split(/ *[,;] */)
    .filter((v) => v !== '')
    .map((v) => v.normalize());
}

// entry formatting

export function matchReflex(reflex) {
  const match = reflex.match(/^(.*)\|(.+)\|(.*)$/);
  if (match) {
    return match.slice(1);
  } else {
    return ['', reflex, ''];
  }
}

export function formatReflexIpa(reflex, headword_ipa, func) {
  // eslint-disable-next-line eqeqeq
  if (reflex == null) {
    return ['', headword_ipa, ''];
  }

  const [before, reflexProper, after] = (() => {
    const [b, rp, a] = matchReflex(reflex);
    // remove infix marking
    return [b, rp.replace(/<<|>>/g, ''), a];
  })().map((v) => v.length ? func(v) : v);

  if ((!before.length || headword_ipa.startsWith(before)) && (!after.length || headword_ipa.endsWith(after))) {
    return [before, headword_ipa.slice(before.length, headword_ipa.length - after.length), after];
  } else {
    return [before, reflexProper, after];
  }
}

export function formatInfix(reflexProper) {
  let html = '';
  let infix = false;
  for (const txt of reflexProper.split(/<<|>>/)) {
    if (infix) {
      html += `<span class="infix">‹${escapeHtml(txt)}›</span>`;
    } else if (txt.length) {
      html += escapeHtml(txt);
    }
    infix = !infix;
  }
  return html;
}

export function originSummary(entry) {
  let origin = entry.origin ?? 'unspecified';
  if (origin === 'borrowed' && entry.origin_language_name) {
    origin += ` from ${entry.origin_language_name}`;
  }
  return origin;
}

// misc

export function capitalizeFirstLetter(txt) {
  return txt[0].toUpperCase() + txt.slice(1);
}

export async function checkError(res, message) {
  if (!res.ok) {
    if (res.status === 400) {
      throw new Error(message + ': ' + (await res.json()).error);
    } else {
      throw new Error(message);
    }
  }
}

export function escapeDiacritics(txt) {
  return txt
    .replace(/\p{M}/gu, (match) => '\\u' + ('0000' + match.codePointAt(0).toString(16)).slice(-4));
}

export function unescapeUnicode(txt) {
  return txt
    .replace(/\\u([a-zA-Z0-9]{4})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)));
}

export function escapeHtml(txt) {
  return txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formDisplayValue(value, type) {
  if (type === 'checkbox') {
    return boolean(value);
  } else {
    return stringify(value);
  }
}

export function hideComparativeInEntry(entry) {
  entry.origin = null;
  for (const prop of ['origin_language_id', 'origin_language_name', 'set_ids']) {
    if (prop in entry) {
      entry[prop] = null;
    }
  }
}

export function mungeHeadword(txt, proto) {
  if (proto) {
    return txt.match(/^\*/) ? txt : '*' + txt;
  } else {
    return txt.replace(/^\*/, '');
  }
}

export function mungePos(pos) {
  return pos.replace(/\.$/, '');
}

export function mungeRegex(txt) {
  return txt.replace(/^\*/, '\\*');
}

export function degrHyphenRegex(txt) {
  return txt.replace(/([^[\]]*)(\[[^[\]]+\])?/g,
    (_, p1 = '', p2 = '') => p1.replace(/-/g, '') + p2
  );
}

export function parseLanguageLocation(language) {
  const match = language.location.match(/^\((.+),(.+)\)$/);
  language.location = match
    ? [Number(match[1]), Number(match[2])]
    : null;
}

export function showPublicOnly(locals) {
  return locals.user === null;
}

export function sortFunction(fn) {
  return (a, b) => {
    const aSort = fn(a);
    const bSort = fn(b);
    if (aSort < bSort) {
      return -1;
    } else if (aSort > bSort) {
      return 1;
    } else {
      return 0;
    }
  };
}

export function toolboxMarkup(text) {
  return escapeHtml(text)
    .replace(/\bf[iv]:(.+?)(?= |$)/g, wrapEm)
    .replace(/\|f[iv]?\{(.+?)\}/g, wrapEm);

  function wrapEm(_, p1) {
    return `<em>${p1}</em>`;
  }
}

export function jsonError(error) {
  return new Response(JSON.stringify({ error }), {
    status: 400,
    headers: {
      'content-type': 'application/json',
    },
  });
}
