"use client";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import useSWR from "swr";
import DrawerFormRecipe from "@/components/drawer-form-recipe";
import RecipeCard from "@/components/recipe-card";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";

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

const fetcherUserMe = async (url: string) => {
  const cookie = getCookie("user_token");
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
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

const fetcherSaved = async (url: string) => {
  const cookie = getCookie("user_token");
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
};

export default function ProfilePage() {
  const [showFormCreateRecipe, setShowFormCreateRecipe] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSaved, setPageSaved] = useState(1);
  const {
    data: recipes,
    isLoading: isRecipesLoading,
    mutate,
  } = useSWR(`${process.env.BASE_URL}/recipes?page=${page}&type=me`, fetcher);
  const {
    data: recipesSaved,
    isLoading: isRecipesSavedLoading,
    mutate: mutateSaved,
  } = useSWR(
    `${process.env.BASE_URL}/recipe/saves?page=${pageSaved}`,
    fetcherSaved
  );
  const { data: userMe, isLoading: isUserMeLoading } = useSWR(
    `${process.env.BASE_URL}/user/me`,
    fetcherUserMe
  );
  const router = useRouter();
  return (
    <>
      {isRecipesLoading && isRecipesSavedLoading && isUserMeLoading && (
        <div>Loading...</div>
      )}
      {!isRecipesLoading &&
        !isRecipesSavedLoading &&
        !isUserMeLoading &&
        userMe &&
        recipes &&
        recipesSaved && (
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

            <Card className="my-4">
              <CardContent>
                <div className="flex justify-center items-center gap-2">
                  <User size={18} />
                  <p className="font-bold text-sm">{userMe.data.name}</p>
                </div>
                <div className="w-full mt-2">
                  <p className="text-xs text-gray-500 ml-2 font-normal text-center">
                    {userMe.data.email}
                  </p>
                  <Button
                    variant="secondary"
                    className="flex m-auto mt-2 cursor-pointer"
                    onClick={() => {
                      deleteCookie("user_token");
                      router.push("/auth/login");
                    }}
                  >
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="my-recipes">
              <TabsList className="w-full">
                <TabsTrigger value="my-recipes">My Recipes</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
              <TabsContent value="my-recipes">
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
                      {/* Edit */}
                      {/* <DrawerFormRecipe
                  id={recipe.id}
                  values={{
                    ...recipe,
                    content: typeof recipe.content === "string" ? recipe.content : String(recipe.content),
                  }}
                  showFormRecipe={showFormEditRecipe}
                  setShowFormRecipe={setShowFormEditRecipe}
                  onFinished={() => {
                    mutate();
                    setShowFormEditRecipe(false);
                    if (editRecipeValues) setEditRecipeValues(null);
                  }}
                /> */}
                      <div>
                        <RecipeCard
                          recipe={recipe}
                          mutate={() => {
                            mutateSaved();
                            mutate();
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {recipes.meta.total_pages >= 2 && (
                    <div className="flex w-full justify-center my-8 gap-4">
                      <Button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
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
              </TabsContent>
              <TabsContent value="saved">
                <div className="w-full">
                  {recipesSaved?.data?.map((recipe: Recipe) => (
                    <div key={recipe?.recipe.id}>
                      <RecipeCard
                        recipe={recipe?.recipe}
                        type="saved"
                        mutate={() => {
                          mutateSaved();
                          mutate();
                        }}
                      />
                    </div>
                  ))}

                  {recipesSaved.meta.total_pages >= 2 && (
                    <div className="flex w-full justify-center my-8 gap-4">
                      <Button
                        disabled={pageSaved === 1}
                        onClick={() => setPageSaved(pageSaved - 1)}
                      >
                        Prev
                      </Button>
                      <div className="text-center text-xl">{pageSaved}</div>
                      <Button
                        disabled={pageSaved === recipesSaved.meta.total_pages}
                        onClick={() => setPageSaved(pageSaved + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
    </>
  );
}
