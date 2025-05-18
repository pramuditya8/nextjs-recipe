"use server";
import { cookies } from "next/headers";
import { z } from "zod";

type FieldErrors = {
  [key: string]: string[];
};

/* eslint-disable @typescript-eslint/no-explicit-any*/
export async function actionFormRecipeComment(
  prevStage: { message: string; errors: object },
  formData: FormData
): Promise<any> {
  const formSchema = z.object({
    id: z.string().min(1, { message: "ID is required" }),
    content: z.string().min(1, { message: "Content is required" }),
  });

  const parse = formSchema.safeParse({
    id: formData.get("id"),
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
    const cookieStore = await cookies();
    const userToken = cookieStore.get("user_token");
    const res = await fetch(
      `${process.env.BASE_URL}/comment/recipe/${formData.get("id")}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken?.value}`,
        },
        body: JSON.stringify(parse.data),
      }
    ).then((res) => res.json());
    return { message: "Success" };
  } catch (error) {
    console.log(error);
    return { message: "Failed" };
  }
}
