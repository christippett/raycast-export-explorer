import { inflate } from 'pako';

export class RaycastConfig {
  private rawData: Uint8Array = new Uint8Array();

  constructor() { }

  /**
   * Generate AES key and IV from passphrase using SHA-256
   */
  private async getKey(passphrase: string): Promise<{ key: Uint8Array; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const passwdBytes = encoder.encode(passphrase);

    // First hash: SHA-256(password)
    const d1ArrayBuffer = await crypto.subtle.digest('SHA-256', passwdBytes);
    const d1 = new Uint8Array(d1ArrayBuffer);

    // Second hash: SHA-256(D1 + password)
    const combined = new Uint8Array(d1.length + passwdBytes.length);
    combined.set(d1);
    combined.set(passwdBytes, d1.length);

    const d2ArrayBuffer = await crypto.subtle.digest('SHA-256', combined);
    const d2 = new Uint8Array(d2ArrayBuffer);

    // Key: first 32 bytes of D1, IV: first 16 bytes of D2
    const key = d1.slice(0, 32);
    const iv = d2.slice(0, 16);

    return { key, iv };
  }

  /**
   * Decrypt the encrypted data using AES-256-CBC
   */
  private async decrypt(passphrase: string, encryptedData: Uint8Array): Promise<Uint8Array> {
    const { key, iv } = await this.getKey(passphrase);

    // Import the key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    // Decrypt the data
    const decryptedArrayBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      encryptedData
    );

    const decryptedData = new Uint8Array(decryptedArrayBuffer);

    // Remove PKCS7 padding
    const paddingLen = decryptedData[decryptedData.length - 1];
    const unpaddedData = decryptedData.slice(0, decryptedData.length - paddingLen);

    // Remove header (first 16 bytes)
    return unpaddedData.slice(16);
  }

  /**
   * Encrypt data using AES-256-CBC (for potential export functionality)
   */
  private async encrypt(passphrase: string, data: Uint8Array): Promise<Uint8Array> {
    const { key, iv } = await this.getKey(passphrase);

    // Add random 16-byte header
    const header = crypto.getRandomValues(new Uint8Array(16));
    const dataWithHeader = new Uint8Array(header.length + data.length);
    dataWithHeader.set(header);
    dataWithHeader.set(data, header.length);

    // Add PKCS7 padding
    const blockSize = 16;
    const paddingLen = blockSize - (dataWithHeader.length % blockSize);
    const paddedData = new Uint8Array(dataWithHeader.length + paddingLen);
    paddedData.set(dataWithHeader);
    paddedData.fill(paddingLen, dataWithHeader.length);

    // Import the key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    // Encrypt the data
    const encryptedArrayBuffer = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      cryptoKey,
      paddedData
    );

    return new Uint8Array(encryptedArrayBuffer);
  }

  /**
   * Parse the decrypted raw data as JSON
   */
  json(): any {
    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(this.rawData);
    return JSON.parse(jsonString);
  }

  /**
   * Extract notes from the configuration
   */
  notes(): any[] | null {
    const config = this.json();
    const notesPackage = config?.builtin_package_raycastNotes;
    return notesPackage?.notes || null;
  }

  /**
   * Import and decrypt a .rayconfig file from File object (browser upload)
   */
  async importFile(passphrase: string, file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const encryptedData = new Uint8Array(arrayBuffer);

    try {
      const compressedData = await this.decrypt(passphrase, encryptedData);
      this.rawData = inflate(compressedData);
    } catch (error) {
      throw new Error('Invalid decryption password or corrupted file');
    }
  }

  /**
   * Import and decrypt from raw bytes
   */
  async importBytes(passphrase: string, encryptedData: Uint8Array): Promise<void> {
    try {
      const compressedData = await this.decrypt(passphrase, encryptedData);
      this.rawData = inflate(compressedData);
    } catch (error) {
      throw new Error('Invalid decryption password or corrupted data');
    }
  }

  /**
   * Export the configuration as an encrypted .rayconfig file
   */
  async exportFile(passphrase: string): Promise<Uint8Array> {
    const { deflate } = await import('pako');
    const compressedData = deflate(this.rawData);
    return this.encrypt(passphrase, compressedData);
  }

  /**
   * Get the raw decrypted data
   */
  getRawData(): Uint8Array {
    return this.rawData;
  }

  /**
   * Set raw data directly (useful for testing or when data is already decrypted)
   */
  setRawData(data: Uint8Array): void {
    this.rawData = data;
  }
}
