import dotenv from 'dotenv';
import path from 'path';

const env = {};
load('.env');

function load(filename) {
  const result = dotenv.config({ path: path.resolve(process.cwd(), filename) });
  if (!result.error) {
    Object.assign(env, result.parsed);
  }
}

export default env;
