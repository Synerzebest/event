"use client";

import React, { useState } from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons"; // Icône pour embellir le bouton
import { motion } from "framer-motion"; // Ajout d'animations fluides
import CreateEventModal from "./CreateEventModal";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";

interface CreateEventButtonProps {
    lng: string;
}

const CreateEventButton: React.FC<CreateEventButtonProps> = ({ lng }) => {
    const { t } = useTranslation(lng, "common");
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center gap-12 mt-8 relative top-36">
            <div className="text-center">
                <p className="text-[2.5rem] sm:text-7xl font-bold bg-gradient-to-tr from-indigo-700 via-indigo-500 to-indigo-300 bg-clip-text text-transparent">
                    {safeTranslate(t, "create_your_event")}
                </p>
            </div>

            {/* Bouton animé */}
            <motion.div 
                whileHover={{ scale: 1.1 }} 
                whileTap={{ scale: 0.9 }} 
                className="relative"
            >
                <Button
                    type="primary"
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 font-bold text-white text-lg py-6 px-12 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl"
                >
                    <PlusOutlined className="text-xl" /> {/* Icône "+" à gauche */}
                    {safeTranslate(t, "new_event")}
                </Button>
            </motion.div>

            {/* Affichage du modal */}
            <CreateEventModal lng={lng} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>
    );
};

export default CreateEventButton;
