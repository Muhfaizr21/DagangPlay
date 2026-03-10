export declare class UploadController {
    uploadImage(file: Express.Multer.File): {
        message: string;
        url: string;
        size: number;
        mimetype: string;
    };
}
