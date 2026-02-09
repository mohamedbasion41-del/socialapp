import * as dbservice from "../../DB/dbservice.js";
import { usermodel } from "../../DB/Models/user.model.js";
import { emailEmitter } from "../../utils/email/emailevent.js";
import { hash } from "../../utils/hashing/hashing.js";
import { OAuth2Client } from "google-auth-library";
import { providerstype, roletype } from "../../DB/Models/user.model.js";
import { asynchandler } from "../../utils/errorhandling/asynchandler.js";
import { comparehash } from "../../utils/hashing/hashing.js";
import { generateToken } from "../../utils/generateToken.js";

// ========================================
// REGISTER
// ========================================
export const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  const user = await dbservice.findOne({
    model: usermodel,
    filter: { email },
  });

  if (user) {
    return next(new Error("User already exists", { cause: 409 }));
  }

  const newuser = await dbservice.create({
    model: usermodel,
    data: { username, email, password }, // ⬅️ PLAIN PASSWORD
  });

  emailEmitter.emit("sendEmail", email, username, newuser._id);

  return res.status(200).json({
    success: true,
    message: "User registered successfully",
    newuser,
  });
};
export const login = asynchandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await usermodel.findOne({ email }).select("+password"); // 🔥 REQUIRED

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = comparehash({
      plaintext: password,
      password: user.password,
    });

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const access_token = generateToken({
      payload: {
        id: user._id,
        email: user.email,
        role: user.role || "user",
      },
      signature: process.env.USER_ACCESS_TOKEN,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
    });

    const refresh_token = generateToken({
      payload: {
        id: user._id,
        email: user.email,
        role: user.role || "user",
      },
      signature: process.env.USER_REFRESH_TOKEN,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRE },
    });

    return res.status(200).json({
      success: true,
      tokens: {
        access_token,
        refresh_token,
      },
    });
  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
});

// ========================================
// CONFIRM EMAIL
// ========================================
export const confirmEmail = async (req, res, next) => {
  const { code, email } = req.body;

  const user = await dbservice.findOne({
    model: usermodel,
    filter: { email },
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));
  if (user.confirmEmail) {
    return next(new Error("Email already verified", { cause: 409 }));
  }

  if (!comparehash({ plaintext: code, hash: user.confirmEmailOTP })) {
    return next(new Error("Invalid code", { cause: 400 }));
  }

  await dbservice.updateOne({
    model: usermodel,
    filter: { email },
    data: { confirmEmail: true, $unset: { confirmEmailOTP: "" } },
  });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
};

// ========================================
// FORGOT PASSWORD
// ========================================
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await dbservice.findOne({
    model: usermodel,
    filter: { email, isDeleted: false },
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  const code = Math.floor(10000 + Math.random() * 90000).toString();
  const hashedOTP = hash({ plaintext: code });

  await dbservice.updateOne({
    model: usermodel,
    filter: { email },
    data: { forgetPasswordOtp: hashedOTP },
  });

  emailEmitter.emit("forgetPassword", email, user.username, user._id);

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully to email",
  });
};

// ========================================
// RESET PASSWORD
// ========================================
export const resetpassword = async (req, res, next) => {
  const { email, code, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new Error("Passwords do not match", { cause: 400 }));
  }

  const user = await dbservice.findOne({
    model: usermodel,
    filter: { email },
  });

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  const isValid = comparehash({
    plaintext: code,
    hash: user.forgetPasswordOtp,
  });
  if (!isValid) {
    return next(new Error("Invalid or expired code", { cause: 400 }));
  }

  const hashedPassword = hash({ plaintext: password });

  await dbservice.updateOne({
    model: usermodel,
    filter: { email },
    data: { password: hashedPassword, $unset: { forgetPasswordOtp: "" } },
  });

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};

// ========================================
// LOGIN WITH GMAIL
// ========================================
export const loginWithGmail = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    const client = new OAuth2Client(process.env.CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { name, email, picture, email_verified } = payload;

    if (!email_verified) {
      return next(new Error("Email not verified", { cause: 401 }));
    }

    let user = await dbservice.findOne({
      model: usermodel,
      filter: { email, isDeleted: false },
    });

    if (user && user.providers === providerstype.system) {
      return next(new Error("User already exists", { cause: 409 }));
    }

    if (!user) {
      user = await dbservice.create({
        model: usermodel,
        data: {
          username: name,
          email,
          image: picture,
          confirmEmail: email_verified,
          providers: providerstype.google,
        },
      });
    }

    const access_token = generateToken({
      payload: { id: user._id },
      signature:
        user.role === roletype.User
          ? process.env.USER_ACCESS_TOKEN
          : process.env.ADMIN_ACCESS_TOKEN,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES },
    });

    const refresh_token = generateToken({
      payload: { id: user._id },
      signature:
        user.role === roletype.User
          ? process.env.USER_REFRESH_TOKEN
          : process.env.ADMIN_REFRESH_TOKEN,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES },
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.username,
        image: user.image,
      },
      tokens: {
        access_token,
        refresh_token,
      },
    });
  } catch (error) {
    console.error("Gmail Login Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ========================================
// REFRESH TOKEN
// ========================================
export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedtoken({
    authorization,
    tokentype: tokentypes.REFRESH,
    next,
  });

  const newAccessToken = generateToken({
    payload: { id: user._id },
    signature:
      bearer === "User"
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRE },
  });

  return res.status(200).json({
    success: true,
    access_token: newAccessToken,
  });
};
