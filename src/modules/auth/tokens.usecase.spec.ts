import * as crypto from 'crypto';
import { promisify } from 'util';

import { mockDeep } from 'jest-mock-extended';
import { SignJWT } from 'jose-node-cjs-runtime';

import config from '@/config';

import type { InternalKeysStorage } from '../keysStorage/internalKeysStorage';

import { generateAccessToken, verifyAccessToken } from './tokens.usecase';

const alg = 'RS256';
const generateKeyPair = promisify(crypto.generateKeyPair);

describe('generateAccessToken', () => {
  it('throws when there is no private key available', () => {
    const keysStorage = mockDeep<InternalKeysStorage>();
    const email = 'someemail@email.local';

    expect.assertions(1);
    expect(
      generateAccessToken({ keysStorage })({ email, password: 'blah' })
    ).rejects.toEqual(new Error('Private key not found, can not continue.'));
  });
});

describe('verifyAccessToken', () => {
  it('throws when there is no public key with specified kid available', async () => {
    const { privateKey } = await generateKeyPair('rsa', {
      modulusLength: 2048,
    });

    const keysStorage = mockDeep<InternalKeysStorage>();
    keysStorage.getPublicKey.mockReturnValue(null);

    const email = 'someemail@email.local';
    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg, kid: 'non-exist-id' })
      .setSubject(email)
      .sign(privateKey);

    expect.assertions(1);
    expect(
      verifyAccessToken({ keysStorage })({
        accessToken,
      })
    ).rejects.toEqual(new Error('Key for token "non-exist-id" not found'));
  });

  it('throws when subject is wrong', async () => {
    const { publicKey, privateKey } = await generateKeyPair('rsa', {
      modulusLength: 2048,
    });
    const keysStorage = mockDeep<InternalKeysStorage>();
    const email = 'someemail@email.local';

    keysStorage.getPublicKey.mockReturnValue({
      email,
      value: publicKey.export({ type: 'spki', format: 'pem' }) as string,
    });

    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg, kid: email })
      .setIssuer(config.AUTH_ISSUER)
      .setAudience(`${config.AUTH_ISSUER}:auth`)
      .setIssuedAt()
      .sign(privateKey);

    expect.assertions(2);

    try {
      await verifyAccessToken({ keysStorage })({
        accessToken,
      });
    } catch (err) {
      expect(err).toHaveProperty('message');
      expect((err as Error).message).toEqual(
        "Invalid 'sub' header in JWT token"
      );
    }
  });

  it('throws when kid is missing', async () => {
    const { publicKey, privateKey } = await generateKeyPair('rsa', {
      modulusLength: 2048,
    });
    const keysStorage = mockDeep<InternalKeysStorage>();
    const email = 'someemail@email.local';

    keysStorage.getPublicKey.mockReturnValue({
      email,
      value: publicKey.export({ type: 'spki', format: 'pem' }) as string,
    });

    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg })
      .setIssuer(config.AUTH_ISSUER)
      .setAudience(`${config.AUTH_ISSUER}:auth`)
      .setIssuedAt()
      .sign(privateKey);

    expect.assertions(2);

    try {
      await verifyAccessToken({ keysStorage })({
        accessToken,
      });
    } catch (err) {
      expect(err).toHaveProperty('message');
      expect((err as Error).message).toEqual(
        "Provided token key has no 'kid' header"
      );
    }
  });
});
