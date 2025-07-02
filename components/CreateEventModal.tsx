import React from "react";
import { Modal } from "antd";
import CreateEventForm from "./CreateEventForm";

interface EventCreationModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    lng: string;
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({ isModalOpen, setIsModalOpen }) => {
    return (
        <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            centered 
            width="95%"
            style={{ maxWidth: "1200px", margin: 0, padding: 0 }}
            bodyStyle={{ maxHeight: "95vh", overflowY: "auto" }}
        >
            <CreateEventForm />
        </Modal>
    );
};

export default EventCreationModal;
