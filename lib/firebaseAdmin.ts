import admin from 'firebase-admin';
import * as serviceAccount from "../secrets/eventease-fd5ce-firebase-adminsdk-aax14-fde62160d6.json"

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'eventease-fd5ce',
  });
}

export const auth = admin.auth(); 
export const firestore = admin.firestore();
export { admin }
