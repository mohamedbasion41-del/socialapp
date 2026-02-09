import jwt from "jsonwebtoken";

export const generateToken = ({ payload, signature, options }) => {
  if (!signature) {
    throw new Error("JWT signature is missing");
  }

  return jwt.sign(payload, signature, options);
};
