import * as crypto from 'crypto';
import { promisify } from 'util';

import { hashPassword } from '@/modules/auth/password.usecase';
import type {
  InternalKeysStorage,
  NamedKey,
} from '@/modules/keysStorage/internalKeysStorage';

import { User } from '../entities/user.entity';

const generateKeyPair = promisify(crypto.generateKeyPair);

export class UserRepository {
  private readonly storage: User[] = [];

  constructor(private keysStorage: InternalKeysStorage) {}

  async create({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<User> {
    const passwordHash = await hashPassword({ password });
    const user = new User(email, passwordHash);

    if (this.storage.find((user) => user.email === email)) {
      throw new Error('User with provided email already exists');
    }

    this.storage.push(user);

    const { privateKey, publicKey } = await generateKeyPair('rsa', {
      modulusLength: 2048,
    });

    const namedKeys: { privateKey: NamedKey; publicKey: NamedKey } = {
      privateKey: { email, value: privateKey },
      publicKey: { email, value: publicKey },
    };

    this.keysStorage.addKey(namedKeys);

    return user;
  }

  findByEmail({ email }: { email: string }): User | null {
    const user = this.storage.find((user) => user.email === email);

    if (!user) {
      return null;
    }

    return user;
  }
}
