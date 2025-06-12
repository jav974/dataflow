import React, { useEffect, useRef, useState } from "react";
import Resizable from "./Resizable";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";
import { useRefSignalRender } from "react-refsignal";

function ConsoleLogs() {
    const {logs} = useDashboardContext();
    const olRef = useRef<HTMLOListElement>(null);

    useEffect(() => {
        if (olRef.current) {
            olRef.current.scrollTop = olRef.current.scrollHeight;
        }
    }, [logs.ref.current.length]); // Trigger when logs change

    useRefSignalRender([logs]);

    return (
        <ol ref={olRef} className="overflow-auto h-full scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-500/10">
            {logs.ref.current.map((v, index) => {
                let liClassName = '';
                switch (v.type) {
                    case 'log':
                        liClassName = '';
                        break ;
                    case 'debug':
                        liClassName = 'text-gray-700';
                        break ;
                    case 'warn':
                        liClassName = 'text-orange-500';
                        break ;
                    case 'error':
                        liClassName = 'text-red-500';
                        break ;
                }
                return (
                    <li className={liClassName} key={index}>{v.message}</li>
                );
            })}
        </ol>
    );
}

export default function Console() {
    const [visible, setVisible] = useState(false);

    return (
        <div className="fixed bottom-0 left-0 w-full flex flex-col items-center z-10000000">
            {/* Toggle Button */}
            <button 
                className="px-4 py-1 bg-black/50 text-white rounded-md shadow-md hover:bg-black/90 transition mb-2"
                onClick={() => setVisible(!visible)}
            >
                {visible ? "Hide Console" : "Show Console"}
          </button>

          {/* Slider */}
          {visible && (
            <div className="flex w-full h-full">
                <Resizable directions={['n']} className="grow" minSize={{width: 0, height: 200}} maxSize={{width: 0, height: 550}}>
                    <div className="min-h-[200px] grow h-full bg-black/90 pl-4 pt-2 pr-1 pb-1">
                        <ConsoleLogs/>
                    </div>
                </Resizable>
            </div>
          )}
        </div>
    );
};
