# Raycast Config Decoder (TypeScript)

A browser-based TypeScript implementation for parsing and decrypting Raycast configuration files. This project mirrors the functionality of the Python implementation but runs entirely in the browser using modern Web APIs.

## Features

- 🔐 **Decrypt .rayconfig files** using Web Crypto API
- 📝 **Parse Raycast notes** from AST to Markdown
- 🌐 **Browser-native** - no server required
- 📱 **Responsive UI** built with Svelte
- 💾 **Download notes** as individual Markdown files or single ZIP archive
- 🧪 **Comprehensive tests** with Vitest

## Quick Start

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start development server:
   ```bash
   pnpm dev
   ```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Running Tests

```bash
pnpm test
```

## Usage

1. **Upload your .rayconfig file** - Select the encrypted configuration file exported from Raycast
2. **Enter your passphrase** - The same password you used when exporting from Raycast
3. **Decrypt** - The app will decrypt and parse your configuration
4. **Download notes** - Individual notes can be downloaded as Markdown files, or all notes as a single ZIP file

## Architecture

### Core Modules

- **`src/lib/decrypt.ts`** - Handles AES-256-CBC decryption and gzip decompression
- **`src/lib/utils.ts`** - Converts Raycast note AST to Markdown format
- **`src/App.svelte`** - Main UI component with file upload and note display

### Browser Compatibility

This project uses modern Web APIs:
- **Web Crypto API** for AES encryption/decryption
- **File API** for handling file uploads
- **TextEncoder/TextDecoder** for string/binary conversion

Supported browsers:
- Chrome 37+
- Firefox 34+
- Safari 11+
- Edge 79+

## Technical Details

### Encryption

The decryption process matches the Python implementation:

1. **Key Derivation**: Double SHA-256 hashing of passphrase
   - Key: First 32 bytes of SHA-256(passphrase)
   - IV: First 16 bytes of SHA-256(key + passphrase)

2. **Decryption**: AES-256-CBC with PKCS7 padding removal

3. **Decompression**: Gzip decompression using Pako library

### Note Parsing

Raycast notes are stored as:
- Base64-encoded JSON AST documents
- Converted to Markdown using recursive tree traversal
- Support for all Raycast formatting (bold, italic, code, lists, etc.)

## Dependencies

### Runtime
- **pako** - Gzip compression/decompression
- **jszip** - ZIP file creation for bulk downloads

### Development
- **Svelte 5** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Vitest** - Testing framework

## Security

- All decryption happens locally in your browser
- No data is sent to external servers
- Passphrase is never logged or stored
- Files are processed in memory only

## License

This project follows the same license as the parent Python project.

## Contributing

1. Follow the code style defined in the parent project's `AGENTS.md`
2. Write tests for new features
3. Ensure TypeScript types are properly defined
4. Test in multiple browsers if adding new Web API usage

## Related

- **Python implementation**: `../src/rayconfig/` - Server-side CLI tool
- **Documentation**: `../AGENTS.md` - Project conventions and commands