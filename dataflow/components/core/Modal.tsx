import React from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
    title: string;
    isOpen: boolean;
    children?: React.ReactNode;
}

export default function Modal({title, isOpen, children}: ModalProps) {
    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-2000">
            <div className="bg-black border border-gray-800 rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
                {children}
            </div>
        </div>,
        document.body
    );
}
