const multer = require("multer");
const path = require("path");

// Konfigurasi multer untuk menyimpan file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/permits")); // folder tujuan penyimpanan file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // menambahkan timestamp untuk menghindari nama file yang sama
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // maksimal ukuran file 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // hanya izinkan file gambar dan PDF
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File type not supported!"); // error jika tipe file tidak diizinkan
  },
});

module.exports = upload;
