// UploadController.js
// -----------------------------------------------------------------------------
// One endpoint: POST /api/uploads/image
//   - Body: multipart/form-data with a single field named "file"
//   - Returns: { url, publicId }
//   - Uses Cloudinary (configured in config/Cloudinary.js)
//
// Used by the frontend for things like lab-result attachments and avatars.
// -----------------------------------------------------------------------------

import multer from 'multer';
import cloudinary from '../config/Cloudinary.js';
import { AppError } from '../utils/Errors.js';
import { logEvent } from '../utils/Audit.js';

// Keep the upload in memory (it's small). For larger files switch to disk.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

export const uploadSingle = upload.single('file');

// uploadImage(req, res)
//   1. Make sure a file was sent.
//   2. Convert the file's buffer to a base64 data URI (Cloudinary accepts this).
//   3. Hand it to Cloudinary.
//   4. Audit + respond.
export async function uploadImage(req, res) {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded (field name must be "file")');
  }

  // Build a data URI: "data:<mime>;base64,<base64>"
  const mimeType = req.file.mimetype ? req.file.mimetype : 'application/octet-stream';
  const dataUri = 'data:' + mimeType + ';base64,' + req.file.buffer.toString('base64');

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'medassist',
    resource_type: 'auto',
  });

  await logEvent({
    req: req,
    user: req.user,
    action: 'upload.image',
    entity: 'Cloudinary',
    entityId: result.public_id,
    meta: { bytes: req.file.size, mime: mimeType },
  });

  res.json({
    url: result.secure_url,
    publicId: result.public_id,
  });
}
