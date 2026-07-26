const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the path where uploaded files will be stored
const uploadPath = path.join(__dirname, '..', 'uploads');

// multer does not create the destination folder. `uploads/` is git-ignored, so
// it is absent on any fresh clone — and a missing destination makes every
// upload fail with ENOENT before the controller ever runs.
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true); 
    } else {
      cb(new Error('Only image files (jpeg, jpg, png) are allowed.'));
    }
  },
});

module.exports = upload;
