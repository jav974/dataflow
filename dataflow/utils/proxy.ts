type WithTarget<T, F> = F extends (...args: infer A) => infer R
    ? (target: T, ...args: A) => R
    : never;

export type Proxied<T, IncludeTarget extends boolean> = {
    [K in keyof T]?: T[K] extends (...args: any[]) => any
        ? IncludeTarget extends true
            ? WithTarget<T, T[K]>
            : (...args: Parameters<T[K]>) => ReturnType<T[K]>
        : never;
};

type ProxyResult<T, IncludeTarget extends boolean> =
    T & { [K in keyof Proxied<T, IncludeTarget>]: NonNullable<Proxied<T, IncludeTarget>[K]> };

export function createProxyWithTarget<T extends object>(
    base: T,
    overrides: Proxied<T, true>
): ProxyResult<T, true> {
    return new Proxy(base, {
        get(target, prop, receiver) {
            const override = overrides[prop as keyof T];
            const original = Reflect.get(target, prop, receiver);

            if (typeof original === 'function' && typeof override === 'function') {
                return (...args: any[]) => (override as any)(base, ...args);
            }

            return typeof original === 'function' ? original.bind(target) : original;
        }
    }) as ProxyResult<T, true>;
}

export function createProxy<T extends object>(
    base: T,
    overrides: Proxied<T, false>
): ProxyResult<T, false> {
    return new Proxy(base, {
        get(target, prop, receiver) {
            const override = overrides[prop as keyof T];
            const original = Reflect.get(target, prop, receiver);

            if (typeof original === 'function' && typeof override === 'function') {
                return (...args: any[]) => (override as any)(...args);
            }

            return typeof original === 'function' ? original.bind(target) : original;
        }
    }) as ProxyResult<T, false>;
}
