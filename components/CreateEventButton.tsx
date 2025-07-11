"use client";

import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
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
        <div className="flex flex-col items-center gap-4 sm:gap-8 mt-8 relative top-24">
            <div className="text-center">
                <p className="text-3xl sm:text-[2.5rem] sm:text-7xl font-bold bg-gradient-to-tr from-indigo-700 via-indigo-500 to-indigo-300 bg-clip-text text-transparent">
                {safeTranslate(t, "create_your_event")}
                </p>
            </div>

            {/* Bouton animé */}
            <motion.div
                whileHover={{scale: 0.95}}
                className="relative"
            >
                <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 bg-indigo-500 text-white font-semibold text-lg py-2 px-10 rounded-full border border-gray-200 shadow-md hover:shadow-lg hover:bg-indigo-600 transition-all duration-300 ease-in-out"
                >
                <PlusOutlined />
                {safeTranslate(t, "new_event")}
                </button>
            </motion.div>

            {/* Affichage du modal */}
            <CreateEventModal lng={lng} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
            </div>
    );
};

export default CreateEventButton;
