export const createToken = (userId: string, email: string, role: string) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString("base64");

  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      role,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString("base64");

  return `${header}.${payload}.signature`;
};

export const verifyToken = (token: string) => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  };
};