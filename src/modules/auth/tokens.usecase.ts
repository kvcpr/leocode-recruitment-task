import { SignJWT, jwtVerify } from 'jose-node-cjs-runtime';
import type {
  JWTVerifyGetKey,
  JWTHeaderParameters,
} from 'jose-node-cjs-runtime';

import config from '@/config';

import type { InternalKeysStorage } from '../keysStorage/internalKeysStorage';
import { JWT_ALGORITHM } from '../keysStorage/jwtAlgorithm';

const issuer = () => config.AUTH_ISSUER;
const audience = () => `${config.AUTH_ISSUER}:auth`;

export const generateAccessToken =
  ({ keysStorage }: { keysStorage: InternalKeysStorage }) =>
  async ({ email }: { email: string }) => {
    const privateKey = keysStorage.getPrivateKey(email);
    if (!privateKey) {
      throw new Error('Private key not found, can not continue.');
    }

    const nowEpoch = Math.floor(Date.now() / 1000);

    return new SignJWT({ email })
      .setProtectedHeader({ alg: JWT_ALGORITHM, kid: privateKey.email })
      .setSubject(email)
      .setIssuedAt()
      .setIssuer(issuer())
      .setAudience(audience())
      .setExpirationTime(nowEpoch + config.AUTH_ACCESS_TOKEN_TTL_SECS)
      .sign(privateKey.value);
  };

export const verifyAccessToken =
  ({ keysStorage }: { keysStorage: InternalKeysStorage }) =>
  async ({
    accessToken,
  }: {
    accessToken: string;
  }): Promise<{ email: string }> => {
    const { payload } = await jwtVerify(
      accessToken,
      getPublicKeyFactory(keysStorage),
      { issuer: issuer(), audience: audience() }
    );

    if (!payload.sub) {
      throw new Error("Invalid 'sub' header in JWT token");
    }

    return { email: payload.email as string };
  };

function getPublicKeyFactory(
  keysStorage: InternalKeysStorage
): JWTVerifyGetKey {
  // eslint-disable-block require-await
  return async (tokenHeaders: JWTHeaderParameters) => {
    const { kid } = tokenHeaders;
    if (!kid) {
      throw new Error("Provided token key has no 'kid' header");
    }
    const matchedKey = keysStorage.getPublicKey(kid);

    if (!matchedKey) {
      throw new Error(`Key for token "${kid}" not found`);
    }

    return Promise.resolve(matchedKey.value);
  };
}

export function extractBearerToken(token: string) {
  if (!token.startsWith('Bearer ')) {
    return null;
  }

  return token.slice(7).trim();
}
