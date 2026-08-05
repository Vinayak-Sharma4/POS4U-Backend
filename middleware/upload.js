import multer from "multer";
import path from "path";

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, "uploads/");
    },

    filename(req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName +
            path.extname(file.originalname)
        );
    }
});

const fileFilter = (req, file, cb) => {

    const allowed = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".doc",
        ".docx"
    ];

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowed.includes(extension)) {

        cb(null, true);

    } else {

        cb(new Error("Unsupported file type"));
    }
};

export default multer({

    storage,

    limits: {
        fileSize: 15 * 1024 * 1024
    },

    fileFilter

});