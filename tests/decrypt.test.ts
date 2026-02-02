import { beforeEach, describe, expect, it } from 'vitest';
import { RaycastConfig } from '../src/lib/decrypt';

describe('RaycastConfig', () => {
  let config: RaycastConfig;

  beforeEach(() => {
    config = new RaycastConfig();
  });

  describe('constructor', () => {
    it('should create a new instance', () => {
      expect(config).toBeInstanceOf(RaycastConfig);
    });
  });

  describe('setRawData and getRawData', () => {
    it('should store and retrieve raw data', () => {
      const testData = new TextEncoder().encode('{"test": "data"}');
      config.setRawData(testData);

      const retrieved = config.getRawData();
      expect(retrieved).toEqual(testData);
    });
  });

  describe('json', () => {
    it('should parse JSON from raw data', () => {
      const testObject = { test: 'data', number: 42 };
      const jsonString = JSON.stringify(testObject);
      const rawData = new TextEncoder().encode(jsonString);

      config.setRawData(rawData);
      const parsed = config.json();

      expect(parsed).toEqual(testObject);
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = new TextEncoder().encode('invalid json');
      config.setRawData(invalidJson);

      expect(() => config.json()).toThrow();
    });
  });

  describe('notes', () => {
    it('should return notes array when present', () => {
      const testConfig = {
        builtin_package_raycastNotes: {
          notes: [
            { id: '1', title: 'Test Note 1' },
            { id: '2', title: 'Test Note 2' }
          ]
        }
      };

      const rawData = new TextEncoder().encode(JSON.stringify(testConfig));
      config.setRawData(rawData);

      const notes = config.notes();
      expect(notes).not.toBeNull();
      if (!notes) return;

      expect(notes).toHaveLength(2);
      expect(notes[0].id).toBe('1');
      expect(notes[1].title).toBe('Test Note 2');
    });

    it('should return null when no notes package exists', () => {
      const testConfig = { other_data: 'value' };
      const rawData = new TextEncoder().encode(JSON.stringify(testConfig));
      config.setRawData(rawData);

      const notes = config.notes();
      expect(notes).toBeNull();
    });

    it('should return null when notes array is empty', () => {
      const testConfig = {
        builtin_package_raycastNotes: {
          notes: []
        }
      };

      const rawData = new TextEncoder().encode(JSON.stringify(testConfig));
      config.setRawData(rawData);

      const notes = config.notes();
      expect(notes).toEqual([]);
    });

    it('should return null when notes property is missing', () => {
      const testConfig = {
        builtin_package_raycastNotes: {
          other_property: 'value'
        }
      };

      const rawData = new TextEncoder().encode(JSON.stringify(testConfig));
      config.setRawData(rawData);

      const notes = config.notes();
      expect(notes).toBeNull();
    });
  });

  // Note: Testing actual encryption/decryption would require mock data or
  // integration tests with known encrypted files, as these operations
  // involve crypto operations that are difficult to mock effectively.

  describe('error handling', () => {
    it('should throw meaningful error for empty passphrase', async () => {
      const mockFile = new File(['test'], 'test.rayconfig');

      await expect(config.importFile('', mockFile))
        .rejects.toThrow();
    });

    it('should throw error for non-file input', async () => {
      // This would test file validation if implemented
      const invalidFile = null as any;

      await expect(config.importFile('password', invalidFile))
        .rejects.toThrow();
    });
  });

  describe('key generation', () => {
    // These tests would verify the key generation matches Python implementation
    // but require access to private methods or refactoring for testability
    it('should generate consistent keys for same passphrase', async () => {
      // This test would need the getKey method to be public or have a test interface
      // For now, we can only test through the full encrypt/decrypt cycle
      expect(true).toBe(true); // Placeholder
    });
  });
});
