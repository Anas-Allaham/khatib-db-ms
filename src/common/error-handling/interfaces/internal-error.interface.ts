
export interface InternalError {
    code: string;
    message: string;
}

export interface ErrorMappingStrategy<T> {
    match(error: T): boolean;
    map(error: T): InternalError;
}