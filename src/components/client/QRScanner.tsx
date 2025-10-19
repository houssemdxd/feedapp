"use client";
import React, { useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onCancel: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onCancel }) => {
  const html5QrCodeRef = useRef<any>(null);
  const containerId = "qr-scanner";

  useEffect(() => {
    let isMounted = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!isMounted) return;
      // Si une instance existe déjà, on l'arrête
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear());
      }

      html5QrCodeRef.current = new Html5Qrcode(containerId);

      html5QrCodeRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText: string) => {
            onScan(decodedText);
          },
          (errorMessage: any) => {
            // console.warn(errorMessage);
          }
        )
        .catch((err: any) => console.error(err));
    });

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch((err: any) => console.error(err));
      }
    };
  }, [onScan]);

  const handleCancel = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => html5QrCodeRef.current.clear())
        .catch((err: any) => console.error(err));
    }
    onCancel();
  };

  return (
    <div className="flex flex-col items-center">
      <div id={containerId} className="w-full h-[300px] bg-black" />
      <button
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        onClick={handleCancel}
      >
        Annuler
      </button>
    </div>
  );
};

export default QRScanner;
