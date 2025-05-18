import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStatus } from "react-dom";
import { Textarea } from "../ui/textarea";
import { actionFormRecipeComment } from "./action";
import useSWR from "swr";
import { Input } from "../ui/input";
import { timeAgo } from "@/lib/timeFormatter";
import { Trash } from "lucide-react";
import { getCookie } from "cookies-next";

type User = {
  user: string;
  email: string;
  id: string;
  name: string;
};

type Recipe = {
  id: string;
  title: string;
  content: string | TrustedHTML;
  comments_count: number;
  likes_count: number;
  is_saved_by_me: boolean;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
  is_liked_by_me: boolean;
  user: User;
};

const initialState = {
  message: "",
  errors: {
    id: "",
    content: "",
  },
};

const formSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

const fetcher = (url: string) => {
  const cookie = getCookie("user_token");

  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
};

export default function DrawerCommentRecipe({
  id,
  onFinished,
  showFormRecipe,
  setShowFormRecipe,
}: {
  id: string;
  onFinished?: () => void;
  showFormRecipe?: boolean;
  setShowFormRecipe?: (show: boolean) => void;
}) {
  const {
    data: recipeComments,
    // isLoading: isRecipeCommentsLoading,
    mutate,
  } = useSWR(`${process.env.BASE_URL}/comments/recipe/${id}`, fetcher);
  const [state, formAction] = useActionState(
    actionFormRecipeComment,
    initialState
  );
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state?.message === "Success") {
      onFinished?.();
      mutate();
    }
  }, [state, onFinished, mutate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id,
      content: "",
    },
  });

  return (
    <Drawer open={showFormRecipe} onOpenChange={setShowFormRecipe}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <div className="w-full mx-auto max-w-md text-center">Comments</div>
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
          <Form {...form}>
            <form
              action={formAction}
              className="space-y-4 w-full mx-auto max-w-md"
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
                name="content"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Input comment..." {...field} />
                      </FormControl>

                      <FormMessage>{state?.errors?.content}</FormMessage>
                    </FormItem>
                  );
                }}
              />

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? "Loading..." : "Comment"}
              </Button>
            </form>
          </Form>
        </DrawerHeader>

        <div className="w-full border-t max-w-md mx-auto py-4">
          {recipeComments?.data?.map((recipeComment: Recipe) => (
            <Card key={recipeComment.id} className="mb-4">
              <CardContent>
                <div className="flex justify-between">
                  <p className="font-bold text-sm">
                    {recipeComment.is_mine ? "Me" : recipeComment?.user?.name}
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      {timeAgo(recipeComment.created_at)}
                    </span>
                  </p>
                  {recipeComment.is_mine && (
                    <div className="flex gap-2">
                      <ButtonDeleteRecipeComment
                        id={recipeComment.id}
                        onFinished={() => {
                          onFinished?.();
                          mutate();
                        }}
                      />
                    </div>
                  )}
                </div>
                <div
                  className="text-sm mt-2 line-clamp-4"
                  style={{ color: "oklch(43.9% 0 0) !important" }}
                  dangerouslySetInnerHTML={{ __html: recipeComment.content }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

async function deleteRecipeComment(id: string) {
  const cookie = getCookie("user_token");

  const recipes = await fetch(`${process.env.BASE_URL}/comment/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
  return recipes;
}

export function ButtonDeleteRecipeComment({
  id,
  onFinished,
}: {
  id: string;
  onFinished?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  function handleDeleteRecipeComment(id: string) {
    setIsLoading(true);
    deleteRecipeComment(id)
      .then(() => {
        onFinished?.();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="cursor-pointer" size="icon">
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            recipe.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={() => handleDeleteRecipeComment(id)}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
