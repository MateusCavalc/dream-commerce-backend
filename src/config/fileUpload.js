const multer = require('multer')


module.exports = multer({ dest: process.env.STORAGE_IMAGES_PATH })