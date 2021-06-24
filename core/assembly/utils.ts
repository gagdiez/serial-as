//@ts-ignore
@inline
export function isNumber<V>(): boolean {
  return isInteger<V>() || isFloat<V>()
}

export function allocObj<T>(): T {
  return changetype<T>(__new(offsetof<T>(), idof<T>()));
}