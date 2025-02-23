"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CheckPassword() {
  const router = useRouter();

  useEffect(() => {
    // Check if the 'userPassword' cookie exists
    const password = Cookies.get("userPassword");

    if (!password) {
      // Redirect to the login page if no password is found in cookies
      router.push("/");
    }
  }, [router]); // Empty dependency array ensures this runs on component mount

  return null; // This component doesn't render anything
}
