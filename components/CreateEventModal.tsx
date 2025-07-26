"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import CreateEventForm from "./CreateEventForm";
import { AnimatePresence, motion } from "framer-motion";

interface EventCreationModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    lng: string;
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({ isModalOpen, setIsModalOpen }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    if (isMobile) {
        return (
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Overlay - just fades in/out */}
                        <motion.div
                            className="fixed inset-0 z-40 bg-black bg-opacity-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsModalOpen(false)}
                        />

                        {/* Modal - slides up */}
                        <motion.div
                            className="fixed inset-x-0 bottom-0 z-50"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="relative w-full h-[80vh] bg-white rounded-t-2xl shadow-lg overflow-y-auto">
                                <div className="p-4">
                                    <CreateEventForm />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
    }

    return (
        <Modal
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            centered
            width="95%"
            style={{ maxWidth: "1200px", margin: 0, padding: 0 }}
            bodyStyle={{ maxHeight: "95vh", overflowY: "auto", padding: "1.5rem" }}
            maskStyle={{ backdropFilter: "blur(2px)" }}
        >
            <CreateEventForm />
        </Modal>
    );
};

export default EventCreationModal;
