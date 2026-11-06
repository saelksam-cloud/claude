import { handle } from '../../lib/app.js';

export default (req) => handle(req);

export const config = {
  path: ['/api/*', '/uploads/*', '/connect/*', '/auth/linkedin/callback'],
};
