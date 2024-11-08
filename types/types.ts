export interface Event {
    id: string;
    title: string;
    date: string;
    place: string;
    description: string;
    images: string[];
    currentGuests: number;
    guests: number;
    category: string;
    organizers: string[];
}

export interface Participant {
    userId: string;
    timestamp: string; 
}

export interface User {
    id: string;
    fullName: string; 
    name: string;
    imageUrl?: string; 
    publicMetadata?: any;
}

export interface Ticket {
    name: string;
    price: number;
    quantity: number;
}
