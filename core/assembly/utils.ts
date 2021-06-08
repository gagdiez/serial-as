//@ts-ignore
@inline
export function isNumber<V>(): boolean {
  return isInteger<V>() || isFloat<V>()
}