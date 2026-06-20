import { Request, Response } from "express";
import { documentService } from "../services/document.service";

type UploadRequest = Request & {
  file?: Express.Multer.File;
};

export async function uploadDocument(req: UploadRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }


    const result = await documentService.upload(
      req.file.path,
      req.file.originalname,
    );

    return res.status(201).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to upload document",
    });
  }
}
