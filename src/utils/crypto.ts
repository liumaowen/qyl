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