// src/middlewares/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads");

// اطمینان از وجود پوشه
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// پیکربندی ذخیره فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// فقط عکس مجاز
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("فقط فایل تصویری مجاز است!"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
