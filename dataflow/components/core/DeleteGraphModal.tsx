import { useCallback } from "react";
import Modal from "./Modal";

interface DeleteGraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    graphName: string;
}

export default function DeleteGraphModal({ isOpen, onClose, onConfirm, graphName }: DeleteGraphModalProps) {
    const handleConfirm = useCallback(() => {
        onConfirm();
        onClose();
    }, [onConfirm, onClose]);

    return (
        <Modal title="Delete Graph" isOpen={isOpen}>
            <p className="text-gray-400 mb-6">
                Are you sure you want to delete the graph &ldquo;{graphName}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 hover:bg-gray-800 rounded"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Delete
                </button>
            </div>
        </Modal>
    );
} 