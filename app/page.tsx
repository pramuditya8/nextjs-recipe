"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useSWR from "swr";
import DrawerFormRecipe from "@/components/drawer-form-recipe";
import RecipeCard from "../components/recipe-card";
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
const fetcher = async (url: string) => {
  const cookie = getCookie("user_token");
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
};

export default function Home() {
  const [showFormCreateRecipe, setShowFormCreateRecipe] = useState(false);
  const [page, setPage] = useState(1);
  const {
    data: recipes,
    isLoading: isRecipesLoading,
    mutate,
  } = useSWR(`${process.env.BASE_URL}/recipes?page=${page}`, fetcher);

  return (
    <>
      {isRecipesLoading && <div>Loading...</div>}
      {!isRecipesLoading && (
        <div>
          {/* Create */}
          <DrawerFormRecipe
            showFormRecipe={showFormCreateRecipe}
            setShowFormRecipe={setShowFormCreateRecipe}
            onFinished={() => {
              mutate();
              setShowFormCreateRecipe(false);
            }}
          />

          <div className="w-full">
            <Button
              className="flex ml-auto mt-3 cursor-pointer"
              variant="secondary"
              onClick={() => setShowFormCreateRecipe(true)}
            >
              + Create Recipe
            </Button>
            {recipes?.data?.map((recipe: Recipe) => (
              <div key={recipe.id}>
                <RecipeCard recipe={recipe} mutate={mutate} />
              </div>
            ))}
            {recipes.meta.total_pages >= 2 && (
              <div className="flex w-full justify-center my-8 gap-4">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Prev
                </Button>
                <div className="text-center text-xl">{page}</div>
                <Button
                  disabled={page === recipes.meta.total_pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
