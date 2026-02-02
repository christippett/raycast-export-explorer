<img src="public/raycast.webp" alt="Raycast Export Explorer Logo" width="150"/>

# Raycast Export Explorer

A web front-end tool that allows users to upload and decrypt their exported Raycast settings (`.rayconfig` file). The data is decrypted and parsed 100% client-side by the browser and allows you to explore any [Raycast Notes](https://www.raycast.com/core-features/notes) included in the export. Notes can be downloaded individually as Markdown and/or bulk-downloaded as a zipped archive.

## Summary

- **100% Client-Side**: Decryption and processing happen entirely in your browser. Your data never leaves your device and is not sent to any external server.
- **Raycast Notes Export**: Specifically designed to extract and convert the internal Raycast notes database into standard Markdown files.
- **Secure**: Uses the Web Crypto API for secure, local AES-256-CBC decryption.

## Features

- 🔐 **Decrypt .rayconfig files**: Unlock your exported settings using your Raycast export password.
- 💾 **Export to zip**: Download all your notes at once as a zipped archive of Markdown files.
- 📝 ~~**Preview Notes**: View your notes directly in the browser with proper formatting~~ **_#TODO_**.
- 📱 **Responsive UI**: Clean, modern interface built with Svelte and Tailwind CSS.

## Quick Start

### Prerequisites

- Node.js (Latest LTS recommended)
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd raycast-db
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser to `http://localhost:5173`

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

1. **Export from Raycast**: From the launcher, type "export" and select "Export Settings & Data".
2. **Upload**: Open Raycast Export Explorer and select your `.rayconfig` file.
3. **Decrypt**: Enter the password you chose during export.
4. **Explorer**: Browse your notes and download them individually or as a ZIP package.

## Technical Details

### Architecture

- **`src/lib/decrypt.ts`**: Handles the AES-256-CBC decryption and key derivation (PBKDF2-like double hashing).
- **`src/lib/utils.ts`**: Converts the Raycast AST (Abstract Syntax Tree) format into standard Markdown.
- **`src/App.svelte`**: The main application logic and UI.

### Encryption Spec

The tool implements the specific encryption scheme used by Raycast. Thanks to [this Gist](https://gist.github.com/jeremy-code/50117d5b4f29e04fcbbb1f55e301b893) for the original analysis:
1. **Key Derivation**: 
   - `Hash1 = SHA256(Passphrase)`
   - `Hash2 = SHA256(Hash1 + Passphrase)`
   - `Key` = First 32 bytes of `Hash1`
   - `IV` = First 16 bytes of `Hash2`
2. **Decryption**: AES-256-CBC.
3. **Decompression**: The decrypted stream is a Gzipped JSON payload.

### Alternative

My original shell script MVP `decrypt_rayconfig.sh` is included that allows for decrypting a `*.rayconfig` file to its JSON representation using `openssl` and `gunzip`.

```bash
./decrypt_rayconfig.sh <path-to-rayconfig> <password>
```
