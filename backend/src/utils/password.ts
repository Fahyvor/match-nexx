export const hashPassword = (password: string) =>
  Buffer.from(password).toString("base64");

export const verifyPassword = (password: string, hash: string) =>
  Buffer.from(password).toString("base64") === hash;