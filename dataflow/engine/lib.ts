export function isNumeric(value: any): boolean {
    return typeof value === "number" || (typeof value === "string" && Number.isFinite(Number(value)));
}

export function math_add(...numbers: number[]): number {
    return numbers.reduce((previous: number, current: number) => previous + current, 0);
}

export function math_mul(...numbers: number[]): number {
    return numbers.reduce((previous: number, current: number) => previous * current, 1);
}

export function math_sub(...numbers: number[]): number {
    let result: number = numbers[0];

    for (let i = 1; i < numbers.length; ++i) {
        result -= numbers[i];
    }

    return result;
}

export function math_div(...numbers: number[]): number {
    let result: number = numbers[0];

    for (let i = 1; i < numbers.length; ++i) {
        result /= numbers[i];
    }

    return result;
}

export function math_mod(...numbers: number[]): number {
    let result: number = numbers[0];

    for (let i = 1; i < numbers.length; ++i) {
        result %= numbers[i];
    }

    return result;
}
