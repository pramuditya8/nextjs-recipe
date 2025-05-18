import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";
import { actionFormRecipe } from "@/components/drawer-form-recipe/action";
import { Textarea } from "../ui/textarea";

const initialState = {
  message: "",
  errors: {
    title: "",
    content: "",
  },
};

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export default function DrawerFormRecipe({
  id,
  values,
  onFinished,
  showFormRecipe,
  setShowFormRecipe,
}: {
  id?: string;
  values?: z.infer<typeof formSchema>;
  onFinished?: () => void;
  showFormRecipe?: boolean;
  setShowFormRecipe?: (show: boolean) => void;
}) {
  const [state, formAction] = useActionState(actionFormRecipe, initialState);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state?.message === "Success") {
      onFinished?.();
    }
  }, [state, onFinished]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id ? id : undefined,
      title: values?.title ? values?.title : "",
      content: values?.content ? values?.content : "",
    },
  });

  return (
    <Drawer open={showFormRecipe} onOpenChange={setShowFormRecipe}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <div className="w-full mx-auto max-w-md">Form Recipe</div>
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
          <Form {...form}>
            <form
              action={formAction}
              className="space-y-8 w-full mx-auto max-w-md mt-4"
            >
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem style={{ display: "none" }}>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      {/* {field.value} */}

                      <Input placeholder="Input title..." {...field} />
                    </FormControl>

                    <FormMessage>{state?.errors?.title}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Input content..." {...field} />
                      </FormControl>

                      <FormMessage>{state?.errors?.content}</FormMessage>
                    </FormItem>
                  );
                }}
              />
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => setShowFormRecipe && setShowFormRecipe(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Loading..." : "Submit"}
              </Button>
            </form>
          </Form>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  );
}
