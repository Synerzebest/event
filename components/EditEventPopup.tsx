import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Event } from "@/types/types";
import { motion } from "framer-motion";
import { Spin, notification, Upload, DatePicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Image from "next/image";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import { UploadFile } from "antd/es/upload";
import dayjs from "dayjs";

interface EditEventPopupProps {
    event: Event;
    onClose: () => void;
    onUpdateEvent: (updateEvent: Event) => void;
}

const EditEventPopup: React.FC<EditEventPopupProps> = ({ event, onClose, onUpdateEvent }) => {
    const [title, setTitle] = useState(event.title);
    const [place, setPlace] = useState(event.place);
    const [description, setDescription] = useState(event.description);
    const [eventDate, setEventDate] = useState(dayjs(event.date)); 
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleUpload = async (file: UploadFile) => {
        if (!file.originFileObj) {
            throw new Error("No file selected for upload.");
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

    const handleSave = async () => {
        setLoading(true);

        try {
            const imageURLs = fileList.length > 0 
            ? await Promise.all(fileList.map((file) => handleUpload(file))) 
            : []; // Use empty array if no new image is selected

            const updatedEvent = {
                ...event,
                title,
                place,
                description,
                date: eventDate.toISOString(), // Convertir la date en format ISO avec dayjs
                images: imageURLs.length > 0 ? imageURLs : event.images, // Keep existing images if no new image
            };

            const response = await fetch(`/api/updateEvent/${event.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEvent),
            });

            if (!response.ok) {
                throw new Error("Failed to update event");
            }

            notification.success({
                message: "Event Updated",
                description: "Your event has been successfully updated.",
            });
            onUpdateEvent(updatedEvent);
            onClose();
        } catch (error) {
            console.error("Error updating event:", error);
            notification.error({
                message: "Update Failed",
                description: "An error occurred while updating the event.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
                style={{ backdropFilter: "blur(10px)" }}
            ></div>

            <motion.div
                className="bg-white rounded-lg shadow-lg z-10 p-8 w-full sm:w-[600px] md:w-[800px] lg:w-[1000px] max-w-4xl relative overflow-y-auto h-[90vh] no-scrollbar"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.3 }}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                    onClick={onClose}
                >
                    <IoMdClose size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Event</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 text-gray-900"
                        placeholder="Enter event title"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Place</label>
                    <input
                        type="text"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 text-gray-900"
                        placeholder="Enter event place"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full border rounded-lg px-4 py-2 text-gray-900"
                        rows={5}
                        placeholder="Describe the event"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Event Date</label>
                    <DatePicker
                        className="rounded-md shadow-sm border-gray-300 focus:border-indigo-500"
                        style={{ width: "100%" }}
                        onChange={(date) => setEventDate(date || dayjs())} // Met à jour la date
                        value={eventDate}
                        disabledDate={(current) => current && current < dayjs(event.date)} // Date minimale égale à la date initiale
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Event Image</label>
                    {fileList.length > 0 && (
                        <div className="mb-3">
                            <Image
                                src={fileList[0].url || ""}
                                alt="Event"
                                className="w-full h-48 object-cover rounded-lg"
                                width={200}
                                height={100}
                            />
                        </div>
                    )}
                    <Upload
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => {
                            if (newFileList.length > 1) {
                                setFileList([newFileList[newFileList.length - 1]]);
                            } else {
                                setFileList(newFileList);
                            }
                        }}
                        beforeUpload={() => false} 
                        listType="picture-card"
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length === 0 && (
                            <div>
                                <PlusOutlined />
                                <p className="mt-2 text-sm text-gray-600">Update Event Photo</p>
                            </div>
                        )}
                    </Upload>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`bg-indigo-500 text-white px-6 py-2 rounded-md flex items-center justify-center ${
                            loading ? "cursor-not-allowed opacity-75" : "hover:bg-indigo-600"
                        }`}
                    >
                        {loading ? (
                            <>
                                <Spin size="small" className="mr-2" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default EditEventPopup;
