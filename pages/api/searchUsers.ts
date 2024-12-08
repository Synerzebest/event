import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from "@/lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const query = req.query.query as string || '';

        try {
            // Récupérer la liste des utilisateurs via Firebase Admin SDK
            const userList: admin.auth.UserRecord[] = [];
            const listUsers = async (nextPageToken?: string) => {
                const result = await admin.auth().listUsers(1000, nextPageToken);  // Récupère les 1000 premiers utilisateurs
                userList.push(...result.users);
                if (result.pageToken) {
                    await listUsers(result.pageToken);  // Récupérer la page suivante si elle existe
                }
            };

            await listUsers();

            // Filtrer les utilisateurs selon la requête
            const filteredUsers = userList.filter(user => {
                const fullName = `${user.displayName || ''}`.trim(); // Utilisation de displayName pour le nom complet
                return fullName.toLowerCase().includes(query.toLowerCase());
            });

            res.status(200).json(filteredUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
