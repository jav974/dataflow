import React, { useEffect, useRef, useState } from "react";
import Resizable from "./Resizable";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";
import { useRefSignalRender } from "react-refsignal";
import { SCROLLBAR_STYLE } from "@dataflow-ui/themes/style";

function ConsoleLogs() {
    const { logs } = useDashboardContext();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs.current.length]);

    useRefSignalRender([logs]);

    const getClassName = (type: string) => {
        switch (type) {
            case 'debug':
                return 'text-gray-700';
            case 'warn':
                return 'text-orange-500';
            case 'error':
                return 'text-red-500';
            default:
                return '';
        }
    };

    // Group logs into rows
    const groupedRows: Array<typeof logs.current> = [];
    let currentRow: typeof logs.current = [];

    logs.current.forEach((log) => {
        currentRow.push(log);

        if (log.message.endsWith('\n')) {
            groupedRows.push(currentRow);
            currentRow = [];
        }
    });

    if (currentRow.length > 0) {
        groupedRows.push(currentRow);
    }

    return (
        <div
            ref={containerRef}
            className={`overflow-auto h-full ${SCROLLBAR_STYLE} flex flex-col`}
        >
            {groupedRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-row flex-nowrap">
                    {row.map((log, logIndex) => {
                        let content = log.message;

                        // If message is exactly "\n", render a visible blank line
                        if (content === '\n') {
                            content = '\u00A0'; // non-breaking space
                        } else {
                            content = content.replace(/\n$/, '');
                        }

                        return (
                            <pre
                                key={`${rowIndex}-${logIndex}`}
                                className={`${getClassName(log.type)} whitespace-pre`}
                            >
                                {content}
                            </pre>
                        );
                    })}
                </div>
            ))}
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
