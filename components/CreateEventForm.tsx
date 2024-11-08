"use client";

import React, { useState } from "react";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Input, DatePicker, Radio, InputNumber, Upload, Button, notification, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "@/lib/firebaseConfig";
import { UploadFile, UploadChangeParam } from "antd/es/upload";
import dayjs from 'dayjs';

const { TextArea } = Input;

const categories = [
    { value: "music", label: "Music" },
    { value: "art", label: "Art" },
    { value: "theater", label: "Theater" },
    { value: "food", label: "Food" },
    { value: "sports", label: "Sports" },
    { value: "festival", label: "Festival" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "charity", label: "Charity" },
    { value: "family", label: "Family" },
    { value: "networking", label: "Networking" },
    { value: "outdoor", label: "Outdoor" },
    { value: "community", label: "Community" },
    { value: "wellness", label: "Wellness" },
    { value: "tech", label: "Technology" },
    { value: "holiday", label: "Holiday" },
    {value: "party", label: "Party"}
];

type Ticket = {
    name: string;
    price: number | null;
    quantity: number;
};

const CreateEventForm: React.FC = () => {
    const { user } = useFirebaseUser();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [eventDate, setEventDate] = useState<any>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [guestLimit, setGuestLimit] = useState<number>(1);
    const [formData, setFormData] = useState({
        title: '',
        place: '',
        description: '',
        privacy: 'public',
        guestLimit: guestLimit,
        category: '',
        organizers: [user?.uid]
    });

    // Fonction pour ajouter un ticket avec un prix par défaut de 0
    const addTicket = () => {
        setTickets([...tickets, { name: "", price: 0, quantity: 1 }]);
    };

    // Fonction pour mettre à jour un ticket
    const updateTicket = (index: number, key: "name" | "price" | "quantity", value: string | number | null) => {
        const newTickets = [...tickets];
        newTickets[index][key as keyof Ticket] = value as never;
        setTickets(newTickets);
    };

    // Fonction pour supprimer un ticket
    const removeTicket = (index: number) => {
        const newTickets = tickets.filter((_, i) => i !== index);
        setTickets(newTickets);
    };

    // Fonction pour gérer l'upload vers Firebase Storage
    const handleUpload = async (file: any) => {
        const storageRef = ref(storage, `events/${file.uid}`); // Créer une référence unique pour l'image
        const uploadTask = uploadBytesResumable(storageRef, file.originFileObj);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Suivi de l'état de l'upload (progression, etc.)
                },
                (error) => {
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL); // On résout la promesse avec l'URL de l'image
                }
            );
        });
    };

    // Gestion du changement du nombre de guests
    const handleGuestsChange = (value: number | null) => {
        if (value !== null) {
            setGuestLimit(value); // Mettez à jour guestLimit avec la nouvelle valeur
            setFormData({ ...formData, guestLimit: value }); // Utilisez la nouvelle valeur pour mettre à jour formData
        }
    };
    

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async () => {
        setUploading(true);
        try {
            const isoDate = eventDate ? eventDate.toDate().toISOString() : null;

            if (!formData.title || !formData.description || !formData.place || !formData.category) {
                notification.error({
                    message: "Validation Error",
                    description: "Please fill in all required fields.",
                });
                setUploading(false);
                return;
            }

            if (fileList.length === 0) {
                notification.error({
                    message: "Photo Error",
                    description: "Please provide a photo for the event."
                });
                setUploading(false);
                return;
            }

            // Vérifiez que chaque ticket a un nom et un prix valide
            for (const ticket of tickets) {
                if (!ticket.name || ticket.price === null || ticket.quantity === null) {
                    notification.error({
                        message: "Ticket Validation Error",
                        description: "Please provide a name and price for all tickets.",
                    });
                    setUploading(false);
                    return;
                }
            }

            // Upload des images et récupération des URLs
            const imageURLs = await Promise.all(fileList.map((file) => handleUpload(file)));

            // Calcul des tickets
            const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
            const remainingPlaces = formData.guestLimit - totalTickets;

            if (remainingPlaces > 0) {
                // Vérifier si un ticket participant existe déjà
                const participantTicket = tickets.find(ticket => ticket.name === "participant")
                if (participantTicket) {
                    // Mettre à jour la quantité du ticket "participant"
                    participantTicket.quantity += remainingPlaces;
                } else {
                    // Ajouter un nouveau ticket "participant"
                    tickets.push({
                        name: "participant",
                        price: 0,
                        quantity: remainingPlaces,
                    });
                }
            }

            // Créer l'événement dans Firestore avec les URLs des images
            await addDoc(collection(db, "events"), {
                ...formData,
                date: isoDate,
                images: imageURLs,
                createdBy: user?.uid,
                organizers: [user?.uid],
                tickets,
            });

            notification.success({
                message: "Event Created!",
                description: "Your event has been successfully created.",
            });

            // Reset du formulaire
            setFileList([]);
            setTickets([]);
        } catch (error) {
            console.error("Error creating event:", error);
            notification.error({
                message: "Error",
                description: "There was an error creating the event.",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-[95%] sm:w-3/4 mx-auto relative top-24 flex flex-col gap-8 mb-24">
    <div className="text-center">
        <p className="text-[2.5rem] sm:text-7xl font-bold text-indigo-700">Create Your Event</p>
    </div>
    
    <div className="w-full flex flex-col md:flex-row bg-white p-8 rounded-lg shadow-lg gap-8 sm:gap-0 border border-gray-300">
        <div className="w-full md:w-1/2 flex flex-col gap-4 pr-4">
            <p className="text-2xl font-bold mb-2 text-indigo-600">Event Details</p>
            <Input 
                className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                name="title" 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                placeholder="Title" 
                required 
            />
            <Input 
                className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                name="place" 
                onChange={(e) => setFormData({...formData, place: e.target.value})} 
                placeholder="Place" 
                required 
            />
            <DatePicker 
                className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                style={{ width: "100%" }} 
                onChange={(date) => setEventDate(date)} 
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                required 
            />
            <TextArea 
                className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                name="description" 
                onChange={(e) =>  setFormData({...formData, description: e.target.value})} 
                placeholder="Description" 
                autoSize 
                required 
            />
            <Select
                className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500"
                showSearch
                placeholder="Category"
                optionFilterProp="label"
                onChange={(value) => setFormData({...formData, category: value})}
                options={categories}
            />
            
            <div className="w-full flex flex-col gap-4 mt-6">
                <p className="text-2xl font-bold mb-2 text-indigo-600">Tickets</p>
                {tickets.map((ticket, index) => (
                    <div key={index} className="flex flex-col gap-2 border-b border-gray-300 pb-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col w-1/3">
                        <label className="text-sm font-medium text-gray-700">Title</label>
                        <Input
                          className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500"
                          placeholder="Ticket Name"
                          value={ticket.name}
                          onChange={(e) => updateTicket(index, "name", e.target.value)}
                        />
                      </div>
                      
                      <div className="flex flex-col w-1/4">
                        <label className="text-sm font-medium text-gray-700">Price</label>
                        <InputNumber
                          className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500"
                          min={0}
                          placeholder="Price"
                          value={ticket.price}
                          onChange={(value) => updateTicket(index, "price", value)}
                        />
                      </div>
                      
                      <div className="flex flex-col w-1/4">
                        <label className="text-sm font-medium text-gray-700">Quantity</label>
                        <InputNumber
                          className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500"
                          min={1}
                          placeholder="Quantity"
                          value={ticket.quantity}
                          onChange={(value) => updateTicket(index, "quantity", value)}
                        />
                      </div>
                      
                      <Button 
                        type="link" 
                        danger 
                        onClick={() => removeTicket(index)} 
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  
                ))}
                <Button 
                    type="dashed" 
                    onClick={addTicket} 
                    className="w-full mb-4 border-indigo-500 text-indigo-500 hover:bg-indigo-100"
                >
                    <PlusOutlined /> Add Ticket
                </Button>
            </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col gap-4 pl-0 sm:pl-4 border-none sm:border-l border-gray-300">
            <p className="text-2xl font-bold mb-2 text-indigo-600">Options</p>
            <div className="w-full flex gap-8">
                <div className="flex flex-col gap-2">
                    <p className="text-xl text-gray-700">Privacy</p>
                    <Radio.Group onChange={(e) => setFormData({ ...formData, privacy: e.target.value})} value={formData.privacy}>
                        <Radio required value="public">Public</Radio>
                        <Radio required value="private">Private</Radio>
                    </Radio.Group>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-xl text-gray-700">Guests</p>
                    <InputNumber 
                        className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                        min={1} 
                        defaultValue={1} 
                        onChange={handleGuestsChange} 
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-xl text-gray-700">Add Photos</p>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList }) => setFileList(fileList)}
                    maxCount={1}
                >
                    {fileList.length >= 1 ? null : <div className="flex items-center justify-center h-24 w-24 border border-dashed rounded-md text-indigo-500"><PlusOutlined /> Upload</div>}
                </Upload>
            </div>
        </div>
    </div>

    <Button
        type="primary"
        onClick={handleSubmit}
        className="w-[300px] text-xl font-bold py-6 mx-auto bg-indigo-600 hover:bg-indigo-700 transition-colors"
        loading={uploading}
    >
        {uploading ? "Creating..." : "Create Event"}
    </Button>
</div>

    );
};

export default CreateEventForm;