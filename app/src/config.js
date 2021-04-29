import path from 'path';
import dotenv from 'dotenv';

const env = {};

load('.env');
//load('.env.local');
load(`.env.${import.meta.env.MODE}`);
//load(`.env.${import.meta.env.MODE}.local`);

function load(filename) {
  const result = dotenv.config({ path: path.resolve(process.cwd(), filename) });
  if (!result.error) {
    for (const [key, value] of Object.entries(result.parsed)) {
      env[key] = value;
    }
  }
}

export default env;
