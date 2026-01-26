export interface ErrorFormat<TField, TError> {
    readonly field: TField;
    readonly errors: readonly TError[];
}
