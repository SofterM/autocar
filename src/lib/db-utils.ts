// src/lib/db-utils.ts
export function toBigInt(value: string | number): bigint {
    return BigInt(value);
}

export function formatBigInt(value: bigint): string {
    return value.toString();
}
