interface ExecContext {
    variables: Map<string, any>;
}

const executionContext: ExecContext = {
    variables: new Map()
}

export default executionContext;
