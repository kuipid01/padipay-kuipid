"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser() {
  console.log("hit here ")
  const cookieStore =await  cookies();

  cookieStore.set("token", "", {
    expires: new Date(0),
    path: "/",
  });

  cookieStore.set("borrower_token", "", {
    expires: new Date(0),
    path: "/",
  });

  redirect("/login");
}