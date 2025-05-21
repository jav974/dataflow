export type KeyValue<T = any> = {
    [key: string]: T;
}

interface ExecContext {
    variables: KeyValue;
    result: KeyValue;
}

const executionContext: ExecContext = {
    variables: {},
    result: {}
}

export default executionContext;
