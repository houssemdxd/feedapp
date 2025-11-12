import FormFill from "@/components/client/FormFill";
import { getCurrentUser } from "@/lib/session";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import FormResponse from "@/models/FormResponse";
import mongoose from "mongoose";

export default async function OrganizationFormPage({ params }: { params: { id: string } }) {
  const { id } = params;

  // Server-side duplicate check
  let already = false;
  try {
    await connectDB();
    const user = await getCurrentUser();
    const jar = await cookies();
    const orgCookie = jar.get("org_access")?.value;
    const respondentIdStr = (user as any)?._id || orgCookie;
    if (respondentIdStr && mongoose.Types.ObjectId.isValid(respondentIdStr) && mongoose.Types.ObjectId.isValid(id)) {
      const exists = await FormResponse.exists({
        formId: new mongoose.Types.ObjectId(id),
        respondentId: new mongoose.Types.ObjectId(respondentIdStr),
      });
      already = !!exists;
    }
  } catch {}

  if (already) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-semibold">Formulaire déjà soumis</h2>
          <p className="text-gray-600 dark:text-gray-300">Vous avez déjà répondu à ce formulaire. Merci.</p>
          <a href="/organization" className="inline-block px-4 py-2 rounded bg-blue-600 text-white">Retour</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <FormFill formId={id} />
    </div>
  );
}
