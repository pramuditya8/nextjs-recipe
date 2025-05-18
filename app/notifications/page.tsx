"use client";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/timeFormatter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { getCookie } from "cookies-next";

const fetcher = async (url: string) => {
  const cookie = getCookie("user_token");
  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cookie}`,
    },
  }).then((res) => res.json());
};

type Notif = {
  id: string;
  message: string;
  created_at: Date | string;
};
export default function NotificationsPage() {
  const { data } = useSWR(`${process.env.BASE_URL}/notifications`, fetcher);
  const [page, setPage] = useState(1);
  return (
    <>
      {data &&
        data?.data.map((notif: Notif) => (
          <Card key={notif.id} className="my-4">
            <CardContent>
              <div className="flex flex-col">
                <div className="text-sm">{notif.message}</div>
                <div className="text-xs text-neutral-500">
                  {timeAgo(notif.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      {data && data.meta.total_pages >= 2 && (
        <div className="flex w-full justify-center my-8 gap-4">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <div className="text-center text-xl">{page}</div>
          <Button
            disabled={page === data.meta.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
