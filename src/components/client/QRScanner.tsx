"use client";
import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (code: string) => void;
  onCancel: () => void;
}

export default function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-scanner";

  useEffect(() => {
    let isMounted = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!isMounted) return;

      // Si une instance existe déjà, on l'arrête et la libère
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => { });
      }

      scannerRef.current = new Html5Qrcode(containerId);

      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText: string) => {
            onScan(decodedText);
            // On peut arrêter automatiquement si nécessaire
            scannerRef.current?.stop().then(() => scannerRef.current?.clear());
          },
          (errorMessage: any) => {
            console.log("error detected !");
          }
        )
        .catch((err: any) => console.error(err));
    });

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => { });
      }
    };
  }, [onScan]);

  const handleCancel = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => { });
    }
    onCancel();
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div id={containerId} className="w-full h-[300px] bg-black" />
      <button
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
        onClick={handleCancel}
      >
        Annuler
      </button>
    </div>
  );
}
