"use client";
import { useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onCancel: () => void;
}

export default function QRScanner({ onScan, onCancel }: QRScannerProps) {
  const scannerRef = useRef<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const containerId = "qr-scanner";
  const fileContainerId = "qr-scan-file"; // hidden container for image decoding

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

      const containerEl = document.getElementById(containerId);
      if (!containerEl) return;
      try {
        scannerRef.current = new Html5Qrcode(containerId);
      } catch (e) {
        console.error("Failed to construct Html5Qrcode", e);
        return;
      }

      scannerRef.current
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText: string) => {
            try {
              if (!isMounted) return;
              onScanRef.current?.(decodedText);
            } catch (e) {
              console.error("onScan handler error", e);
            }
            try {
              scannerRef.current?.stop().then(() => scannerRef.current?.clear()).catch(() => {});
            } catch {}
          },
          (errorMessage: any) => {
            // noop
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
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Arrêter la caméra AVANT le scan de fichier pour éviter l'erreur "ongoing camera scan"
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
        try {
          await scannerRef.current.clear();
        } catch {}
      }

      // Ré-instancier une instance propre pour éviter les états internes incohérents
      const { Html5Qrcode } = await import("html5-qrcode");
      const fileScannerRef = new Html5Qrcode(fileContainerId);

      // Utiliser l'API scanFile pour décoder une image de QR
      let decodedText: string | null = null;
      try {
        decodedText = await fileScannerRef.scanFile(file, true);
      } catch (scanErr) {
        console.error("QR image decode failed (scanFile)", scanErr);
        decodedText = null;
      }

      if (decodedText) {
        try {
          onScan(decodedText);
        } catch (e) {
          console.error("onScan handler error (image)", e);
        }
      } else {
        // En cas d'échec, tenter de relancer la caméra pour continuer l'expérience utilisateur
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          // S'assurer qu'on a bien une instance liée au container
          scannerRef.current = scannerRef.current || new Html5Qrcode(containerId);
          await scannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (text: string) => {
              onScan(text);
              scannerRef.current?.stop().then(() => scannerRef.current?.clear()).catch(() => {});
            },
            () => {}
          );
        } catch (restartErr) {
          console.error("Failed to restart live scan after image decode failure", restartErr);
        }
      }
    } catch (err) {
      console.error("QR image flow error", err);
    } finally {
      // Nettoyer l'instance de scan fichier
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        // Rien à arrêter explicitement pour scanFile, mais on peut nettoyer le container caché
        const el = document.getElementById(fileContainerId);
        if (el) el.innerHTML = "";
      } catch {}
      // Reset input to allow re-upload of the same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      {/* Hidden container used by html5-qrcode for decoding images */}
      <div id={fileContainerId} className="hidden" />
      <div className="mt-3 flex gap-2">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={handleUploadClick}
        >
          Importer une image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={handleCancel}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
