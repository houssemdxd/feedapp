"use client";

import React, { useEffect, useState } from "react";
import OrganizationFormsTable from "@/components/client/OrganizationForms";

// Liste des templates disponibles (doit correspondre à celle dans admin/preview/page.tsx)
const templates = [
  { backgroundColor: "#ffffff", backgroundImage: null },
  { backgroundColor: "#f3f4f6", backgroundImage: "/images/preview-template/back01.jpg" },
  { backgroundColor: "#fef3c7", backgroundImage: "/images/preview-template/back02.jpg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back03.jpg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back04.jpg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back05.jpg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back06.png" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back07.jpg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back08.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back09.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back10.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back11.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back12.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back13.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back14.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back15.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back16.jpeg" },
  { backgroundColor: "#dbeafe", backgroundImage: "/images/preview-template/back17.jpg" },
];

export default function Organization() {
  const [background, setBackground] = useState<{ 
    backgroundImage: string | null; 
    backgroundColor: string;
    selectedTemplate?: number;
  }>({
    backgroundImage: null,
    backgroundColor: "#f3f4f6",
    selectedTemplate: 0,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        // D'abord, vérifier si on a des préférences enregistrées localement
        const stored = localStorage.getItem("organizationPreferences");
        if (stored) {
          const prefs = JSON.parse(stored);
          
          // Vérifier si on a un template sélectionné
          if (prefs.selectedTemplate !== undefined && prefs.selectedTemplate >= 0) {
            const template = templates[prefs.selectedTemplate];
            if (template) {
              setBackground({
                ...prefs,
                backgroundColor: template.backgroundColor,
                backgroundImage: template.backgroundImage || prefs.backgroundImage,
              });
              return;
            }
          }
          
          // Sinon, utiliser les préférences directes
          setBackground({
            ...prefs,
            backgroundColor: prefs.backgroundColor || "#f3f4f6",
          });
        }

        // Ensuite, essayer de récupérer les préférences depuis l'API
        try {
          const response = await fetch('/api/preferences');
          if (response.ok) {
            const prefs = await response.json();
            
            // Mettre à jour le localStorage avec les dernières préférences
            localStorage.setItem("organizationPreferences", JSON.stringify(prefs));
            
            // Appliquer le template sélectionné s'il existe
            if (prefs.selectedTemplate !== undefined && prefs.selectedTemplate >= 0) {
              const template = templates[prefs.selectedTemplate];
              if (template) {
                setBackground({
                  ...prefs,
                  backgroundColor: template.backgroundColor,
                  backgroundImage: template.backgroundImage || prefs.backgroundImage,
                });
                return;
              }
            }
            
            // Sinon, utiliser les préférences directes
            setBackground({
              ...prefs,
              backgroundColor: prefs.backgroundColor || "#f3f4f6",
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des préférences:', error);
        }
      } catch (error) {
        console.error('Erreur lors du traitement des préférences:', error);
      }
    };

    fetchPreferences();
  }, []);

  const containerStyle: React.CSSProperties = {
    background: background.backgroundImage
      ? `url(${background.backgroundImage}) center/cover no-repeat fixed`
      : background.backgroundColor,
    minHeight: "100vh",
    padding: "1rem",
    transition: 'background 0.3s ease-in-out',
  };

  return (
    <div style={containerStyle}>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <OrganizationFormsTable />
        </div>
      </div>
    </div>
  );
}
