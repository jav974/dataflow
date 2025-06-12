import { eventBus } from "../events/events"

class ExecutionController {
    started = false;
    paused = false;
    cancelled = false;

    pause() {
        this.paused = true;
        eventBus.emit("pause");
    }
    resume() {
        this.paused = false;
        eventBus.emit("resume");
    }
    cancel() {
        this.cancelled = true;
        eventBus.emit("cancel");
    }

    async waitIfPaused() {
        while (this.paused) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

const controller = new ExecutionController();

export default controller;
