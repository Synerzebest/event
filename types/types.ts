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
    sold: number
}

export interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    place: string;
    tickets: Ticket[]; 
    organizers: string[];
    imageUrl?: string;
    [key: string]: any; 
}