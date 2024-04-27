import multer from 'multer';
import path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'public/';
        console.log("type: " + file.mimetype)
        if (file.mimetype.startsWith('image/')) {
            uploadPath += 'images/';
        }

        cb(null, uploadPath); // Dosyaların yükleneceği klasör (error, destination)
    },
    filename: function (req, file, cb) {
        const filename = path.parse(file.originalname).name + "-" + Date.now() + path.extname(file.originalname);
        req.filename = filename;
        cb(null, filename); // Yüklenecek dosyanın adı (error, file)
    }
});

const upload = multer({ storage: storage });

export default upload