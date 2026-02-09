import { EventEmitter } from "events";
import { hash } from "../hashing/hashing.js";
import { usermodel } from "../../DB/Models/user.model.js";
import { sendEmails, subject } from "./sendemail.js";
import * as dbservice from "../../DB/dbservice.js";
import { customAlphabet } from "nanoid";

export const emailEmitter = new EventEmitter();

/* -------------------- SEND EMAIL ON REGISTER -------------------- */
emailEmitter.on("sendEmail", async (email, username, id) => {
  await sendcode({
    email,
    username,
    id,
    subjecttype: subject.register,
  });
});

/* -------------------- SEND EMAIL ON UPDATE EMAIL -------------------- */
emailEmitter.on("updateEmail", async (email, username, id) => {
  await sendcode({
    email,
    username,
    id,
    subjecttype: subject.updateEmail,
  });
});

/* -------------------- SEND EMAIL ON FORGET PASSWORD -------------------- */
emailEmitter.on("forgetPassword", async (email, username, id) => {
  await sendcode({
    email,
    username,
    id,
    subjecttype: subject.resetPassword,
  });
});

/* -------------------- MAIN FUNCTION TO SEND OTP -------------------- */
export const sendcode = async ({ email, username, id, subjecttype }) => {
  try {
    subjecttype = subjecttype || subject.register; // default

    const opt = customAlphabet("0123456789", 6)();
    const hashOTP = hash({ plaintext: opt });

    let updatedata = {};

    switch (subjecttype) {
      case subject.register:
        updatedata = { confirmEmailOTP: hashOTP };
        break;

      case subject.resetPassword:
        updatedata = { forgetPasswordOtp: hashOTP };
        break;

      case subject.updateEmail:
        updatedata = { tempEmailOTP: hashOTP };
        break;
    }

    // Save in DB
    await dbservice.updateOne({
      model: usermodel,
      filter: { _id: id },
      data: updatedata,
    });

    // Send Email
    await sendEmails({
      to: email,
      subject: subjecttype,
      html: `<h2>Your OTP is: ${opt}</h2>`,
    });

    console.log("📩 OTP sent:", opt, "→", email);
  } catch (err) {
    console.error("❌ sendcode error:", err);
  }
};
