import { publishDuePosts } from '../../lib/app.js';

// Toutes les 15 minutes (UTC) : publie les posts validés dont l'heure est passée.
export default async () => {
  const due = await publishDuePosts();
  console.log(`Posts à publier traités : ${due}`);
};

export const config = { schedule: '*/15 * * * *' };
