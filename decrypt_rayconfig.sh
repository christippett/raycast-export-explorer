#!/bin/bash

# Check for correct number of arguments
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <input_rayconfig_file> <password>"
  exit 1
fi

INPUT_FILE="$1"
PASSWORD="$2"
OUTPUT_FILE="$(dirname "$INPUT_FILE")/$(basename "$INPUT_FILE" .rayconfig).json"

echo "Attempting to decrypt '$INPUT_FILE' with provided password..."

# Decrypt and decompress the file
openssl enc -d -aes-256-cbc -nosalt -in "$INPUT_FILE" -k "$PASSWORD" 2>/dev/null | tail -c +17 | gunzip > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
  echo "Decryption and decompression successful! Output saved to '$OUTPUT_FILE'"
else
  echo "Decryption or decompression failed. Please check the password and input file."
fi
