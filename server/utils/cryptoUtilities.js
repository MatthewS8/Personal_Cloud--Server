const { STORAGE_KEY } = require("../config/config");

let storageKey;
async function loadServerStorageKey() {
  const rawKey = Uint8Array.from(atob(STORAGE_KEY), (c) => c.charCodeAt(0));
  storageKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Get the server storage key
 * @returns {Promise<CryptoKey>} Server storage key
 */
async function getServerKey() {
  if (!storageKey) {
    await loadServerStorageKey();
  }
  return storageKey;
}

/**
 *
 * @param {Uint8Array} data Data to be encrypted
 * @param {CryptoKey} key AES-GCM key
 * @returns {Promise<{iv: Uint8Array, encrypted: string}>} Encrypted data with iv
 */
async function encryptData(data, key, iv) {
  if (!iv) {
    iv = crypto.getRandomValues(new Uint8Array(12));
  }
  console.log("data length", data.length);

  try {
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data
    );

    return {
      iv: Array.from(iv),
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    };
  } catch (error) {
    console.error("Error encrypting data:", error);
    throw error;
  }
}

/**
 *
 * @param {Uint8Array} iv Initialization vector
 * @param {Uint8Array} encrypted data
 * @param {CryptoKey} key AES-GCM key
 * @returns {Promise<Uint8Array>} decrypted data
 */
async function decryptData(iv, encrypted, key) {
  const ivArray = new Uint8Array(iv);
  const encryptedArray = Uint8Array.from(
    atob(encrypted)
      .split("")
      .map((char) => char.charCodeAt(0))
  );

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArray,
      },
      key,
      encryptedArray
    );

    return new Uint8Array(decrypted);
  } catch (error) {
    console.error("Error decrypting data:", error);
    throw error;
  }
}

/**
 *
 * @param {{iv: Uint8Array, encrypted: Uint8Array}} data JSON composed of iv and encrypted data
 * @param {CryptoKey} sessionKey AES-GCM key sent by the client for this session
 * @param {CryptoKey} serverKey AES-GCM key used to encrypt data on the server
 * @returns {Promise<{iv: Uint8Array, encrypted: string}[]>} Array of encrypted data chunks
 */
async function chunkedDecryptEncrypt(
  data,
  sessionKey,
  serverKey = getServerKey()
) {
  const CHUNK_SIZE = 64 * 1024; // 64 KB chunks
  let iv,
    reEncryptedChunks = [];
  for (let start = 0; start < data.length; start += CHUNK_SIZE) {
    let chunk = data.encryptData.slice(start, start + CHUNK_SIZE);
    const decryptedChunk = await decryptData(chunk, sessionKey);
    ({ iv, encrypted } = await encryptData(decryptedChunk, serverKey));
    reEncryptedChunks.push({ iv, encrypted });
  }
  return reEncryptedChunks;
}

module.exports = {
  getServerKey,
  decryptData,
  encryptData,
  chunkedDecryptEncrypt,
};
