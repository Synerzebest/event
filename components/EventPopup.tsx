import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Event } from '@/types/types';
import Image from "next/image";
import { Spin, Popconfirm, notification } from 'antd';
import QRCodeScanner from "./QRCodeScanner";

interface EventPopupProps {
    event: Event;
    onClose: () => void;
}

const EventPopup: React.FC<EventPopupProps> = ({ event, onClose }) => {
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [loadingOrganizers, setLoadingOrganizers] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [users, setUsers] = useState<any[]>([]);
    const [showScanner, setShowScanner] = useState<boolean>(false);

    // Récupérer les organisateurs
    useEffect(() => {
        const fetchOrganizers = async () => {
            setLoadingOrganizers(true);
    
            if (Array.isArray(event.organizers) && event.organizers.length > 0) {
                const organizerDetails = await Promise.all(event.organizers.map(async (id) => {
                    const response = await fetch(`/api/users/${id}`);
                    if (response.ok) {
                        const userData = await response.json();
                        return {
                            id: id, 
                            ...userData 
                        };
                    }
                    return null;
                }));
    
                setOrganizers(organizerDetails.filter(Boolean)); // Ne garde que les organisateurs valides
            } else {
                setOrganizers([]); // Si pas d'organisateurs, on met un tableau vide
            }
    
            setLoadingOrganizers(false);
        };
    
        fetchOrganizers();
    }, [event.organizers]);
    

    // Gérer la recherche d'utilisateurs
    const handleSearchChange = async (query: string) => {
        setSearchQuery(query);
        if (query) {
            const response = await fetch(`/api/searchUsers?query=${query}`);
            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            }
        } else {
            setUsers([]);
        }
    };

    // Gérer l'ajout d'un organisateur
    const handleAddOrganizer = async (userId: string) => {
        try {
            const response = await fetch(`/api/events/${event.id}/addOrganizers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizers: [userId] }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to add organizer');
            }
    
            // Récupérer les détails complets du nouvel organisateur ajouté
            const userResponse = await fetch(`/api/users/${userId}`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch organizer details');
            }
            
            const newOrganizer = await userResponse.json();
    
            // Ajouter le nouvel organisateur avec ses détails dans l'état
            setOrganizers((prev) => [...prev, { id: userId, ...newOrganizer }]);
    
            notification.success({
                message: "Organizer added!",
                description: "The user has been successfully added as an organizer.",
                placement: "topRight",
                duration: 3,
            });
        } catch (error) {
            console.error("Error adding organizer:", error);
            notification.error({
                message: "Error",
                description: "An error occurred while adding the organizer.",
                placement: "topRight",
                duration: 3,
            });
        }
    };
    

    // Gérer la suppression d'un organisateur
    const handleRemoveOrganizer = async (userId: string, eventId: string) => {
        try {
            const response = await fetch(`/api/removeOrganizer`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventId, organizerId: userId }), 
            });
    
            if (!response.ok) {
                throw new Error('Failed to remove organizer');
            }
    
            setOrganizers((prev) => prev.filter((organizer) => organizer.id !== userId));
    
            notification.success({
                message: "Organizer removed!",
                description: "The organizer has been successfully removed.",
                placement: "topRight",
                duration: 3,
            });
        } catch (error) {
            console.error("Error removing organizer:", error);
            notification.error({
                message: "Error",
                description: "An error occurred while removing the organizer.",
                placement: "topRight",
                duration: 3,
            });
        }
    };

    const handleScanTicket = async (data: string | null) => {
        if (data) {
            try {
                // Essayez de parser les données JSON du QR code
                const ticketInfo = JSON.parse(data);
                const ticketId = ticketInfo.ticketId;
                const eventId = ticketInfo.eventId;
    
                // Envoyez une requête pour vérifier le ticket scanné
                const response = await fetch(`/api/validateTicket`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketId, eventId }),
                });
    
                const result = await response.json();
    
                if (response.ok && result.message === 'Ticket validated successfully') {
                    notification.success({
                        message: 'Ticket validated',
                        description: 'Ticket validated, it is no longer a valid ticket',
                    });
                } else {
                    notification.error({
                        message: 'Invalid Ticket',
                        description: result.message || 'This ticket is invalid or has already been used.',
                    });
                }
            } catch (error) {
                console.error('An error occurred while validating the ticket:', error);
                notification.error({
                    message: 'Oups! Something went wrong',
                    description: "An error occurred while validating the ticket.",
                });
            } finally {
                setShowScanner(false);
            }
        }
    };
    
    

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-gray-800 opacity-50" onClick={onClose}></div>
            <div className="bg-white rounded-lg shadow-lg z-10 p-6 max-w-md w-full relative">
                <button className="absolute top-2 right-2" onClick={onClose}>
                    <IoMdClose size={24} />
                </button>
                <button
                    onClick={() => setShowScanner(true)}
                    className="absolute left-1/2 -translate-x-1/2 text-blue-500 border border-blue-500 font-bold p-2 rounded-lg"
                >
                    Scan Ticket
                </button>
                {showScanner && (
                    <div className="mt-4">
                        <p className="text-blue-500 border border-blue-500 font-bold">Scanner le QR Code</p>
                        <QRCodeScanner 
                            onScan={handleScanTicket} 
                            onClose={() => setShowScanner(false)}  // Ajoutez cette ligne
                        />
                        <button
                            onClick={() => setShowScanner(false)}
                            className="mt-2 text-blue-500 underline"
                        >
                            Annuler
                        </button>
                    </div>
                )}

                <h2 className="text-xl font-bold mb-2 mt-16">{event.title}</h2>
                <p className="text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR')} | {event.place}</p>
                <p className="text-gray-700 mt-2">{event.description}</p>

                <div className="py-4">
                    <p className="text-xl font-bold">Add organizers</p>
                    <input
                        type="text"
                        placeholder="Rechercher des utilisateurs..."
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="border rounded p-2 w-full"
                    />
                    {searchQuery && (
                        <ul className="mt-2">
                        {users.map((user) => {
                            const isOrganizer = organizers.some((organizer) => organizer.id === user.id);
                            return (
                                <li key={user.id} className="flex items-center justify-between my-2">
                                    <div className="flex items-center gap-2">
                                        <Image src={user.imageUrl} alt="User profile" width={30} height={30} className="rounded-full" />
                                        <span>{user.firstName} {user.lastName}</span>
                                    </div>
                                    <button 
                                        className={`text-blue-500 ${isOrganizer ? 'cursor-not-allowed text-gray-400' : ''}`}
                                        onClick={() => handleAddOrganizer(user.id)}
                                        disabled={isOrganizer} // Désactiver le bouton si l'utilisateur est déjà organisateur
                                    >
                                        {isOrganizer ? 'Déjà organisateur' : 'Ajouter'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    )}
                </div>

                {/* Section des organisateurs */}
                <h3 className="font-bold mt-4">Organizers ({organizers.length})</h3>
                {loadingOrganizers ? (
                    <div className="flex justify-center items-center my-4">
                        <Spin />
                    </div>
                ) : organizers.length === 0 ? ( // Vérifier si la liste des organisateurs est vide
                    <p className="text-gray-600 my-4">No organizers yet.</p> // Afficher un message si la liste est vide
                ) : (
                    <ul>
                        {organizers.map((organizer, index) => (
                            <li key={index} className="flex items-center justify-between text-gray-600">
                                <div className="flex items-center gap-2 my-4">
                                    <Image src={organizer.imageUrl} alt="Organizer profile picture" width={30} height={30} className="rounded-full"/>
                                    <span>{organizer.name}</span>
                                </div>
                                <Popconfirm
                                    title="Are you sure you want to remove this organizer?"
                                    onConfirm={() => handleRemoveOrganizer(organizer.id, event.id)} // Assurez-vous que eventId est défini dans le scope
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <button className="text-red-500">Remove</button>
                                </Popconfirm>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EventPopup;
