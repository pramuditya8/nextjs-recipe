"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";
import { actionFormAuth } from "./action";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialState = {
  message: "",
  errors: {
    email: "",
    password: "",
  },
};

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function LoginPage() {
  const [state, formAction] = useActionState(actionFormAuth, initialState);
  const { pending } = useFormStatus();
  const router = useRouter();
  useEffect(() => {
    if (state.message === "Success") {
      router.push("/");
    }
  }, [state, router]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="mt-24">
      <CardHeader>
        <CardTitle className="text-center">Login</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            action={formAction}
            className="space-y-8 w-full mx-auto max-w-md mt-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Input email..."
                      {...field}
                    />
                  </FormControl>

                  <FormMessage>{state?.errors?.email}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Input email..."
                        {...field}
                      />
                    </FormControl>

                    <FormMessage>{state?.errors?.password}</FormMessage>
                    <FormMessage>
                      {state.message === "Failed" && "Email or Password wrong"}
                    </FormMessage>
                  </FormItem>
                );
              }}
            />

            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? "Loading..." : "Login"}
            </Button>
            <p className="flex justify-center items-center">
              Don&apos;t have an account ?
              <Link href="/auth/register">
                <Button variant="link" className="ml-2 cursor-pointer p-0 ">
                  Register Here
                </Button>
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
