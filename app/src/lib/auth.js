import config from '$config';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { knex } from '$lib/db';

const scheme = config.HTTP_SCHEME || 'http';

export async function getUser(userId) {
  const row = await knex('usr')
    .first('id', 'username', 'fullname', 'admin')
    .where('id', userId);
  return row ?? null;
}

export async function checkUserPassword(username, password) {
  const row = await knex('usr')
    .first('id', 'username', 'fullname', 'admin')
    .where({
      username,
      password: knex.raw('pgcrypto.crypt(?, password)', password),
    });
  return row ?? null;
}

export function makeAccessTokenCookie(user) {
  return cookie.serialize('accesstoken', makeAccessToken(user), {
    httpOnly: true,
    maxAge: config.ACCESS_TOKEN_LIFE,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });
}

function makeAccessToken(user) {
  return jwt.sign(makePayload(user), config.ACCESS_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.ACCESS_TOKEN_LIFE),
  });
}

export function makeRefreshTokenCookie(user) {
  return cookie.serialize('refreshtoken', makeRefreshToken(user), {
    httpOnly: true,
    maxAge: config.REFRESH_TOKEN_LIFE,
    path: '/',
    sameSite: 'lax',
    secure: true,
  });
}

function makeRefreshToken(user) {
  return jwt.sign(makePayload(user), config.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.REFRESH_TOKEN_LIFE),
  });
}

function makePayload(user) {
  return { id: user.id };
}

export function verifyAccessTokenCookie(cookies) {
  if (cookies.accesstoken) {
    const payload = verifyAccessToken(cookies.accesstoken);
    if (payload) {
      return getUser(payload.id);
    }
  }

  return null;
}

function verifyAccessToken(accessToken) {
  try {
    return jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
  } catch (e) {
    //console.log(e);
    return null;
  }
}

export function makeAccessTokenCookieFromRefreshToken(cookies) {
  if (cookies.refreshtoken) {
    const payload = verifyRefreshToken(cookies.refreshtoken);
    if (payload) {
      return makeAccessTokenCookie(payload);
    }
  }

  return null;
}

function verifyRefreshToken(refreshToken) {
  try {
    return jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
  } catch (e) {
    //console.log(e);
    return null;
  }
}

export function makeExpiredCookies() {
  return [makeExpiredCookie('accesstoken'), makeExpiredCookie('refreshtoken')];
}

function makeExpiredCookie(name) {
  return cookie.serialize(name, '', {
    expires: new Date(0),
    httpOnly: true,
    path: '/',
    sameSite: true,
    secure: true,
  });
}

export function redirectToRefresh(request) {
  return {
    status: 302,
    headers: {
      location: '/auth/refresh?' + new URLSearchParams({ redirect: pageUrl(request) }),
    },
  };
}

function pageUrl(page) {
  const url = `${scheme}://${page.host}${page.path}`;
  if (page.query.values().next().done) { // no query params
    return url;
  } else {
    return url + '?' + page.query.toString();
  }
}

export function requireAuth(handler) {
  return (req) => {
    if (!req.locals.user) {
      return { status: 401 };
    }
    return handler(req);
  };
}

export function requireAdmin(handler) {
  return (req) => {
    if (!req.locals.user?.admin) {
      return { status: 401 };
    }
    return handler(req);
  };
}

export function requireComparative(handler) {
  return (req) => {
    if (req.locals.hideComparative) {
      return { status: 401 };
    }
    return handler(req);
  };
}
