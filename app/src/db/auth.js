import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import config from '$config';
import knex from '$db/knex';

export async function getUser(userId) {
  const rows = await knex('usr')
    .select('id','fullname','admin')
    .where({ id: userId });
  return rows.length ? rows[0] : null;
}

export async function checkUserPassword(username, password) {
  const rows = await knex('usr')
    .select('id','fullname','admin')
    .where({
      username: username,
      password: knex.raw('crypt(?, password)', password)
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

export function makeAndStoreRefreshToken(userId) {
  const payload = makePayload(userId);
  const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: Number(config.REFRESH_TOKEN_LIFE)
  });
  storeRefreshToken(userId, refreshToken);
  return refreshToken;
}

function storeRefreshToken(userId, refreshToken) {
  knex('usr_token').insert({
    usr_id: userId,
    refresh_token: refreshToken
  }).then(() => {});
}

function makePayload(userId) {
  return { loggedInAs: userId };
}

export function verifyAccessToken(accessToken) {
  try {
    const payload = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);
    return payload.loggedInAs;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function verifyRefreshToken(refreshToken) {
  try {
    const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    return payload.loggedInAs;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function makeAccessTokenCookie(accessToken) {
  return cookie.serialize('jwt', accessToken, {
    httpOnly: true,
    maxAge: config.ACCESS_TOKEN_LIFE,
    path: '/',
    sameSite: true,
    secure: true,
  });
}

export function makeRefreshTokenCookie(refreshToken) {
  return cookie.serialize('jwt_refresh', refreshToken, {
    httpOnly: true,
    maxAge: config.REFRESH_TOKEN_LIFE,
    path: '/',
    sameSite: true,
    secure: true,
  });
}
