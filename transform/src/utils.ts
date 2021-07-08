import { Source, Range } from "visitor-as/as";

let isStdlibRegex =
  /\~lib\/(?:array|arraybuffer|builtins|dataview|date|error|function|iterator|map|number|object|process|reference|regexp|set|staticarray|string|symbol|typedarray|vector|rt\/common|bindings\/wasi_snapshot_preview1|shared\/typeinfo)/;

export function isStdlib(s: Source | { range: Range }): boolean {
  let source = s instanceof Source ? s : s.range.source;
  return isStdlibRegex.test(source.internalPath);
}

