import React, { useEffect, useRef, useState } from "react";
import Resizable from "./Resizable";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";
import { useRefSignalRender } from "react-refsignal";
import { SCROLLBAR_STYLE } from "@dataflow-ui/themes/style";

function ConsoleLogs() {
    const {logs} = useDashboardContext();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs.current.length]); // Trigger when logs change

    useRefSignalRender([logs]);

    return (
        <div ref={containerRef} className={`overflow-auto h-full ${SCROLLBAR_STYLE}`}>
            {logs.current.map((v, index) => {
                let className = '';
                switch (v.type) {
                    case 'log':
                        className = '';
                        break ;
                    case 'debug':
                        className = 'text-gray-700';
                        break ;
                    case 'warn':
                        className = 'text-orange-500';
                        break ;
                    case 'error':
                        className = 'text-red-500';
                        break ;
                }
                const hasNewLine = v.message.endsWith("\n");
                let message = v.message.replaceAll(" ", "&nbsp;");

                if (hasNewLine) {
                    message = message.slice(0, -1);
                    message += "<br/>";
                }

                return (
                    <span className={className} key={index} dangerouslySetInnerHTML={{__html: message}} />
                );
            })}
        </div>
    );
}

export default function Console() {
    const [visible, setVisible] = useState(false);

    return (
        <div className="fixed bottom-0 left-0 w-full flex flex-col items-center z-100000">
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
                    <div className="min-h-[200px] max-h-[550px] grow h-full bg-black/90 pl-4 pt-2 pr-1 pb-1">
                        <ConsoleLogs/>
                    </div>
                </Resizable>
            </div>
          )}
        </div>
    );
};
