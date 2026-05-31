"use server";
import { register } from "../services/auth";
import { login } from "../services/auth";


import { revalidatePath } from "next/cache";

export const addUser = async (data) => {
  try {
    const res = await register(data);
    revalidatePath("/register");
    return res;
  } catch (error) {
    throw new Error(error.message);
  }
};


export const LoginUser = async (data) => {
  try {

    const res = await login(data);
     revalidatePath("en/login");

    return res;

  }
  catch(error) {
    throw new Error(error.message);
  }
};



