"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRScanner from "@/components/client/QRScanner";

const CodePage: React.FC = () => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [scanQr, setScanQr] = useState(false);
  const [manualCode, setManualCode] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");

  const openQrModal = () => {
    setScanQr(true);
    setManualCode(false);
    setModalOpen(true);
  };

  const openManualModal = () => {
    setManualCode(true);
    setScanQr(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setScanQr(false);
    setManualCode(false);
    setModalOpen(false);
    setError("");
  };

  // Validation statique : code correct = "1"
const checkCodeOrQr = async (code: string) => {
  try {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // ✅ Code valide, stocke les préférences dans le state global ou localStorage
      localStorage.setItem("organizationPreferences", JSON.stringify(data.preferences));
      
      // Redirige vers la page de l'organisation
      router.push("/organization");
    } else {
      setError(data.message || "Code invalide");
    }
  } catch (err) {
    console.error(err);
    setError("Erreur serveur");
  }
};



  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 dark:bg-gray-900 p-4 pt-10 gap-6">
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-[200px] h-[200px] relative cursor-pointer"
          onClick={openQrModal}
        >
          <Image src="/images/icons/QrCodeIcon.png" alt="QR Code" fill className="object-contain" />
        </div>

        <span className="text-gray-500 dark:text-gray-300 font-medium text-lg">Or</span>

        <div
          className="w-[200px] h-[200px] relative cursor-pointer"
          onClick={openManualModal}
        >
          <Image src="/images/icons/code.png" alt="Enter Code" fill className="object-contain" />
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col items-center gap-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={closeModal}
            >
              ✕
            </button>

            {scanQr && <QRScanner onScan={checkCodeOrQr} onCancel={closeModal} />}

            {manualCode && (
              <div className="flex flex-col items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="Enter Code"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="px-4 py-2 border rounded w-full"
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded w-full"
                  onClick={() => checkCodeOrQr(manualInput)}
                >
                  Valider
                </button>
                {error && <span className="text-red-500">{error}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePage;
