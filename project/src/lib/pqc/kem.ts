// Lightweight KEM abstraction with optional PQC (CRYSTALS-Kyber) support.
// Falls back to X25519 + HKDF when Kyber implementation isn't available in this environment.


export interface KemKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
  algorithm: 'Kyber' | 'X25519';
}

export interface KemEncapsulation {
  ciphertext: Uint8Array;
  sharedSecret: Uint8Array; // 32 bytes
  algorithm: 'Kyber' | 'X25519';
}

// Attempt dynamic import of a Kyber implementation if available
async function loadKyber() {
  try {
    // You may replace this with a concrete Kyber JS/WASM implementation when adding the dependency.
    // Example placeholder package name: 'crystals-kyber-js'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const kyber = await import('crystals-kyber-js');
    return kyber;
  } catch {
    return null;
  }
}

// Fallback: X25519 via WebCrypto subtle
async function x25519GenerateKey(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'X25519',
      namedCurve: 'X25519' as unknown as EcKeyGenParams['namedCurve'],
    } as unknown as EcKeyGenParams,
    true,
    ['deriveBits']
  ) as unknown as CryptoKeyPair;
}

async function x25519ExportPublicKey(pub: CryptoKey): Promise<Uint8Array> {
  const raw = await crypto.subtle.exportKey('raw', pub);
  return new Uint8Array(raw);
}

async function x25519ImportPublicKey(raw: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'X25519', namedCurve: 'X25519' as unknown as EcKeyGenParams['namedCurve'] },
    true,
    []
  );
}

async function x25519DeriveSharedSecret(priv: CryptoKey, peerPub: CryptoKey): Promise<Uint8Array> {
  const bits = await crypto.subtle.deriveBits({ name: 'X25519', public: peerPub } as any, priv, 256);
  return new Uint8Array(bits);
}

async function hkdf(inputKeyingMaterial: Uint8Array, info: Uint8Array): Promise<Uint8Array> {
  const ikm = await crypto.subtle.importKey('raw', inputKeyingMaterial, 'HKDF', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info },
    ikm,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const raw = await crypto.subtle.exportKey('raw', key);
  return new Uint8Array(raw);
}

export async function generateKeyPair(): Promise<KemKeyPair> {
  const kyber = await loadKyber();
  if (kyber) {
    const { publicKey, secretKey } = kyber.keypair();
    return { publicKey, secretKey, algorithm: 'Kyber' };
  }
  // Fallback X25519
  const kp = await x25519GenerateKey();
  const pubRaw = await x25519ExportPublicKey(kp.publicKey);
  const skRaw = new Uint8Array([0]); // marker; private key stays in CryptoKey
  return { publicKey: pubRaw, secretKey: skRaw, algorithm: 'X25519' };
}

export async function encapsulate(publicKey: Uint8Array): Promise<KemEncapsulation> {
  const kyber = await loadKyber();
  if (kyber) {
    const { ciphertext, sharedSecret } = kyber.encapsulate(publicKey);
    return { ciphertext, sharedSecret, algorithm: 'Kyber' };
  }
  // Fallback: X25519 ECDH + static-ephemeral trick: generate ephemeral, derive secret with recipient pub
  const eph = await x25519GenerateKey();
  const peerPub = await x25519ImportPublicKey(publicKey);
  const rawSecret = await x25519DeriveSharedSecret(eph.privateKey, peerPub);
  const sharedSecret = await hkdf(new Uint8Array(rawSecret), new Uint8Array([1]));
  const ephPubRaw = await x25519ExportPublicKey(eph.publicKey);
  return { ciphertext: ephPubRaw, sharedSecret, algorithm: 'X25519' };
}

export async function decapsulate(secretKey: Uint8Array, ciphertext: Uint8Array, keyPair?: CryptoKeyPair): Promise<KemEncapsulation> {
  const kyber = await loadKyber();
  if (kyber) {
    const sharedSecret = kyber.decapsulate(ciphertext, secretKey);
    return { ciphertext, sharedSecret, algorithm: 'Kyber' };
  }
  // Fallback X25519: need recipient private key CryptoKey (not exportable here). Expect caller to supply it.
  if (!keyPair) throw new Error('X25519 decapsulation requires CryptoKeyPair');
  const ephPub = await x25519ImportPublicKey(ciphertext);
  const rawSecret = await x25519DeriveSharedSecret(keyPair.privateKey, ephPub);
  const sharedSecret = await hkdf(new Uint8Array(rawSecret), new Uint8Array([1]));
  return { ciphertext, sharedSecret, algorithm: 'X25519' };
}

export function bytesToBase64(u8: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64');
  let binary = '';
  u8.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(b64, 'base64'));
  const binary = atob(b64);
  const u8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}


