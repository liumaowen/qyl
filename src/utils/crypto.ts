import CryptoJS from 'crypto-js';

/**
 * AES 加密
 * KEY:  需要前后端保持一致
 * mode: ECB  需要前后端保持一致
 * pad: Pkcs7 //前端 Pkcs7 对应 后端 Pkcs5
 */
const KEY = CryptoJS.enc.Utf8.parse('gFzviOY0zOxVq1cu') // 秘钥

// const KEY = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex)

// 生成随机的iv
const iv = CryptoJS.enc.Utf8.parse('ZmA0Osl677UdSrl0')
export const AES_UUID = () => {
  return crypto.randomUUID().replace(/-/g, '');
}

export const AES_Encrypt = (plaintext:string) => {
  let ciphertext:string = CryptoJS.AES.encrypt(plaintext, KEY, {
	  iv:iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
  return ciphertext
}

/**
 * AES 解密
 */
export const AES_Decrypt = (jsonStr:string) => {
  let plaintext:string = CryptoJS.AES.decrypt(jsonStr, KEY, {
	iv:iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8)
  return plaintext
}

/**
 * SHA256
 */
export const CreatMD5 = (jsonStr:string) => {
	let text:string = CryptoJS.MD5(jsonStr).toString()
	return text
}

/**
 * SHA1
 */
export const getm3u8 = (e : string, t : string, n = "wB760Vqpk76oRSVA1TNz") => {
	const r = Math.floor(Date.now() / 1e3).toString()
		, o = CreatMD5(`${n}/${t}${r}`).toString().toLowerCase();
	return `${t.includes("http") ? t : e + t}?sign=${o}&t=${r}`
}
export const fetchAndDecrypt = async (url:string) => {
  try {
      // 从URL中提取文件信息，包括MIME类型
      const { mimeType } = extractFileInfo(url);
      // 发起GET请求获取加密数据（arraybuffer格式）
      const response = await fetch(url);
      if (!response.ok) {
          console.log(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();

      // 尝试将arraybuffer解码为UTF-8字符串
      const decoder = new TextDecoder('utf-8');
      const dataString = decoder.decode(arrayBuffer);
      let decryptedData;
      if (isBase64(dataString)){
        decryptedData = decryptBase64Data(dataString);
      } else{
        const base64String = arrayBufferToBase64(arrayBuffer);
        decryptedData = decryptBase64Data(base64String);
      }

      // 返回解密后的Blob对象，指定正确的MIME类型
      return new Blob([decryptedData], {
          type: mimeType
      });
  } catch (error) {
      // 捕获并抛出异常
      throw error;
  }
}
interface MimeTypeMap {
  [key: string]: string[];
}
const Me:MimeTypeMap  = {
  pic: ["image/jpeg", "image/jpg", "image/png", "image/apng", "image/gif", "image/webp", "image/ico"],
  video: ["video/mp4", "video/x-flv", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/x-wav"],
  app: ["application/octet-stream", "application/x-msdownload", "application/x-apple-diskimage", "application/vnd.android.package-archive"],
  zip: ["application/x-zip-compressed", "application/x-gzip"]
};
function extractFileInfo(url: string) {
  const fileName = url.substring(url.lastIndexOf('/') + 1);
  const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
  return {
      fileName,
      mimeType: getMimeType(`.${fileExtension}`)
  };
}
function getMimeType(ext: string): string {
  for (const key in Me) {
    if (Object.prototype.hasOwnProperty.call(Me, key)) {
      const types = Me[key] as string[];
      if (types.some(type => type.includes(ext))) {
        return types[0];
      }
    }
  }
  return "image/jpeg";
}
function arrayBufferToBase64(buffer: any) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
function decryptBase64Data(base64Str:any) {
  const decryptor = CryptoJS.AES.decrypt(base64Str, KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);

  const parsed = CryptoJS.enc.Base64.parse(decryptor);
  return new Uint8Array(parsed.words.flatMap(word => [
      (word >> 24) & 0xff,
      (word >> 16) & 0xff,
      (word >> 8) & 0xff,
      word & 0xff
  ]));
}
function isBase64(e:any) {
  try {
      return btoa(atob(e)) === e
  } catch (t) {
      return !1
  }
}
function pad(n: number): string {
  return n < 10 ? '0' + n : n.toString();
}
export const formatDate = (date:Date) => {
  return date.getFullYear() + '-' +
    pad(date.getMonth() + 1) + '-' +
    pad(date.getDate()) + ' ' +
    pad(date.getHours()) + ':' +
    pad(date.getMinutes()) + ':' +
    pad(date.getSeconds());
}