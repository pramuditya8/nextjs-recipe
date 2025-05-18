"use server";
import { cookies } from "next/headers";
import { z } from "zod";

type FieldErrors = {
  [key: string]: string[];
};

/* eslint-disable @typescript-eslint/no-explicit-any*/
export async function actionFormRecipe(
  prevStage: { message: string; errors: object },
  formData: FormData
): Promise<any> {
  const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    content: z.string().min(1, { message: "Content is required" }),
  });

  const parse = formSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!parse.success) {
    const fieldErrors: FieldErrors = parse.error.formErrors.fieldErrors || {};
    const errors = Object.keys(fieldErrors)?.reduce((acc, key) => {
      acc[key] = fieldErrors[key]?.[0] || "Unknown error";
      return acc;
    }, {} as Record<string, string>);
    return { errors };
  }

  try {
    const endpoint = formData.get("id")
      ? `${process.env.BASE_URL}/recipe/${formData.get("id")}`
      : `${process.env.BASE_URL}/recipe`;
    const method = formData.get("id") ? "PATCH" : "POST";

    const cookieStore = await cookies();
    const userToken = cookieStore.get("user_token");

    await fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken?.value}`,
      },
      body: JSON.stringify(parse.data),
    }).then((res) => res.json());
    return { message: "Success" };
  } catch (error) {
    console.log(error);
    return { message: "Failed" };
  }
}
