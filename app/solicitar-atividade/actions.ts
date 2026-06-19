"use server";

import { createActivityRequest } from "@/src/server/services/request-service";

export async function createActivityRequestAction(formData: FormData) {
  await createActivityRequest(formData);
}
