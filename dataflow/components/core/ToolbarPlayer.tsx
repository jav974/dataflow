import { useUserGraph } from "@/dataflow/contexts/UserGraphContext";
import PlayButton from "../buttons/PlayButton";
import { useCallback, useState } from "react";
import { useNodes } from "@/dataflow/contexts/NodeContext";
import { useDashboardContext } from "@/dataflow/contexts/DashboardContext";
import { useGraphContext } from "@/dataflow/contexts/GraphContext";
import { useDataflowContext } from "@/dataflow/contexts/DataflowContext";
import controller from "@/dataflow/engine/controller";
import BaseIcon from "../icons/BaseIcon";
import { StopIcon } from "@hugeicons/core-free-icons";
import { eventBus } from "@/dataflow/events/events";
import { Log } from "@/dataflow/engine/types";
import { keyValueToMap } from "@/dataflow/engine/utils";

export default function ToolbarPlayer() {
    const {graph} = useUserGraph();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const {setGraphResult} = useNodes();
    const {logs} = useDashboardContext();
    const {computedResult, startParams, toGraph} = useGraphContext();
    const {selectedExecutor} = useDataflowContext();

    const onPlay = useCallback(() => {
        if (!isPlaying && graph && selectedExecutor) {
            if (!controller.started) {
                logs.update([]);
            }

            setIsPlaying(true);
            controller.resume();

            if (!controller.started) {
                controller.started = true;

                selectedExecutor(toGraph(), startParams.ref.current).then((result) => {
                    eventBus.emit<Log>('io_write', {type: "debug", createdAt: Date.now(), message: "Return: " + JSON.stringify(result?.result ?? "undefined", null, 2)} as Log)
                    setGraphResult(result);
                    computedResult.update(keyValueToMap(result?.io_values ?? {}));
                }).catch((reason: Error) => {
                    eventBus.emit<Log>('io_write', {type: "error", message: reason.message, createdAt: Date.now()} as Log);
                    setGraphResult(undefined);
                }).finally(() => {
                    controller.started = false;
                    controller.cancelled = false;
                    controller.paused = false;
                    setTimeout(() => setIsPlaying(false), 0);
                });
            }
        } else if (isPlaying) {
            controller.pause();
            setIsPlaying(false);
        }
    }, [graph, isPlaying, selectedExecutor, setGraphResult, toGraph]);

    const handleCancel = useCallback(() => {
        controller.cancel();
        controller.resume();
    }, []);

    return (
        <>
            {graph && <PlayButton isPlaying={isPlaying} onClick={onPlay}/>}
            {controller.started && <BaseIcon icon={StopIcon} color="red" onClick={handleCancel}/>}
        </>
    );
}