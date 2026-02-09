import multer, { diskStorage } from "multer";

export const filevalidation = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  files: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const uploadcloud = () => {
  const storage = diskStorage({});

  return multer({ storage });
};
