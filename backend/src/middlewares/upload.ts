import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../../uploads");

// اگر پوشه وجود نداشت بساز
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// تنظیمات ذخیره‌سازی فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1e6);
    const ext = path.extname(file.originalname) || ".jpg";
    const baseName = req.body.name
      ? req.body.name.replace(/\s+/g, "-").toLowerCase()
      : "image";
    cb(null, `${baseName}-${timestamp}-${random}${ext}`);
  },
});

// 🎯 پذیرش همه نوع عکس
const fileFilter = (req: any, file: any, cb: any) => {
  // هر MIME که با image/ شروع بشه قبول میشه
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("فقط فایل‌های تصویری مجاز هستند!"));
  }
};

// می‌تونستی محدودیت حجم هم اضافه کنی (اختیاری)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // حداکثر 10 مگابایت
});

export default upload;
