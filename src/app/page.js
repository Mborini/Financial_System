"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowAltCircleDown,
  FaArrowCircleRight,
  FaArrowRight,
  FaCode,
  FaUserAlt,
} from "react-icons/fa";
import Cookies from "js-cookie"; // Import js-cookie
import { Toaster, toast } from "react-hot-toast"; // Import toast

export default function BackgroundVideo() {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue === "702857") {
      // Save the password in cookies
      Cookies.set("userPassword", inputValue, { expires: 1 }); // expires in 1 day
      router.push("/statistics"); // Redirect to the dashboard
    } else if (inputValue === "") {
      // Trigger error toast notification
      toast.error("🙏 Please enter a passcode.");
    } else {
      // Trigger error toast notification
      toast.error("🥺 oops! Wrong passcode.");
    }
  };

  return (
    <div className="relative -mt-16 h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover filter blur-sm"
      >
        <source src="/Fvideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <form onSubmit={handleSubmit} className="relative w-full max-w-md p-6">
          {/* Label and input structure from your provided style */}
          <label
            htmlFor="search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Passcode
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <FaUserAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="password"
              id="search"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter Passcode"
              className="block w-full p-4 ps-10 text-sm  text-gray-900   rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
            <button
              type="submit"
              className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Login
            </button>
          </div>
        </form>
      </div>

      {/* Add Toaster here to display notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
