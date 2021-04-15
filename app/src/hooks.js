import cookie from 'cookie';
import config from '$config';
import * as auth from '$db/auth';

export async function getContext({ headers }) {
  const context = {};
  let userId;

  const cookies = cookie.parse(headers.cookie || '');
  if (cookies.jwt) {
    userId = auth.verifyAccessToken(cookies.jwt);
  } else {
    console.log("no access token");
  }

  //const user = await auth.getUser(userId);

  // return {
  //   user: (await db.get_user(cookies.session_id)) || { guest: true }
  // };
  return context;
}

export function getSession({ context }) {
  return {};
}
