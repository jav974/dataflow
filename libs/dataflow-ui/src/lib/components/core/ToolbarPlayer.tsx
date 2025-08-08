import { useUserGraphContext } from "@dataflow-ui/contexts/UserGraphContext";
import PlayButton from "../buttons/PlayButton";
import { useCallback, useState } from "react";
import { useNodeContext } from "@dataflow-ui/contexts/NodeContext";
import { useDashboardContext } from "@dataflow-ui/contexts/DashboardContext";
import { useGraphContext } from "@dataflow-ui/contexts/GraphContext";
import { useDataflowContext } from "@dataflow-ui/contexts/DataflowContext";
import { controller, eventBus, keyValueToMap, Log } from "@dataflow-ide/dataflow-core";
import BaseIcon from "../icons/BaseIcon";
import { StopIcon } from "@hugeicons/core-free-icons";

export default function ToolbarPlayer() {
    const {graph} = useUserGraphContext();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const {setGraphResult} = useNodeContext();
    const {logs} = useDashboardContext();
    const {computedResult, startParams, toGraph} = useGraphContext();
    const {mode} = useDataflowContext();

    const onPlay = useCallback(() => {
        controller.setMode(mode ?? "local");

        if (!isPlaying && graph) {
            if (controller.paused) {
                controller.resume(() => setIsPlaying(true));
            }

            if (!controller.started) {
                setIsPlaying(true);
                logs.update([]);

                controller.start(
                    toGraph(),
                    startParams.current,
                ).then((result) => {
                    eventBus.emit<Log>('io_write', {type: "debug", createdAt: Date.now(), message: "Return: " + JSON.stringify(result?.result ?? "undefined", null, 1)} as Log)
                    setGraphResult(result);
                    computedResult.update(keyValueToMap(result?.io_values ?? {}));
                }).catch((reason: Error) => {
                    eventBus.emit<Log>('io_write', {type: "error", message: reason.message, createdAt: Date.now()} as Log);
                    setGraphResult(undefined);
                    computedResult.update(new Map());
                }).finally(() => {
                    setTimeout(() => setIsPlaying(false), 0);
                });
            }
        } else if (isPlaying) {
            controller.pause(() => setIsPlaying(false));
        }
    }, [graph, isPlaying, setGraphResult, toGraph, mode, computedResult, logs, startParams]);

    const handleCancel = useCallback(() => {
        controller.cancel(() => {
            setIsPlaying(false);
        });
    }, []);

    return (
        <>
            {graph && <PlayButton isPlaying={isPlaying} onClick={onPlay}/>}
            {controller.started && <BaseIcon icon={StopIcon} color="red" onClick={handleCancel}/>}
        </>
    );
}