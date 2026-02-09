import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";

export const filevalidation = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  files: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const upload = (filetype, folder) => {
  const storage = diskStorage({
    destination: (req, file, cb) => {
      const folderpath = path.resolve(".", `${folder}/${req.user._id}`);

      if (!fs.existsSync(folderpath)) {
        fs.mkdirSync(folderpath, { recursive: true });
      }

      cb(null, folderpath);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${nanoid()}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!filetype.includes(file.mimetype)) { np
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  };

  return multer({ storage, fileFilter });
};
