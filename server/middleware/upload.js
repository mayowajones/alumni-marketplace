import multer from "multer";
import path from "path";
import fs from "fs";

// Local disk is the zero-config default for development. Set CLOUDINARY_URL
// in .env to switch to cloud storage with no other code changes needed —
// important because local disk storage does NOT survive a redeploy on most
// hosts (Render, Railway, etc. wipe the filesystem on every deploy).
const useCloudinary = Boolean(process.env.CLOUDINARY_URL);

let storage;

if (useCloudinary) {
  const { v2: cloudinary } = await import("cloudinary");
  const { CloudinaryStorage } = await import("multer-storage-cloudinary");

  cloudinary.config(); // reads CLOUDINARY_URL from env automatically

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "alumni-marketplace",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
} else {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Store files on disk with a collision-proof filename:
  // fieldname-timestamp-random.ext
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });
}

// Only accept real image types — blocks someone uploading a .exe renamed to .jpg
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const isValidExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowed.test(file.mimetype);

  if (isValidExt && isValidMime) return cb(null, true);
  cb(new Error("Only .jpeg, .jpg, .png, and .webp images are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

export default upload;
