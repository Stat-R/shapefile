import slice from "slice-source";
import dbf_cancel from "./cancel";
import dbf_read from "./read";
import view from "../view";

export default function(source, decoder) {
  source = slice(source);
  return source.slice(32).then(function(array) {
    var head = view(array);
    return source.slice(head.getUint16(8, true) - 32).then(function(array) {
      return new Dbf(source, decoder, head, view(array));
    });
  });
}

function Dbf(source, decoder, head, body) {
  this._source = source;
  this._decode = decoder.decode.bind(decoder);
  this._recordLength = head.getUint16(10, true);
  this.version = head.getUint8(0);
  this.date = new Date(1900 + head.getUint8(1), head.getUint8(2) - 1, head.getUint8(3));
  this.length = head.getUint32(4, true);
  this.fields = [];
  for (var n = 0; body.getUint8(n) !== 0x0d; n += 32) {
    for (var j = 0; j < 11; ++j) if (body.getUint8(n + j) === 0) break;
    this.fields.push({
      name: String.fromCharCode.apply(String, new Uint8Array(body.buffer, body.byteOffset + n, j)),
      type: String.fromCharCode(body.getUint8(n + 11)),
      length: body.getUint8(n + 16)
    });
  }
}

var prototype = Dbf.prototype;
prototype.read = dbf_read;
prototype.cancel = dbf_cancel;
