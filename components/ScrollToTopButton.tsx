"use client";

import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const ScrollToTopButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Détecte si l'utilisateur a scrollé assez loin pour afficher le bouton
    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // Fonction pour remonter en haut de la page avec un effet smooth
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.3 }}
            className="my-8"
        >
            {isVisible && (
                <Button 
                    type="primary"
                    shape="circle"
                    size="large"
                    onClick={scrollToTop}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
                >
                    <ArrowUpOutlined className="text-xl" />
                </Button>
            )}
        </motion.div>
    );
};

export default ScrollToTopButton;
