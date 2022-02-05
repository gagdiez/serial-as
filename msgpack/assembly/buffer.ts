export class EncodeBuffer {
  public offset: u32 = 0;
  public buffer_size: u32 = 0;
  public start: usize = heap.alloc(this.buffer_size);

  resize_if_necessary(needed_space: u32): void {
    if (this.buffer_size - this.offset < needed_space) {
      this.buffer_size = max(this.buffer_size * 2, this.buffer_size + needed_space)
      this.start = heap.realloc(this.start, this.buffer_size)
    }
  }

  store<T>(value: T): void {
    this.resize_if_necessary(sizeof<T>())
    if(!isFloat<T>(value)){
      store<T>(this.start + this.offset, bswap(value))
    }else{
      if (value instanceof f32){
        store<u32>(this.start + this.offset, bswap<u32>(reinterpret<u32>(value)))
      }else{
        store<u64>(this.start + this.offset, bswap<u64>(reinterpret<u64>(value)))
      }
      
    }
        
    this.offset += sizeof<T>()
  }

  get_used_buffer(): ArrayBuffer {
    return changetype<ArrayBuffer>(this.start).slice(0, this.offset)
  }

  store_bytes(src: usize, nBytes: u32): void {
    this.resize_if_necessary(nBytes)
    memory.copy(this.start + this.offset, src, nBytes)
    this.offset += nBytes
  }
}

export class DecodeBuffer {
  public offset: u32 = 0;
  public start: usize;

  constructor(public arrBuffer: ArrayBuffer) {
    this.start = changetype<usize>(arrBuffer)
  }

  consume<T>(): T {
    const off = this.offset
    this.offset += sizeof<T>()
    return load<T>(this.start + off)
  }

  consume_slice(length: u32): ArrayBuffer {
    const off = this.offset
    this.offset += length
    return changetype<ArrayBuffer>(this.start).slice(off, off + length)
  }

  consume_copy(dst: usize, length: u32): void {
    memory.copy(dst, this.start + this.offset, length);
    this.offset += length;
  }
}