export function jsonToMap<V = any>(json: string | null | undefined) {
    const obj = JSON.parse(json ?? "{}");
    const map: Map<string, V> = new Map<string, V>();
    
    for (const [key, value] of Object.entries<V>(obj)) {
        map.set(key, value);
    }

    return map;
}
