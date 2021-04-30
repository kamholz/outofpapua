// string and parameter validation

export function nullify(txt) {
  return txt === '' ? null : txt;
}

export function stringify(txt) {
  return txt ?? '';
}

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

export function getFilteredParams(body, set) {
  if (!body) {
    return {};
  }
  const params = {};
  for (const [key, value] of Object.entries(body)) {
    if (set.has(key)) {
      params[key] = value;
    }
  }
  return params;
}

export function parseBooleanParams(query, set) {
  for (const key of set) {
    if (key in query) {
      query[key] = query[key] !== '0';
    }
  }
}

export function parseArrayParams(query, iterable) {
  for (const key of iterable) {
    if (key in query) {
      query[key] = parseArrayParam(query[key]);
    }
  }
}

export function parseArrayParam(param) {
  return param.split(',');
}

export function parseArrayNumParams(query, iterable) {
  for (const key of iterable) {
    if (key in query) {
      query[key] = parseArrayNumParam(query[key]);
      if (!query[key].length) {
        delete query[key];
      }
    }
  }
}

export function parseArrayNumParam(param) {
  return param.split(',')
    .filter((v) => isNumber(v))
    .map((v) => Number(v));
}

export function serializeArrayParams(query, iterable) {
  for (const key of iterable) {
    if (key in query) {
      if (query[key].length) {
        query[key] = serializeArrayParam(query[key]);
      } else {
        delete query[key];
      }
    }
  }
}

export function serializeArrayParam(param) {
  return [...param].join(',');
}

export function stripParams(query, set) {
  for (const key of set) {
    if (key in query) {
      delete query[key];
    }
  }
}

export function isNumber(str) {
  return str.match(/^[0-9]+$/);
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

// misc

export function boolean(value) {
  return value ? 'yes' : 'no';
}
