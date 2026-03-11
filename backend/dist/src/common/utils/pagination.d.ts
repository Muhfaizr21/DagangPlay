export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        lastPage: number;
        currentPage: number;
        perPage: number;
        prev: number | null;
        next: number | null;
    };
}
export type PaginateOptions = {
    page?: number | string;
    perPage?: number | string;
};
export declare const paginate: <T, K>(model: any, args?: any, options?: PaginateOptions) => Promise<PaginatedResult<T>>;
