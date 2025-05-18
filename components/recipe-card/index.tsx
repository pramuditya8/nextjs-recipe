import { Card, CardContent } from "@/components/ui/card";
import { Bookmark, Heart, MessageCircle, Pencil, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
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
import DrawerCommentRecipe from "../drawer-comment-recipe";
import { timeAgo } from "@/lib/timeFormatter";
import Link from "next/link";
import DrawerFormRecipe from "../drawer-form-recipe";
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

async function recipeInteract(id: string, interactType: string) {
  const _obj = {
    endpoint: "",
    method: "",
  };
  if (interactType === "like") {
    _obj.endpoint = `${process.env.BASE_URL}/like/recipe/${id}`;
    _obj.method = "POST";
  } else if (interactType === "unlike") {
    _obj.endpoint = `${process.env.BASE_URL}/unlike/recipe/${id}`;
    _obj.method = "POST";
  } else if (interactType === "save") {
    _obj.endpoint = `${process.env.BASE_URL}/recipe/save/${id}`;
    _obj.method = "POST";
  }

  try {
    const cookie = getCookie("user_token");

    await fetch(_obj.endpoint, {
      method: _obj.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export default function RecipeCard({
  recipe,
  mutate,
  type,
}: {
  recipe: Recipe;
  mutate: () => void;
  type?: string;
}) {
  const [showCommentsRecipe, setShowCommentsRecipe] = useState(false);
  const [openedCommentsRecipeId, setOpenedCommentsRecipeId] = useState("");
  useEffect(() => {
    if (!showCommentsRecipe) setOpenedCommentsRecipeId("");
  }, [showCommentsRecipe]);

  const [showFormEditRecipe, setShowFormEditRecipe] = useState(false);
  const [openedFormEditRecipeId, setOpenedFormEditRecipeId] = useState("");
  useEffect(() => {
    if (!showFormEditRecipe) setOpenedFormEditRecipeId("");
  }, [showFormEditRecipe]);
  const [isLoading, setIsLoading] = useState(false);

  function handleRecipeInteract(id: string, interactType: string) {
    if (isLoading) return;
    setIsLoading(true);
    recipeInteract(id, interactType)
      .then(() => {
        mutate();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <Card className="mt-4" key={recipe.id}>
      <CardContent>
        <div className="flex justify-between">
          <Link href={`/recipe/${recipe.id}`}>
            <Button
              variant="link"
              className="font-bold text-sm p-0 cursor-pointer"
            >
              {recipe.title}
            </Button>
          </Link>
          {recipe.is_mine && type !== "saved" && (
            <div className="flex gap-2">
              <Button
                className="cursor-pointer"
                size="icon"
                onClick={() => {
                  setShowFormEditRecipe(true);
                  setOpenedFormEditRecipeId(recipe.id);
                  if (type === "saved") mutate();
                }}
              >
                <Pencil />
                {/* Edit */}
                {openedFormEditRecipeId === recipe.id && (
                  <DrawerFormRecipe
                    id={recipe.id}
                    values={{
                      title: recipe.title,
                      content: String(recipe.content),
                    }}
                    showFormRecipe={showFormEditRecipe}
                    setShowFormRecipe={setShowFormEditRecipe}
                    onFinished={() => {
                      mutate();
                      setShowFormEditRecipe(false);
                    }}
                  />
                )}
              </Button>
              <ButtonDeleteRecipe id={recipe.id} onFinished={() => mutate()} />
            </div>
          )}
        </div>
        <p className="text-xs text-neutral-500">{`By ${
          recipe.is_mine ? "Me" : recipe?.user?.name
        }, ${timeAgo(recipe.created_at)}`}</p>
        <div
          className="text-sm mt-2 line-clamp-4"
          style={{ color: "oklch(43.9% 0 0) !important" }}
          dangerouslySetInnerHTML={{ __html: recipe.content }}
        />

        <div className="flex mt-4">
          {type !== "saved" && (
            <div
              className="flex items-center gap-1 text-xs cursor-pointer"
              style={{ width: "50px" }}
              onClick={() => {
                handleRecipeInteract(
                  recipe.id,
                  recipe.is_liked_by_me ? "unlike" : "like"
                );
              }}
            >
              <Heart
                strokeWidth={1}
                size={18}
                fill={recipe.is_liked_by_me ? "#000" : "#fff"}
              />
              <div>{recipe.likes_count ? recipe.likes_count : ""}</div>
            </div>
          )}
          {type !== "saved" && (
            <div
              className="flex items-center gap-1 text-xs cursor-pointer"
              style={{ width: "50px" }}
              onClick={() => {
                setOpenedCommentsRecipeId(recipe.id);
                setShowCommentsRecipe(true);
              }}
            >
              <MessageCircle strokeWidth={1} size={18} />
              <div>{recipe.comments_count ? recipe.comments_count : ""}</div>
              {openedCommentsRecipeId === recipe.id && (
                <DrawerCommentRecipe
                  id={recipe.id}
                  showFormRecipe={showCommentsRecipe}
                  setShowFormRecipe={setShowCommentsRecipe}
                  onFinished={() => {
                    mutate();
                  }}
                />
              )}
            </div>
          )}

          <div
            className="flex items-center gap-1 text-xs cursor-pointer"
            style={{ width: "50px" }}
            onClick={() => {
              handleRecipeInteract(recipe.id, "save");
            }}
          >
            <Bookmark
              strokeWidth={1}
              size={18}
              className="cursor-pointer"
              fill={recipe.is_saved_by_me || type === "saved" ? "#000" : "#fff"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function deleteRecipe(id: string) {
  const cookie = getCookie("user_token");

  const recipes = await fetch(`${process.env.BASE_URL}/recipe/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
  return recipes;
}

export function ButtonDeleteRecipe({
  id,
  onFinished,
}: {
  id: string;
  onFinished?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  function handleDeleteRecipe(id: string) {
    setIsLoading(true);
    deleteRecipe(id)
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
            onClick={() => handleDeleteRecipe(id)}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
