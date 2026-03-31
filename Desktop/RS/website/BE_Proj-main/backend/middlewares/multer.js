import multer from "multer";

//const storage = multer.memoryStorage();
//export const singleUpload = multer({storage}).single("file");
//const upload = multer({storage});
//export const singleUpload = upload.single("file"); 

const storage = multer.memoryStorage();

const upload = multer({ storage });

export const singleUpload = upload.single("file");
