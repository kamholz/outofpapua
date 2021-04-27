// string and parameter validation

export function nullify(txt) {
  return txt === "" ? null : txt;
}

export function stringify(txt) {
  return txt ?? "";
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
  return str === "" ? "" : '?' + str;
}

export function serializeQuery(query) {
  if (Object.entries(query).length === 0) {
    return "";
  }
  const newQuery = {};
  for (const [key,value] of Object.entries(query)) {
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
  for (const [key,value] of Object.entries(body)) {
    if (set.has(key)) {
      params[key] = value;
    }
  }
  return params;
}

export function parseBooleanParams(query, set) {
  for (const key of set) {
    if (key in query) {
      query[key] = query[key] === '0' ? false : true;
    }
  }
}

export function parseSetParams(query, set) {
  for (const key of set) {
    if (key in query) {
      query[key] = new Set([query[key].split(',')]);
    }
  }
}

export function serializeSetParams(query, set) {
  for (const key of set) {
    if (key in query) {
      query[key] = [...query[key]].join(',');
    }
  }
}

export function stripParams(query, set) {
  for (const key of set) {
    if (key in query) {
      delete query[key];
    }
  }
}

// authorization

export function adminOrSelf(loggedInUser, userId) {
  return loggedInUser.admin || loggedInUser.id == userId;
}

export function adminNotSelf(loggedInUser, userId) {
  return loggedInUser.admin && loggedInUser.id != userId;
}

// misc

export function pageUrl(page) {
  let url = `http://${page.host}${page.path}`;
  if (page.query.values().next().done) { // no query params
    return url;
  } else {
    return url + '?' + page.query.toString();
  }
}

export function boolean(value) {
  return value ? 'yes' : 'no';
}