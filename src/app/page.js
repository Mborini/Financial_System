"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowAltCircleDown, FaArrowRight } from "react-icons/fa";
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
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/Fvideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <form onSubmit={handleSubmit} className="p-6">
          <input
            type="password"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter Passcode"
            className="p-1 border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 p-2 bg-orange-400 text-white rounded"
          >
            <FaArrowRight />
          </button>
        </form>
      </div>

      {/* Add Toaster here to display notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
