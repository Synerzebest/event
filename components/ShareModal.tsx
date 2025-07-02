"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button } from "antd";
import Link from "next/link";
import { FaLink, FaFacebookF, FaWhatsapp, FaEnvelope, FaLinkedinIn } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";
import useLanguage from "@/lib/useLanguage";
import toast from "react-hot-toast";

// Hook mobile
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return isMobile;
};

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  eventUrl: string;
  eventTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  eventUrl,
  eventTitle
}) => {
  const isMobile = useIsMobile();
  const encodedTitle = encodeURIComponent(eventTitle);
  const encodedUrl = encodeURIComponent(eventUrl);
  const lng = useLanguage();
  const { t } = useTranslation(lng, "common");

  const y = useMotionValue(0);
  const dynamicHeight = useTransform(y, (value) => Math.max(-value, 0));

  // Si le modal descend trop → onClose()
  useEffect(() => {
    const unsubscribe = y.on("change", (latestY) => {
      if (latestY > window.innerHeight * 0.4) {
        onClose();
      }
    });
    return () => unsubscribe();
  }, [y, onClose]);

  const options = [
    {
      label: safeTranslate(t, "copy_event_link"),
      icon: <FaLink className="text-white" size={20} />,
      onClick: () => {
        navigator.clipboard.writeText(eventUrl);
        toast.success(safeTranslate(t, "link_copied"));
      },
    },
    {
      label: "Email",
      icon: <FaEnvelope className="text-white" size={20} />,
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
    {
      label: "WhatsApp",
      icon: <FaWhatsapp className="text-white" size={20} />,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "X (Twitter)",
      icon: <SiX className="text-white" size={20} />,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      label: "Facebook",
      icon: <FaFacebookF className="text-white" size={20} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "LinkedIn",
      icon: <FaLinkedinIn className="text-white" size={20} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];
  // Desktop
  if (!isMobile) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
      >
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          {options.map((option, i) =>
            option.href ? (
              <Link
                key={i}
                href={option.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="bg-indigo-500 p-4 rounded-full">
                  {option.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </Link>
            ) : (
              <button
                key={i}
                onClick={option.onClick}
                className="flex flex-col items-center gap-2 text-center"
              >
                <div className="bg-indigo-500 p-4 rounded-full">
                  {option.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </button>
            )
          )}
        </div>
      </Modal>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Fond dynamique blanc qui monte */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white z-40"
            style={{ height: dynamicHeight }}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 cursor-grab touch-pan-y"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            style={{ y }}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

            <div className="grid grid-cols-3 gap-4 justify-items-center">
              {options.map((option, i) =>
                option.href ? (
                  <Link
                    key={i}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div className="bg-indigo-500 p-4 rounded-full">
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </Link>
                ) : (
                  <button
                    key={i}
                    onClick={option.onClick}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div className="bg-indigo-500 p-4 rounded-full">
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </button>
                )
              )}
            </div>

            <Button onClick={onClose} className="w-full mt-6" type="default" size="large">
              {safeTranslate(t, "close")}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
