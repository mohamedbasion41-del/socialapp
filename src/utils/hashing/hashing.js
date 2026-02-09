import bcrypt from "bcryptjs";

// ✅ Hash plain text
export const hash = ({ plaintext, saltRounds = 8 }) => {
  const hashed = bcrypt.hashSync(plaintext, saltRounds);
  return hashed;
};

// ✅ Compare plain text with hashed value
export const comparehash = ({ plaintext, password }) => {
  if (!plaintext || !password) {
    throw new Error("comparehash: missing arguments");
  }

  return bcrypt.compareSync(plaintext, password);
};