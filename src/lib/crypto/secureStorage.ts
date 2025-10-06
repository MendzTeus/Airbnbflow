const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importKeyMaterial(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveKey"]);
}

export async function deriveAesKey(secret: string, salt: string) {
  const keyMaterial = await importKeyMaterial(secret);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 120_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptJson<T>(data: T, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = encoder.encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, payload);
  return {
    cipher: bufferToBase64(encrypted),
    iv: bufferToBase64(iv.buffer),
  };
}

export async function decryptJson<T>(payload: { cipher: string; iv: string }, key: CryptoKey): Promise<T> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(base64ToBuffer(payload.iv)) },
    key,
    base64ToBuffer(payload.cipher)
  );
  return JSON.parse(decoder.decode(decrypted));
}

export function hasWebCryptoSupport() {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
}
