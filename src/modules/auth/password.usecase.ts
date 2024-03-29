import argon2 from 'argon2';

export const hashPassword = async ({ password }: { password: string }) => {
  return await argon2.hash(password);
};
