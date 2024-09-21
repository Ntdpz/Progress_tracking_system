// crypto.js
import CryptoJS from 'crypto-js';

const secretKey = 'progress-tracking';

export function encodeId(id) {
    return CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
}

export function decodeId(encodedId) {
    const bytes = CryptoJS.AES.decrypt(encodedId, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}
