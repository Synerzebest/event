import { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const query = req.query.query as string || '';

        try {
            // Récupérer la liste des utilisateurs
            const { data: users } = await clerkClient.users.getUserList();

            // Filtrer les utilisateurs selon la requête
            const filteredUsers = users.filter(user => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim(); // Combiner firstName et lastName
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
