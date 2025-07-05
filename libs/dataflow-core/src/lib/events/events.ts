import { EventEmitter } from "node:events";
// import type { EventEmitter as EEType } from 'events';
// const EventEmitter: typeof EEType = require('events').EventEmitter;

export const eventBus = new EventEmitter();

export function NodeUpdateEvent(nodeId: string): string {
    return `node#${nodeId}`;
}

export function NodePositionUpdateEvent(nodeId: string): string {
    return `nodepos#${nodeId}`;
}

export function emitLastUpdated(name: string) {
    eventBus.emit<number>(name, Date.now());
}

export function emitNodeUpdated(nodeId: string) {
    emitLastUpdated(NodeUpdateEvent(nodeId));
}

export function emitNodePositionUpdated(nodeId: string) {
    emitLastUpdated(NodePositionUpdateEvent(nodeId));
}

export function subscribe<T>(name: string, listener: (payload: T) => void) {
    eventBus.on(name, listener);
}

export function unsubscribe<T>(name: string, listener: (payload: T) => void) {
    eventBus.off(name, listener);
}
