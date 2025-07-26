"use client";

import React, { useState, useEffect } from "react";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Input, DatePicker, Radio, InputNumber, Upload, Button, notification, Select, Alert, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import { UploadFile } from "antd/es/upload/interface";
import dayjs from 'dayjs';
import { useTranslation } from "../app/i18n";
import useLanguage from "@/lib/useLanguage";
import { categories } from "@/constants/constants";
import { safeTranslate } from "@/lib/utils";
import Link from 'next/link';
import { getAuth } from "firebase/auth";
import { toast } from "react-hot-toast";

const { TextArea } = Input;

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

    const getGuestLimit = (nickname: string | null | undefined): number => {
        switch (nickname) {
            case "pro": return Infinity;
            case "standard": return 500;
            default: return 50;
        }
    };

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [eventDate, setEventDate] = useState<dayjs.Dayjs | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [maxGuestLimit, setMaxGuestLimit] = useState<number>(getGuestLimit(user?.nickname));
    const [guestLimit, setGuestLimit] = useState<number>(getGuestLimit(user?.nickname));
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        place: '',
        city: '',
        description: '',
        privacy: 'public',
        guestLimit: guestLimit,
        category: '',
        organizers: [user?.uid]
    });

    useEffect(() => {
        if (user?.nickname) {
            const newLimit = getGuestLimit(user.nickname);
            setMaxGuestLimit(newLimit);
            setGuestLimit((prev) => (prev === 1 || prev > newLimit ? newLimit : prev));
        }
    }, [user?.nickname]);

    const addTicket = () => setTickets([...tickets, { name: "", price: 0, quantity: 1, sold: 0 }]);

    const updateTicket = (index: number, key: keyof Ticket, value: string | number | null) => {
        const updated = [...tickets];
        updated[index][key] = value as never;
        setTickets(updated);
    };

    const removeTicket = (index: number) => setTickets(tickets.filter((_, i) => i !== index));

    const handleUpload = async (file: UploadFile) => {
        if (!file.originFileObj) return Promise.reject("No file");
        const storageRef = ref(storage, `events/${file.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, file.originFileObj);

        return new Promise<string>((resolve, reject) => {
            uploadTask.on("state_changed", () => { }, reject, async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            });
        });
    };

    const handleGuestsChange = (value: number | null) => {
        if (value !== null) {
            setGuestLimit(Math.min(value, maxGuestLimit));
            setFormData(prev => ({ ...prev, guestLimit: Math.min(value, maxGuestLimit) }));
        }
    };

    useEffect(() => {
        setFormData(prev => ({ ...prev, guestLimit }));
    }, [guestLimit]);

    const handleSubmit = async () => {
        setUploading(true);
        try {
            const isoDate = eventDate ? eventDate.toDate().toISOString() : null;
            const date = eventDate?.toDate();
            const timestamp = date ? date.getTime() : null; 
            if (!formData.title || !formData.description || !formData.place || !formData.category) {
                toast.error(safeTranslate(t, "required_fields"));
                setUploading(false);
                return;
            }
            if (fileList.length === 0) {
                toast.error(safeTranslate(t, "missing_photo"));
                setUploading(false);
                return;
            }
            for (const ticket of tickets) {
                if (!ticket.name || ticket.price === null || ticket.quantity === null) {
                    toast.error(safeTranslate(t, "ticket_error"));
                    setUploading(false);
                    return;
                }
            }

            const imageURLs = await Promise.all(fileList.map((file) => handleUpload(file)));

            const totalTickets = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
            const remainingPlaces = guestLimit - totalTickets;
            const updatedTickets = [...tickets];

            if (remainingPlaces > 0) {
                const idx = updatedTickets.findIndex(t => t.name === "Participant");
                if (idx !== -1) {
                    updatedTickets[idx].quantity += remainingPlaces;
                } else {
                    updatedTickets.push({ name: "Participant", price: 0, quantity: remainingPlaces, sold: 0 });
                }
            }

            const token = await getAuth().currentUser?.getIdToken();

            const response = await fetch("/api/createEvent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    date: isoDate,
                    dateTimestamp: timestamp,
                    images: imageURLs,
                    tickets: updatedTickets,
                    organizers: [user?.uid],
                }),
            });

            if (!response.ok) {
                throw new Error("API error");
            }

            toast.success(safeTranslate(t, 'event_created'));
            setFileList([]);
            setTickets([]);
        } catch (err) {
            console.error("Error:", err);
            notification.error({ message: "Error creating event" });
        } finally {
            setUploading(false);
        }
    };
    
      return (
        <div className="w-full sm:w-3/4 mx-auto relative flex flex-col items-between">    
            <div className="w-full flex flex-col md:flex-row bg-white gap-8 sm:gap-0 ">
                {/* Première colonne */}
                <div className="w-full md:w-1/2 flex flex-col gap-4 pr-4">
                    <p className="text-2xl font-bold mb-2 text-indigo-500">{safeTranslate(t,'event_details')}</p>
                    <Input 
                        className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                        name="title" 
                        onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        placeholder={`${safeTranslate(t,'form_title')}`} 
                        required 
                    />
                    <Input 
                        className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                        name="title" 
                        onChange={(e) => setFormData({...formData, city: e.target.value})} 
                        placeholder={`${safeTranslate(t,'form_city')}`} 
                        required 
                    />
                    <Input 
                        className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500" 
                        name="place" 
                        onChange={(e) => setFormData({...formData, place: e.target.value})} 
                        placeholder={`${safeTranslate(t,'form_place')}`} 
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
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        placeholder={`${safeTranslate(t,'form_description')}`} 
                        autoSize 
                        required 
                    />
                    <Select
                        className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500"
                        showSearch
                        placeholder={`${safeTranslate(t, 'form_category')}`}
                        optionFilterProp="label"
                        onChange={(value) => setFormData({...formData, category: value})}
                        options={categories}
                    />
    
                    {/* Déplacement du champ Guest Limit ici */}
                    <p className="text-xl font-bold mt-6 text-indigo-500">{safeTranslate(t,'guest_limit')}</p>
                    <div className="flex flex-col gap-2">
                        <Alert
                            message={safeTranslate(t, "plan_limit", { 
                                plan: user?.nickname 
                                    ? user.nickname.charAt(0).toUpperCase() + user.nickname.slice(1) 
                                    : "Starter", 
                                max: maxGuestLimit === Infinity ? safeTranslate(t, "unlimited") : maxGuestLimit 
                            })}
                            type="info"
                            showIcon
                        />
                        <InputNumber
                            value={guestLimit}
                            onChange={handleGuestsChange}
                            min={1}
                            max={maxGuestLimit !== Infinity ? maxGuestLimit : undefined}
                            disabled={maxGuestLimit === Infinity} // Désactive le champ si illimité
                            placeholder={safeTranslate(t, 'guest_limit')}
                            className="w-full mb-4"
                        />
                    </div>
                    <p className="text-2xl font-bold mb-2 text-indigo-500">{safeTranslate(t,'event_privacy_guests')}</p>
                    <Radio.Group
                        value={formData.privacy}
                        onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                        className="mb-4"
                    >
                        <Radio value="public">{safeTranslate(t,'public')}</Radio>
                        <Radio value="private">{safeTranslate(t,'private')}</Radio>
                    </Radio.Group>
                    
                    {formData.privacy === "private" && (
                        <Alert
                            message={safeTranslate(t, "private_event_alert")}
                            type="warning"
                            showIcon
                        />
                    )}
                </div>
    
                {/* Deuxième colonne */}
                <div className="w-full md:w-1/2 flex flex-col gap-4">

                    {/* Tickets */}
                    <div className="w-full flex flex-col gap-4 mt-6">
                        <p className="text-2xl font-bold mb-2 text-indigo-500">Tickets</p>
                        {user?.chargesEnabled && user?.payoutsEnabled ? (
                            <>
                                {tickets.map((ticket, index) => (
                                    <div key={index} className="flex flex-col gap-2 border-b border-gray-300 pb-4 mb-4">
                                        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-4 gap-2">
                                            <div className="flex flex-col w-full gap-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {safeTranslate(t, 'ticket_name')}
                                                </label>
                                                <Input 
                                                    value={ticket.name} 
                                                    onChange={(e) => updateTicket(index, "name", e.target.value)} 
                                                    placeholder={`${safeTranslate(t, 'ticket_name')}`}
                                                    required 
                                                />
                                            </div>
                                            <div className="flex flex-col w-full md:w-1/3 gap-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {safeTranslate(t, 'price')} (€)
                                                </label>
                                                <InputNumber
                                                    value={ticket.price}
                                                    onChange={(value) => updateTicket(index, "price", value)}
                                                    min={0}
                                                    placeholder={`${safeTranslate(t, 'price')}`}
                                                    required
                                                    className="w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col w-full md:w-1/3 gap-2">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {safeTranslate(t, 'quantity')}
                                                </label>
                                                <InputNumber
                                                    value={ticket.quantity}
                                                    onChange={(value) => updateTicket(index, "quantity", value)}
                                                    min={1}
                                                    placeholder={`${safeTranslate(t, 'quantity')}`}
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
                                                {safeTranslate(t, 'remove')}
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
                                    {safeTranslate(t, 'add_ticket')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Alert
                                    message={safeTranslate(t, 'stripe_alert')}
                                    type="error"
                                    showIcon
                                    className="mb-4"
                                />
                                <div className="flex flex-col gap-2 border border-gray-300 p-4 rounded-md">
                                    <div className="flex flex-col lg:flex-row lg:items-end lg:gap-4 gap-2">
                                        <div className="flex flex-col w-full lg:w-1/2 gap-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {safeTranslate(t, 'ticket_name')}
                                            </label>
                                            <Input 
                                                value={safeTranslate(t, 'participant')}
                                                disabled
                                            />
                                        </div>
                                        <div className="flex flex-col w-full lg:w-1/4 gap-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {safeTranslate(t, 'quantity')}
                                            </label>
                                            <InputNumber
                                                value={guestLimit}
                                                min={1}
                                                disabled
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="flex flex-col w-full lg:w-1/4 gap-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                {safeTranslate(t, 'price')}
                                            </label>
                                            <Input
                                                value={safeTranslate(t, "free")}
                                                disabled
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <p className="text-2xl font-bold mb-2 text-indigo-500">Photo</p>
                    <Upload
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => {
                            if (newFileList.length > 1) {
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
                                <p className="mt-2 text-sm text-gray-600">{safeTranslate(t,'upload_event_photo')}</p>
                            </div>
                        )}
                    </Upload>
    
                    <Checkbox
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mb-4"
                    >
                        {safeTranslate(t, "accept_terms_text")}
                        <Link href={`/${lng}/terms-and-conditions`} className="underline text-blue-500">{safeTranslate(t, "terms_and_conditions")}</Link>
                    </Checkbox>

                    <Button 
                        onClick={handleSubmit} 
                        loading={uploading} 
                        disabled={uploading || !acceptedTerms}
                        className={`mt-4 w-full font-bold text-white text-lg py-6 ${
                            uploading || !acceptedTerms
                              ? 'bg-indigo-300 cursor-not-allowed'
                              : 'bg-indigo-500 hover:bg-indigo-600'
                          }`}
                    >
                        {safeTranslate(t,'create_event_button')}
                    </Button>
                </div>
            </div>
        </div>
    );
    
};

export default CreateEventForm;

