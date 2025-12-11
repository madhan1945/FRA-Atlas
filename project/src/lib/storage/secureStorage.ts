import { supabase } from '../supabaseClient';
import { encapsulate, decapsulate, generateKeyPair, bytesToBase64, base64ToBytes, KemKeyPair } from '../pqc/kem';

// AES-GCM symmetric encryption using shared secret from KEM
async function aesGcmEncrypt(plaintext: Uint8Array, keyBytes: Uint8Array): Promise<{ iv: Uint8Array; ciphertext: Uint8Array }> {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { iv, ciphertext: new Uint8Array(ct) };
}

async function aesGcmDecrypt(iv: Uint8Array, ciphertext: Uint8Array, keyBytes: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new Uint8Array(pt);
}

export interface EncryptedEnvelopeMeta {
  alg: 'Kyber' | 'X25519';
  kem: string; // base64 ciphertext of KEM (Kyber ct or X25519 eph pub)
  iv: string; // base64 AES-GCM IV
}

export interface UploadResult {
  path: string;
  meta: EncryptedEnvelopeMeta;
}

export async function uploadEncrypted(bucket: string, path: string, file: File | Blob): Promise<UploadResult> {
  // 1) Generate recipient keypair (app-side; in real systems use per-user key management)
  const kemKeyPair: KemKeyPair = await generateKeyPair();
  const recipientPub = kemKeyPair.publicKey;

  // 2) Encapsulate to produce shared secret
  const { ciphertext: kemCt, sharedSecret, algorithm } = await encapsulate(recipientPub);

  // 3) Encrypt file
  const buf = new Uint8Array(await (file as Blob).arrayBuffer());
  const { iv, ciphertext } = await aesGcmEncrypt(buf, sharedSecret);

  // 4) Build envelope: store kemCt + iv as metadata, encrypt bytes as content
  const envelope = new Blob([ciphertext], { type: 'application/octet-stream' });
  const { data, error } = await supabase.storage.from(bucket).upload(path, envelope, { upsert: true, contentType: 'application/octet-stream', metadata: {
    pqc_alg: algorithm,
    pqc_kem: bytesToBase64(kemCt),
    iv_b64: bytesToBase64(iv),
    // WARNING: demo-only: store recipient secret key for fallback X25519. In production, manage keys securely.
  }} as any);
  if (error) throw error;

  return {
    path: data?.path || path,
    meta: { alg: algorithm, kem: bytesToBase64(kemCt), iv: bytesToBase64(iv) }
  };
}

export async function downloadDecrypted(bucket: string, path: string, meta: EncryptedEnvelopeMeta, x25519KeyPair?: CryptoKeyPair, secretKeyBytes?: Uint8Array): Promise<Uint8Array> {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  const buf = new Uint8Array(await data.arrayBuffer());

  // Decapsulate shared secret
  const kemCt = base64ToBytes(meta.kem);
  const result = await decapsulate(secretKeyBytes || new Uint8Array([0]), kemCt, x25519KeyPair);
  const iv = base64ToBytes(meta.iv);
  return await aesGcmDecrypt(iv, buf, result.sharedSecret);
}


