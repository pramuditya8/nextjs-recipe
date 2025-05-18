"use client";
import RecipeCard from "@/components/recipe-card";
import { getCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const cookie = getCookie("user_token");

  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
};

export default function RecipeDetail() {
  const pathname = usePathname();
  const { data, mutate } = useSWR(
    `${process.env.BASE_URL}/recipe/${
      pathname.split("/")[pathname.split("/").length - 1]
    }`,
    fetcher
  );

  return <>{data && <RecipeCard recipe={data.data} mutate={mutate} />}</>;
}
