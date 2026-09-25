import asyncHandler from "express-async-handler";

// @desc    Upload one or more product images
// @route   POST /api/upload
// @access  Private/Admin
// Files arrive via multer (see middleware/upload.js) already saved to disk
// under /uploads — this just reports back the public URLs to store on the
// Product document.
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No files uploaded");
  }

  // Cloudinary's storage engine puts the final hosted URL in `file.path`.
  // Local disk storage only knows a filename, so we build the /uploads/ URL.
  const usingCloudinary = Boolean(process.env.CLOUDINARY_URL);
  const urls = req.files.map((file) =>
    usingCloudinary ? file.path : `/uploads/${file.filename}`
  );

  res.status(201).json({ urls });
});
