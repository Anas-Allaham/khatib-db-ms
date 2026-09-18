type PropertiesKeys<T> = {
  [P in keyof T]: T[P] extends (...args: any) => any ? never : P;
}[keyof T];
export type Properties<T> = Pick<T, PropertiesKeys<T>>;
