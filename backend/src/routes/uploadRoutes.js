const express = require('express');
const { uploadFile, getFile, deleteFile } = require('../controllers/uploadController');
const { upload, handleUploadError } = require('../middleware/upload');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, upload.single('file'), handleUploadError, uploadFile);
router.get('/:filename', getFile);
router.delete('/:filename', auth, deleteFile);

module.exports = router;