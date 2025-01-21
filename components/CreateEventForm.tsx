"use client";

import React, { useState } from "react";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Input, DatePicker, Radio, InputNumber, Upload, Button, notification, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "@/lib/firebaseConfig";
import { UploadFile } from "antd/es/upload/interface";
import dayjs from 'dayjs';
import { useTranslation } from "../app/i18n"
import useLanguage from "@/lib/useLanguage";


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
    { value: "party", label: "Party" }
];

type Ticket = {
    name: string;
    price: number | null;
    quantity: number;
    sold: number;
};

const CreateEventForm: React.FC = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");
    const { user } = useFirebaseUser();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [eventDate, setEventDate] = useState<dayjs.Dayjs | null>(null);
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

    const addTicket = () => {
        setTickets([...tickets, { name: "", price: 0, quantity: 1, sold: 0 }]);
    };

    const updateTicket = (index: number, key: "name" | "price" | "quantity", value: string | number | null) => {
        const newTickets = [...tickets];
        newTickets[index][key as keyof Ticket] = value as never;
        setTickets(newTickets);
    };

    const removeTicket = (index: number) => {
        const newTickets = tickets.filter((_, i) => i !== index);
        setTickets(newTickets);
    };

    const handleUpload = async (file: UploadFile) => {
        if (!file.originFileObj) {
            return Promise.reject("No file to upload");
        }
    
        const storageRef = ref(storage, `events/${file.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file.originFileObj);
    
        return new Promise<string>((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                () => {},
                (error) => {
                    console.error("Upload error:", error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    };

    const handleGuestsChange = (value: number | null) => {
        if (value !== null) {
            setGuestLimit(value);
            setFormData({ ...formData, guestLimit: value });
        }
    };

    const handleSubmit = async () => {
        setUploading(true);
        try {
          const isoDate = eventDate ? eventDate.toDate().toISOString() : null;
      
          // Validation des champs de formulaire
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
      
          const imageURLs = await Promise.all(fileList.map((file) => handleUpload(file)));
      
          const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
          const remainingPlaces = formData.guestLimit - totalTickets;
      
          // Ajouter un ticket "participant" si nécessaire
          if (remainingPlaces > 0) {
            const participantTicket = tickets.find(ticket => ticket.name === "participant");
            if (participantTicket) {
              participantTicket.quantity += remainingPlaces;
            } else {
              tickets.push({
                name: "participant",
                price: 0,
                quantity: remainingPlaces,
                sold: 0,
              });
            }
          }
      
          // Créer l'événement dans Firestore avec les tickets et images
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
                <p className="text-[2.5rem] sm:text-7xl font-bold bg-gradient-to-tl from-blue-800 via-blue-500 to-zinc-400 bg-clip-text text-transparent">Create Your Event</p>
            </div>
            
            <div className="w-full flex flex-col md:flex-row bg-white p-8 rounded-lg shadow-lg gap-8 sm:gap-0 border border-gray-300">
                <div className="w-full md:w-1/2 flex flex-col gap-4 pr-4">
                    <p className="text-2xl font-bold mb-2 text-blue-500">{t('event_details')}</p>
                    <Input 
                        className="rounded-md shadow-sm border-gray-300 focus:border-blue-500" 
                        name="title" 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        placeholder={`${t('form_title')}`} 
                        required 
                    />
                    <Input 
                        className="rounded-md shadow-sm border-gray-300 focus:border-blue-500" 
                        name="place" 
                        onChange={(e) => setFormData({...formData, place: e.target.value})} 
                        placeholder={`${t('form_place')}`} 
                        required 
                    />
                    <DatePicker 
                        className="rounded-md shadow-sm border-gray-300 focus:border-blue-500" 
                        style={{ width: "100%" }} 
                        onChange={(date) => setEventDate(date)} 
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        required 
                    />
                    <TextArea 
                        className="rounded-md shadow-sm border-gray-300 focus:border-blue-500" 
                        name="description" 
                        onChange={(e) =>  setFormData({...formData, description: e.target.value})} 
                        placeholder={`${t('form_description')}`} 
                        autoSize 
                        required 
                    />
                    <Select
                        className="rounded-md shadow-sm border-gray-300 focus:border-blue-500"
                        showSearch
                        placeholder={`${t('form_category')}`}
                        optionFilterProp="label"
                        onChange={(value) => setFormData({...formData, category: value})}
                        options={categories}
                    />
                    
                    <div className="w-full flex flex-col gap-4 mt-6">
                        <p className="text-2xl font-bold mb-2 text-blue-500">Tickets</p>
  
                        {user?.accountStatus === "verified" && user?.chargesEnabled && user?.payoutsEnabled ? (
                            <>
                            {tickets.map((ticket, index) => (
                              <div key={index} className="flex flex-col gap-2 border-b border-gray-300 pb-4 mb-4">
                              <div className="flex flex-col lg:flex-row lg:items-end lg:gap-4 gap-2">
                                <div className="flex flex-col w-full gap-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {t('ticket_name')}
                                  </label>
                                  <Input 
                                    value={ticket.name} 
                                    onChange={(e) => updateTicket(index, "name", e.target.value)} 
                                    placeholder={`${t('ticket_name')}`}
                                    required 
                                  />
                                </div>
                                <div className="flex flex-col w-full md:w-1/3 gap-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {t('price')} (€)
                                  </label>
                                  <InputNumber
                                    value={ticket.price}
                                    onChange={(value) => updateTicket(index, "price", value)}
                                    min={0}
                                    placeholder={`${t('price')}`}
                                    required
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex flex-col w-full md:w-1/3 gap-2">
                                  <label className="block text-sm font-medium text-gray-700">
                                    {t('quantity')}
                                  </label>
                                  <InputNumber
                                    value={ticket.quantity}
                                    onChange={(value) => updateTicket(index, "quantity", value)}
                                    min={1}
                                    placeholder={`${t('quantity')}`}
                                    required
                                    className="w-full"
                                  />
                                </div>
                                <Button 
                                  type="dashed" 
                                  danger 
                                  onClick={() => removeTicket(index)} 
                                  icon={<PlusOutlined />}
                                >
                                  {t('remove')}
                                </Button>
                              </div>
                            </div>
                            
                          ))}
                          <Button 
                              type="dashed" 
                              icon={<PlusOutlined />} 
                              onClick={addTicket}
                              className="border-gray-400 text-gray-600"
                          >
                              {t('add_ticket')}
                          </Button>
                          </>
                        ) : (
                            <p className="text-red-500">
                                {t('stripe_alert')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    <p className="text-2xl font-bold mb-2 text-blue-500">{t('event_privacy_guests')}</p>
                    <Radio.Group
                        value={formData.privacy}
                        onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                        className="mb-4"
                    >
                        <Radio value="public">{t('public')}</Radio>
                        <Radio value="private">{t('private')}</Radio>
                    </Radio.Group>
                    <p className="text-xl font-bold mb-2 text-blue-500">{t('guest_limit')}</p>
                    <InputNumber 
                        value={guestLimit} 
                        onChange={handleGuestsChange} 
                        min={1} 
                        placeholder={t('guest_limit')}
                        className="w-full mb-4" 
                    />
                    <Upload
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => {
                            if (newFileList.length > 1) {
                                // Limiter à une seule image
                                setFileList([newFileList[newFileList.length - 1]]);
                            } else {
                                setFileList(newFileList);
                            }
                        }}
                        beforeUpload={() => false} // Empêche l'upload automatique
                        listType="picture-card"
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length === 0 && (
                            <div>
                                <PlusOutlined />
                                <p className="mt-2 text-sm text-gray-600">{t('upload_event_photo')}</p>
                            </div>
                        )}
                    </Upload>

                    <Button 
                        type="primary" 
                        onClick={handleSubmit} 
                        loading={uploading} 
                        disabled={uploading}
                        className="mt-4 w-full"
                    >
                        {t('create_event_button')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateEventForm;

