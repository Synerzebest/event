import { Timestamp } from "firebase/firestore";

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
    city: string;
    tickets: Ticket[]; 
    organizers: string[];
    imageUrl?: string;
    [key: string]: any; 
    category: string;
    createdAt: Timestamp;
    createdBy: string;
    currentGuests: number;
    dateTimestamp: Timestamp;
    guestLimit: number;
    images: string[];
    privacy: string;
}

export interface BankAccount {
    id: string;
    bank_name?: string;
    last4: string;
    country: string;
    currency: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    description?: string;
    created: number;
}

export interface UserData {
    uid: string;
    name: string;
    username: string;
    bio?: string;
    photoURL?: string;
    createdAt?: Date;
    eventsCreated?: number;
    eventsParticipated?: number;
    followers?: number;
    following?: number;
  }
  