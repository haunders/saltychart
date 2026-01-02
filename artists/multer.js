import multer from 'multer';

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG is allowed!'), false);
    }
};

let storage = multer.diskStorage(
    {
        destination: 'static/img/artists',
        filename: function (req, file, cb) {
            cb(null, file.originalname + ".jpg");
        }
    }
);
export const upload = multer({ storage: storage, fileFilter });

export default upload;