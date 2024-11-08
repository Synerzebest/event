import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // Utilise les credentials par défaut ou tes propres clés
    projectId: 'eventease-fd5ce',
  });
}

export const auth = admin.auth(); 
export { admin }
