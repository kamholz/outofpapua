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

export function makeAccessToken(userId) {
  const payload = makePayload(userId);
  return jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.ACCESS_TOKEN_LIFE)
  });
}

export function makeRefreshToken(userId) {
  const payload = makePayload(userId);
  const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.REFRESH_TOKEN_LIFE)
  });
  return refreshToken;
}

function makePayload(userId) {
  return { loggedInAs: userId };
}

export function verifyAccessToken(accessToken) {
  try {
    const payload = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
    return payload.loggedInAs;
  } catch (e) {
    return null;
  }
}

export function verifyRefreshToken(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    return payload.loggedInAs;
  } catch (e) {
    return null;
  }
}

export function makeAccessTokenCookie(accessToken) {
  return cookie.serialize('accesstoken', accessToken, {
    httpOnly: true,
    maxAge: config.ACCESS_TOKEN_LIFE,
    path: '/',
    sameSite: true,
    secure: true,
  });
}

export function makeRefreshTokenCookie(refreshToken) {
  return cookie.serialize('refreshtoken', refreshToken, {
    httpOnly: true,
    maxAge: config.REFRESH_TOKEN_LIFE,
    path: '/',
    sameSite: true,
    secure: true,
  });
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
