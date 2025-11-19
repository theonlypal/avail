"use server";

import { updateAssignment } from "@/lib/assignments";
import { revalidatePath } from "next/cache";

export async function assignLead(leadId: string, formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) {
    throw new Error("Missing user id");
  }
  updateAssignment(leadId, userId);
  revalidatePath("/dashboard");
  revalidatePath(`/lead/${leadId}`);
}
