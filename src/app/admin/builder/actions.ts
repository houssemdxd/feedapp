"use server";

export async function saveBuilderAction(payload: any) {
  try {
    const res = await fetch(`${process.env.oooooo || ""}/api/forms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Failed to save data" };
  }
}
