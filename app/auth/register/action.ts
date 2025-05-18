"use server";
import { z } from "zod";

type FieldErrors = {
  [key: string]: string[];
};

/* eslint-disable @typescript-eslint/no-explicit-any*/
export async function actionFormAuth(
  prevStage: { message: string; errors: object },
  formData: FormData
): Promise<any> {
  const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),

    email: z.string().min(1, { message: "Email is required" }),
    password: z.string().min(1, { message: "Password is required" }),
  });

  const parse = formSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
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
    const response = await fetch(`${process.env.BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parse.data),
    }).then((res) => res.json());
    if (response.status === "Created") {
      return { message: "Success" };
    } else {
      return { message: "Failed" };
    }
  } catch (error) {
    console.log(error);
    return { message: "Failed" };
  }
}
