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

// query/object conversion

export function normalizeQuery(urlSearchParams) {
  const query = Object.fromEntries(urlSearchParams);
  for (const key of Object.keys(query)) {
    query[key] = nullify(query[key].trim());
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

// param objects

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

export function validGlossesOrDefinitions(list) {
  if (Array.isArray(list)) {
    if (list.every((v) =>
      typeof v === 'object' &&
      Object.keys(v).length === 2 &&
      'txt' in v &&
      'language_id' in v &&
      typeof v.txt === 'string' &&
      typeof v.language_id === 'number'
    )) {
      return true;
    }
  }
  return false;
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

// misc

export function boolean(value) {
  return value ? 'yes' : 'no';
}

export function mungeRegex(txt) {
  return txt.replace(/^\*/, '\\*');
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
