import { E_INDEXOUTOFRANGE, E_INVALIDLENGTH } from "util/error";

//@ts-ignore
@inline
export function isNumber<V>(): boolean {
  return isInteger<V>() || isFloat<V>()
}

export function allocObj<T>(): T {
  return changetype<T>(__new(offsetof<T>(), idof<T>()));
}

// From:
// https://github.com/AssemblyScript/assemblyscript/blob/a7f7226dabd0d33df440ae9057fa229b6174eb7a/std/assembly/typedarray.ts#L1817
// @ts-ignore: decorator
@inline
export function WRAP<TArray extends ArrayBufferView, T>(
  buffer: ArrayBuffer,
  // size: u32,
  // align: i32,
  byteOffset: i32 = 0,
  length: i32 = -1
): TArray {
  var byteLength: i32;
  var bufferByteLength = buffer.byteLength;
  const mask: u32 = sizeof<T>() - 1;
  if (i32(<u32>byteOffset > <u32>bufferByteLength) | (byteOffset & mask)) {
    throw new RangeError(E_INDEXOUTOFRANGE);
  }
  if (length < 0) {
    if (length == -1) {
      if (bufferByteLength & mask) {
        throw new RangeError(E_INVALIDLENGTH);
      }
      byteLength = bufferByteLength - byteOffset;
    } else {
      throw new RangeError(E_INVALIDLENGTH);
    }
  } else {
    byteLength = length << alignof<T>();
    if (byteOffset + byteLength > bufferByteLength) {
      throw new RangeError(E_INVALIDLENGTH);
    }
  }
  var out = changetype<TArray>(__new(offsetof<TArray>(), idof<TArray>()));
  store<usize>(changetype<usize>(out), changetype<usize>(buffer), offsetof<TArray>("buffer"));
  __link(changetype<usize>(out), changetype<usize>(buffer), false);
  store<u32>(changetype<usize>(out), byteLength, offsetof<TArray>("byteLength"));
  store<usize>(changetype<usize>(out), changetype<usize>(buffer) + <usize>byteOffset, offsetof<TArray>("dataStart"));
  return out;
}