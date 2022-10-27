import config from '$config';
import jwt from 'jsonwebtoken';
import { error } from '@sveltejs/kit';
import { isAdmin, isEditor } from './util';
import { knex } from '$lib/db';

export const ACCESS_TOKEN_COOKIE = 'accesstoken';
export const REFRESH_TOKEN_COOKIE = 'refreshtoken';

const COOKIE_OPTIONS = {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: true,
};
export const ACCESS_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: config.ACCESS_TOKEN_LIFE,
};
export const REFRESH_TOKEN_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: config.REFRESH_TOKEN_LIFE,
};

export async function getUser(userId) {
  const row = await knex('usr')
    .first('id', 'username', 'fullname', 'role')
    .where('id', userId);
  return row ?? null;
}

export async function checkUserPassword(username, password) {
  const row = await knex('usr')
    .first('id', 'username', 'fullname', 'role')
    .where({
      username,
      password: knex.raw('pgcrypto.crypt(?, password)', password),
    });
  return row ?? null;
}

export function makeAccessToken(user) {
  return jwt.sign(makePayload(user), config.ACCESS_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.ACCESS_TOKEN_LIFE),
  });
}

export function makeRefreshToken(user) {
  return jwt.sign(makePayload(user), config.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.REFRESH_TOKEN_LIFE),
  });
}

function makePayload(user) {
  return { id: user.id };
}

export function getUserFromAccessToken(accessToken) {
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
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

export function getAccessTokenFromRefreshToken(refreshToken) {
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      return makeAccessToken(payload);
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

export function redirectToRefresh(url) {
  return new Response(null, {
    status: 302,
    headers: {
      location: '/auth/refresh?' + new URLSearchParams({ redirect: url }),
    },
  });
}

export function requireAuth(handler) {
  return (req) => {
    if (!req.locals.user) {
      throw error(401);
    }
    return handler(req);
  };
}

export function requireAdmin(handler) {
  return (req) => {
    if (!isAdmin(req.locals.user)) {
      throw error(401);
    }
    return handler(req);
  };
}

export function requireEditor(handler) {
  return (req) => {
    if (!isEditor(req.locals.user)) {
      throw error(401);
    }
    return handler(req);
  };
}

export function requireComparative(handler) {
  return (req) => {
    if (req.locals.hideComparative) {
      throw error(401);
    }
    return handler(req);
  };
}
