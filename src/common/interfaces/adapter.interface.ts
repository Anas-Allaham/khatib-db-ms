export interface Adapter<T> {
  adapt(raw: any): T | Promise<T>;
}
