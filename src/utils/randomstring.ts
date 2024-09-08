import * as Crypto from 'expo-crypto';

const defaultCharset =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export const randomString = (
    length: number,
    charset = defaultCharset,
    byteRange = 256,
): string => {
  if (length <= 0 || length > byteRange) {
    throw new Error(
      `length must satisfy 0 < length <= ${byteRange}, but ${length}.`,
    );
  }

  let result = "";

  while (result.length < length) {
    const bytes = Crypto.getRandomBytes(length);

    for (const byte of bytes) {
      result += charset[byte % charset.length];
      if (result.length === length) break;
    }
  }

  return result;
};