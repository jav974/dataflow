import Modal from "@/dataflow/components/core/Modal";
import React, { useState, useRef } from "react";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"];

interface FetchConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function FetchConfigModal({isOpen, onClose}: FetchConfigModalProps) {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const sendRequest = async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    controllerRef.current = new AbortController();
    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};
      const options: RequestInit = {
        method,
        headers: parsedHeaders,
        body: ["POST", "PUT"].includes(method) ? body : undefined,
        signal: controllerRef.current.signal,
      };

      const res = await fetch(url, options);
      const endTime = performance.now();
      setResponseTime(endTime - startTime);
      setStatus(res.status);
      setResponse(await res.json());
    } catch (err) {
      setError("Error fetching data");
      console.log(err);
    }
    setLoading(false);
  };

  const cancelRequest = () => {
    controllerRef.current?.abort();
    setError("Request canceled");
    setLoading(false);
  };

  return (
    <Modal title="Configure Fetch options" isOpen={isOpen}>
        <div className="flex text-sm">
            {/* HTTP Method Selection */}
            <select
                className="p-2 outline bg-black focus:outline-blue-500"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
            >
                {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>

            {/* URL Input */}
            <input
                type="text"
                placeholder="Enter API URL"
                className="w-full p-2 outline focus:outline-blue-500"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
        </div>

        {/* Headers Input */}
        <textarea
            className="w-full p-2 mt-2 border rounded"
            placeholder='{"Authorization": "Bearer token"}'
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
        />

        {/* Body Input (Only for POST/PUT) */}
        {["POST", "PUT"].includes(method) && (
            <textarea
                className="w-full p-2 mt-2 border rounded"
                placeholder="Enter request body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mt-4">
            <button
                onClick={sendRequest}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? "Fetching..." : "Send Request"}
            </button>
            {loading &&
            <button
                onClick={cancelRequest}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Cancel
            </button>
            }
        </div>

        <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Close
            </button>
        </div>

        {/* Response Details */}
        {status !== null && (
            <div className="mt-4 p-4 rounded">
                <p className="font-bold">Status Code: {status}</p>
                <p>Response Time: {responseTime?.toFixed(2)} ms</p>
                {error && <p className="text-red-600">{error}</p>}
                <pre className="text-sm bg-gray-500 text-white p-2 rounded overflow-auto">
                    {JSON.stringify(response, null, 2)}
                </pre>
            </div>
        )}
    </Modal>
  );
};
