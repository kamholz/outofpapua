// primitives

export function nullify(txt) {
  return txt === '' ? null : txt;
}

export function stringify(txt) {
  return txt ?? '';
}

export function isNumber(str) {
  return str.match(/^[0-9]+$/);
}

export function boolean(value) {
  return value ? 'yes' : 'no';
}

// query/object conversion

export function normalizeQuery(urlSearchParams) {
  const query = Object.fromEntries(urlSearchParams);
  for (const key of Object.keys(query)) {
    query[key] = normalizeParam(query[key]);
    if (query[key] === null) {
      delete query[key];
    }
  }
  return query;
}

export function normalizeParam(txt) {
  return nullify(txt.trim());
}

export function optionalQuery(urlSearchParams) {
  const str = urlSearchParams.toString();
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

export function ensureNfcParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      params[key] = params[key].normalize();
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

export function parseArrayParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      params[key] = parseArrayParam(params[key]);
    }
  }
}

export function parseArrayParam(param) {
  return param.split(',');
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

export function parseArrayNumParam(param) {
  return param.split(',')
    .filter((v) => isNumber(v))
    .map((v) => Number(v));
}

export function stripParams(params, iterable) {
  for (const key of iterable) {
    if (key in params) {
      delete params[key];
    }
  }
}

export function stripEmptyArrayParams(params) {
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value) && value.length === 0) {
      delete params[key];
    }
  }
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

export function serializeArrayParam(param) {
  return [...param].join(',');
}

export function partitionPlus(array) {
  // eslint-disable-next-line arrow-body-style
  const [single, plus] = array.reduce(([single, plus], v) => {
    return v.match(/\+$/) ? [single, [...plus, v.replace(/\+$/, '')]] : [[...single, v], plus];
  }, [[], []]);
  return [
    single.filter((v) => isNumber(v)).map((v) => Number(v)),
    plus.filter((v) => isNumber(v)).map((v) => Number(v)),
  ];
}

// authorization

export function adminOrSelf(loggedInUser, userId) {
  // eslint-disable-next-line eqeqeq
  return loggedInUser.admin || loggedInUser.id == userId;
}

export function adminNotSelf(loggedInUser, userId) {
  // eslint-disable-next-line eqeqeq
  return loggedInUser.admin && loggedInUser.id != userId;
}

// gloss formatting and parsing

export function glossesSummary(glosses, preferences) {
  return glosses
    .map((gloss) => glossSummary(gloss, preferences))
    .join('; ');
}

export function glossSummary({ language_name, txt }, preferences) {
  return `‘${joinGlosses(txt)}’` + maybeLanguageName(language_name, preferences);
}

export function glossesSummaryNoLanguage(glosses) {
  return glosses
    .map((gloss) => glossSummaryNoLanguage(gloss))
    .join('; ');
}

export function glossSummaryNoLanguage({ txt }) {
  return `‘${joinGlosses(txt)}’`;
}

export function maybeLanguageName(language_name, preferences) {
  return preferences?.hideGlossLang
    ? ''
    : ` (${language_name})`;
}

export function parseGlosses(param) {
  return param
    .trim()
    .split(/ *[,;] */)
    .filter((v) => v !== '')
    .map((v) => v.normalize());
}

export function joinGlosses(txt) {
  return txt.join(', ');
}

// entry formatting

export function originSummary(entry) {
  let origin = entry.origin ?? 'unknown';
  if (origin === 'borrowed' && entry.origin_language_name) {
    origin += ` from ${entry.origin_language_name}`;
  }
  return origin;
}

// misc

export function mungeRegex(txt) {
  return txt.replace(/^\*/, '\\*');
}

export function mungePos(pos) {
  return pos.replace(/\.$/, '');
}

export function mungeHeadword(txt, proto) {
  if (proto) {
    return txt.match(/^\*/) ? txt : '*' + txt;
  } else {
    return txt.replace(/^\*/, '');
  }
}

export function escapeHtml(txt) {
  return txt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function isIdArray(param) {
  return Array.isArray(param) && param.every((v) => typeof v === 'number');
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

export function showPublicOnly(locals) {
  return locals.user === null;
}
