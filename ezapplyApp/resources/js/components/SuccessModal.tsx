import React from "react";

export default function SuccessModal({ show, message, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-600">
          Success
        </h3>

        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
          {message}
        </p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
