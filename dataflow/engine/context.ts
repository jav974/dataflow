import { GraphType } from "../config/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeyValue<T = any> = Record<string, T>;

interface ExecContext {
    variables: KeyValue;
    types: KeyValue<GraphType>;
    result: KeyValue;
}

const executionContext: ExecContext = {
    variables: {},
    types: {},
    result: {}
}

export default executionContext;
