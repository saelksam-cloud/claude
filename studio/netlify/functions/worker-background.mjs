import { runJob } from '../../lib/app.js';

// Fonction d'arrière-plan (suffixe « -background ») : jusqu'à 15 minutes pour les appels IA longs.
// Elle ne fait rien sans l'identifiant ET le jeton secret de la tâche créée par /api/jobs.
export default async (req) => {
  const body = await req.json().catch(() => ({}));
  await runJob(body);
};
