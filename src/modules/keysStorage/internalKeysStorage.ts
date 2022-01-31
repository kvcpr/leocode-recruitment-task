export interface NamedKey {
  email: string;
  value: string;
}

export class InternalKeysStorage {
  private privateKeys: NamedKey[] = [];
  private publicKeys: NamedKey[] = [];

  getPrivateKey(email: string): NamedKey | null {
    return this.privateKeys.find((key) => key.email === email) ?? null;
  }

  getPublicKey(email: string): NamedKey | null {
    return this.publicKeys.find((key) => key.email === email) ?? null;
  }

  addKey({
    publicKey,
    privateKey,
  }: {
    publicKey?: NamedKey;
    privateKey?: NamedKey;
  }) {
    if (publicKey) {
      this.publicKeys.push(publicKey);
    }

    if (privateKey) {
      this.privateKeys.push(privateKey);
    }
  }
}
