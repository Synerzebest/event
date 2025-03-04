"use client";

import React from "react";
import { Modal } from "antd";
import CreateEventForm from "./CreateEventForm";
import { safeTranslate } from "@/lib/utils";
import { useTranslation } from "@/app/i18n"

interface EventCreationModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    lng: string;
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({ isModalOpen, setIsModalOpen, lng }) => {
    const { t } = useTranslation(lng, "common") 
    
    return (
        <Modal
            title={safeTranslate(t, "new_event")}
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            width="95%" // Ajuste la largeur à 95% de l'écran
            style={{ maxWidth: "1200px" }} // Empêche que ça devienne trop grand sur les écrans larges
        >
            <CreateEventForm />
        </Modal>
    );
};

export default EventCreationModal;
