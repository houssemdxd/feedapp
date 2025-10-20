// app/admin/builder/form/edit/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormTemplateById } from "@/app/actions/formActions"; // create this server action
import FormBuilder from "@/components/sondage/FormCanvas"; // your form builder component

export default function EditFormPage() {
  const params = useParams(); // Next.js hook
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForm() {
      if (!params.id) return;

      const res = await getFormTemplateById(params.id); // server action
      if (res.success) {
        setForm(res.data);
      } else {
        alert("Failed to load form: " + res.error);
      }
      setLoading(false);
    }
    fetchForm();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Edit Form: {form.title}</h1>
      {/* Pass existing form to your FormBuilder */}
      <FormBuilder initialForm={form} />
    </div>
  );
}
