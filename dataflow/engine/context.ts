// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeyValue<T = any> = Record<string, T>;

interface ExecContext {
    variables: KeyValue;
    result: KeyValue;
}

const executionContext: ExecContext = {
    variables: {},
    result: {}
}

export default executionContext;
