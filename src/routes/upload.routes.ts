import { Router } from "express";
import { upload } from "../config/multer";
import { uploadDocument as uploadDocument } from "../controllers/document.controller";

const router = Router();

router.post("/", upload.single("file"), uploadDocument);

export default router;
