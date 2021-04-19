import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import config from '$config';
import knex from '$data/knex';

export async function getUser(userId) {
  const rows = await knex('usr')
    .select('id','username','fullname','admin')
    .where({ id: userId });
  return rows.length ? rows[0] : null;
}

export async function checkUserPassword(username, password) {
  const rows = await knex('usr')
    .select('id','username','fullname','admin')
    .where({
      username: username,
      password: knex.raw('pgcrypto.crypt(?, password)', password)
    });
  return rows.length ? rows[0] : null;
}

export function makeAccessTokenCookie(user) {
  return cookie.serialize('accesstoken', makeAccessToken(user), {
    httpOnly: true,
    maxAge: config.ACCESS_TOKEN_LIFE,
    path: '/',
    sameSite: true,
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
    sameSite: true,
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
  return { id: user.id, admin: user.admin };
}

function contextFromPayload(payload) {
  return { authed: true, admin: payload.admin };
}

export function verifyAccessTokenCookie(cookies) {
  if (cookies.accesstoken) {
    const payload = verifyAccessToken(cookies.accesstoken);
    if (payload) {
      return contextFromPayload(payload);
    }
  }

  return null;
}

function verifyAccessToken(accessToken) {
  try {
    return jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
  } catch (e) {
    console.log(e);
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
    console.log(e);
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
