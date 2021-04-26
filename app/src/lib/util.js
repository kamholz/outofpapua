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

export function serializeQuery(query) {
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
  return new URLSearchParams(newQuery);
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

export function setBooleanParams(query, set) {
  for (const key of set) {
    if (key in query) {
      query[key] = query[key] === '0' ? false : true;
    }
  }
}

// pagination and sorting

const pageMax = 1000;

export function applyPageParams(q, query) {
  const pagesize = Math.min(query.pagesize, pageMax);
  let page = Number(query.page);
  if (page < 1) {
    page = 1;
  }

  q.limit(pagesize);
  if (page > 1) {
    q.offset((page-1) * pagesize);
  }
}

export function applySortParams(q, query, sortCols, restCols) {
  const querySort = 'sort' in query && query.sort in sortCols && query.sort;
  if (querySort) {
    q.orderByRaw(sortCols[querySort] + (query.asc ? ' asc' : ' desc'));
  }
  for (const col of restCols) {
    if (col !== querySort) {
      q.orderByRaw(sortCols[col]);
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