import React, { useState, useRef } from "react";
import { useZxing } from "react-zxing";
import { IoIosClose } from "react-icons/io";
import { notification } from "antd";
import { safeTranslate } from "@/lib/utils";
import { useTranslation } from "@/app/i18n/index";

interface QRCodeScanModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  lng: string;
}

const QRCodeScanModal: React.FC<QRCodeScanModalProps> = ({ open, onClose, eventId, lng }) => {
  const [status, setStatus] = useState<"success" | "error" | "wrong_event" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const isProcessing = useRef(false);
  const lastScanned = useRef<string | null>(null);
  const { t } = useTranslation(lng, "common");

  const handleScanTicket = async (data: string | null) => {
    if (!data || isProcessing.current || data === lastScanned.current) return;

    isProcessing.current = true;
    lastScanned.current = data;

    try {
      const ticketInfo = JSON.parse(data);
      const ticketId = ticketInfo.ticketId;

      const res = await fetch(`/api/validateTicket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, eventId }),
      });

      const result = await res.json();
      console.log("VALIDATION RESULT:", result, res.status);

      if (res.ok) {
        setStatus("success");
        setMessage("Ticket validé avec succès.");
      } else {
          if (result.message === "wrong_event") {
            setStatus("wrong_event")
            setMessage(safeTranslate(t, "wrong_event"))
          } else if (result.message === "already_used") {
              const scannedAt = new Date(result.scannedAt).toLocaleTimeString();
              setStatus("error")
              setMessage(`${safeTranslate(t, "already_used_ticket")} (${scannedAt})`)
          }
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: safeTranslate(t, "error"),
        description: safeTranslate(t, "error_scanning_ticket"),
      });
    } finally {
      setTimeout(() => {
        setStatus(null);
        setMessage(null);
        isProcessing.current = false;
        lastScanned.current = null;
      }, 3000);
    }
  };

  if (!open) return null;

  const bgColor =
  status === "success"
    ? "#22c55e" // green
    : status === "error"
    ? "#ef4444" // red
    : status === "wrong_event"
    ? "#f97316" // orange 
    : "#ffffff"; // white


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
        <div
            className={`relative z-10 p-6 max-w-md w-full rounded-lg shadow-lg transition-colors duration-300`}
            style={{
            backgroundColor: bgColor,
            zIndex: 60,
            }}
        >
        <button
          className="absolute top-2 right-2 text-black hover:text-red-500 transition text-3xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          <IoIosClose />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Scan QR Code</h2>

        <div className="w-full aspect-square rounded-md overflow-hidden border border-white bg-black">
          <Scanner onScan={handleScanTicket} />
        </div>

        {message && (
          <p className="mt-4 text-center font-semibold">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanModal;

interface ScannerProps {
  onScan: (data: string | null) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan }) => {
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      onScan(result.getText());
    },
    onError: (error) => {
      console.error(error);
    },
    constraints: {
      video: {
        facingMode: "environment",
      },
      audio: false,
    },
  });

  return (
    <video
      ref={ref}
      className="w-full h-full object-cover"
      autoPlay
      muted
      playsInline
      style={{ backgroundColor: "black" }}
    />
  );
};
