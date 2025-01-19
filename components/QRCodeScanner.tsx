import React from 'react';
import { useZxing } from 'react-zxing';

interface QRCodeScannerProps {
  onScan: (data: string | null) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      if (result) {
        onScan(result.getText());
      }
    },
    onError: (error) => {
      console.error(error);
    },
    constraints: {
      video: {
        facingMode: 'environment'
      },
      audio: false
    }
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-800 opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg z-10 p-6 max-w-md w-full relative">
        <button className="absolute top-2 right-2" onClick={onClose}>Close</button>
        <h2 className="text-xl font-bold mb-4">Scan Ticket</h2>
        <div style={{ width: '100%' }}>
          <video
            ref={ref}
            style={{ width: '100%', height: 'auto' }}
            autoPlay
            muted
            playsInline
          ></video>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
