import React, { useEffect, useState } from "react";
import { FaExclamationTriangle, FaQuestion } from "react-icons/fa";

export default function ConfirmAlertModal({
  isOpen,
  onClose,
  body,
  onConfirm,
  title,
  message,
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true); // Trigger the enter animation
    } else {
      setTimeout(() => setIsVisible(false), 300); // Delay hiding the modal for the exit animation
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center ${
        isOpen ? "fade-in" : "fade-out"
      }`}
    >
      <div
        className={`bg-white p-4 rounded-lg shadow-lg w-96 transform transition-transform duration-300 ${
          isOpen ? "scale-100" : "scale-90"
        }`}
      >
        <div className="flex gap-2 text-yellow-400">
          {" "}<FaExclamationTriangle size={30} />
          <h2 className="text-xl font-semibold">
             {title}
          </h2>
        </div>{" "}
        <h2 className="text-xl font-semibold">{body}</h2>
        <p className="my-4">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onConfirm}
            className="bg-yellow-400 ml-2 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded"
          >
            حسناً
          </button>
         
        </div>
      </div>
    </div>
  );
}
