'use client'

import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function AddDrawer({ title, children, open, setOpen }) {
  return (
    <Transition.Root show={open} as="div">
      <Dialog dir='rtl' as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
              <Transition.Child
                as="div"
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                {/* Ensuring full height */}
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md h-full bg-white shadow-xl transform transition-all flex flex-col">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  {/* Ensure this content takes the available space */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                  </div>
                  {/* Optional footer area */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    {/* Footer content */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
