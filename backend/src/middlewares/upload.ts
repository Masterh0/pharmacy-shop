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
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1e6);
    const ext = path.extname(file.originalname);
    const baseName = req.body.name
      ? req.body.name.replace(/\s+/g, "-").toLowerCase()
      : "product";
    cb(null, `${baseName}-${timestamp}-${random}${ext}`);
  },
});

// فقط عکس مجاز
const fileFilter = (req: any, file: any, cb: any) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("فقط فایل‌های تصویری مجاز هستند!"));
};

const upload = multer({ storage, fileFilter });

export default upload;
