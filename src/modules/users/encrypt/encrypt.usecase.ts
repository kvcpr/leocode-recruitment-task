import { publicEncrypt, privateDecrypt } from 'crypto';
import { createReadStream } from 'fs';
import path from 'path';

export const encryptFileWithPublicKey =
  () =>
  async ({ publicKey }: { publicKey: string }): Promise<string> => {
    const filePath = path.join(__dirname, 'fileToEncode.pdf');

    // Due to file size I cannot encrypt it with just simple public key encryption
    // I think in the most cases you might see hybrid encryption using RSA and some soring alghoritms
    // But let's be different, just split file buffer to chunks of key size and encrypt each chunk
    // So the user can really decrypt each chunk using *ONLY* private RSA key and join chunks to get decoded file

    return new Promise((resolve, reject) => {
      try {
        const BUFFER_BYTES = 256 - 42; // using 2048 bits key = 256 bytes
        const cryptedChunks: string[] = [];
        const fileStream = createReadStream(filePath, {
          highWaterMark: BUFFER_BYTES,
        });
        fileStream
          .on('data', (chunk: Buffer) => {
            const buffer = Buffer.alloc(BUFFER_BYTES);
            buffer.fill(chunk);

            const encryptedChunk = publicEncrypt({ key: publicKey }, buffer);
            cryptedChunks.push(encryptedChunk.toString('hex'));
          })
          .on('error', (err) => {
            fileStream.close();
            reject(err);
          })
          .on('end', () => {
            const base64EncodedFile = Buffer.from(
              cryptedChunks.join(',')
            ).toString('base64');
            resolve(base64EncodedFile);
          });
      } catch (err) {
        reject(err);
      }
    });
  };

export const decryptFileWithPrivateKey =
  () =>
  ({
    privateKey,
    encodedString,
    passphrase,
  }: {
    privateKey: string;
    passphrase?: string;
    encodedString: string;
  }) => {
    const encryptedChunks = Buffer.from(encodedString, 'base64')
      .toString('utf8')
      .split(',')
      .map((hexEncodedBuffer) => Buffer.from(hexEncodedBuffer, 'hex'));
    const decryptedChunks = encryptedChunks.map((encryptedChunks) =>
      privateDecrypt({ key: privateKey, passphrase }, encryptedChunks)
    );
    const buffer = Buffer.concat(decryptedChunks);

    return buffer;
  };
