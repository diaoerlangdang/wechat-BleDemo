
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

//字符串转Uint8Array 十六进制
function stringToUint8Array (data) {
  // var data = 'AA5504B10000B5'
  var typedArray = new Uint8Array(data.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
  }))

  return typedArray
}

//字符串转buffer 十六进制
function stringToHexBuffer (data) {
  return stringToUint8Array(data).buffer
}

//字符串转arraybuffer
function char2Uint8Array (str) {
  let bytes = new Array(); 
	let len,c;
	len = str.length;
	for(let i = 0; i < len; i++){
		c = str.charCodeAt(i);
		if(c >= 0x010000 && c <= 0x10FFFF){
			bytes.push(((c >> 18) & 0x07) | 0xF0);
			bytes.push(((c >> 12) & 0x3F) | 0x80);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		}else if(c >= 0x000800 && c <= 0x00FFFF){
			bytes.push(((c >> 12) & 0x0F) | 0xE0);
			bytes.push(((c >> 6) & 0x3F) | 0x80);
			bytes.push((c & 0x3F) | 0x80);
		}else if(c >= 0x000080 && c <= 0x0007FF){
			bytes.push(((c >> 6) & 0x1F) | 0xC0);
			bytes.push((c & 0x3F) | 0x80);
		}else{
			bytes.push(c & 0xFF);
		}
  }
	return new Uint8Array(bytes);
}

function char2buf(str) {
  return this.char2Uint8Array(str).buffer
}

//arraybuffer 转字符串
function buf2char(arr) {
  if(typeof arr === 'string') {  
    return arr;  
  }  
  let dataview = new DataView(arr);
  let ints = new Uint8Array(arr.byteLength);
  for(let i=0; i<ints.length; i++){
    ints[i]=dataview.getUint8(i);
  }
  arr = ints;
  let str = '';
  let _arr = arr;  
  for(let i = 0; i < _arr.length; i++) {  
      let one = _arr[i].toString(2);
      let v = one.match(/^1+?(?=0)/);  
      if(v && one.length == 8) {  
          let bytesLength = v[0].length;  
          let store = _arr[i].toString(2).slice(7 - bytesLength);  
          for(let st = 1; st < bytesLength; st++) {  
              store += _arr[st + i].toString(2).slice(2);  
          }  
          str += String.fromCharCode(parseInt(store, 2));  
          i += bytesLength - 1;  
      } else {  
          str += String.fromCharCode(_arr[i]);  
      }  
  }  
  return str;
}

module.exports = {
  ab2hex,
  stringToUint8Array,
  stringToHexBuffer,
  char2Uint8Array,
  char2buf,
  buf2char
}
