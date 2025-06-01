import { batch, Signal, signal } from '@preact/signals-core';

export default class GraphCrud<T extends { id: string }> {
    private items: Signal<Map<string, Signal<T>>> = signal(new Map());

    public static load<T extends {id: string}>(items: T[]): GraphCrud<T> {
        const instance = new GraphCrud<T>();

        batch(() => {
            instance.items.value.clear();

            for (const item of items) {
                if (!item.id) {
                    throw new Error('Item must have an id');
                }
                instance.items.value.set(item.id, signal(item));
            }

            instance.items.value = new Map(instance.items.value); // Trigger reactivity
        });

        return instance;
    }

    getItems(): Signal<Map<string, Signal<T>>> {
        return this.items;
    }

    add(item: T): void {
        if (!item.id) {
            throw new Error('Item must have an id');
        }
        this.items.value.set(item.id, signal(item));
        this.items.value = new Map(this.items.value);
    }

    remove(item: Partial<T>): void {
        if (!item.id) {
            throw new Error('Item must have an id to remove');
        }

        if (this.items.value.delete(item.id)) {
            this.items.value = new Map(this.items.value);
        }
    }

    update(item: Partial<T>): void {
        if (!item.id) {
            throw new Error('Item must have an id to update');
        }

        const existingItem = this.items.value.get(item.id);
        if (existingItem) {
            existingItem.value = { ...existingItem.value, ...item } as T;
        } else {
            throw new Error(`Item with id ${item.id} does not exist`);
        }
    }

    getSignal(id: string): Signal<T> | undefined {
        const item = this.items.value.get(id);
        return item ? item : undefined;
    }

    get(id: string): T | undefined {
        return this.getSignal(id)?.value;
    }

    getAllSignals(): Signal<T>[] {
        return Array.from(this.items.value.values());
    }

    getAll(): T[] {
        return this.getAllSignals().map(signalItem => signalItem.value);
    }
}
