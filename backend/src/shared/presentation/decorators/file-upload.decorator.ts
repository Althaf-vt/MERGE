import { applyDecorators, BadRequestException, ParseFilePipe, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

const DEFAULT_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DEFAULT_VIDEO_MIME_TYPES = ['video/webm', 'video/mp4', 'video/quicktime', 'application/octet-stream'];

export function UploadImage(fieldName: string = 'photo', maxSizeBytes: number = 5 * 1024 * 1024) {
    return applyDecorators(
        UseInterceptors(
            FileInterceptor(fieldName, {
                limits: { fileSize: maxSizeBytes },
                fileFilter(_req, file, callback) {
                    if (!DEFAULT_IMAGE_MIME_TYPES.includes(file.mimetype)) {
                        return callback(
                            new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'),
                            false
                        );
                    }
                    callback(null, true);
                },
            })
        )
    );
}

export function UploadVideo(fieldName: string = 'video', maxSizeBytes: number = 10 * 1024 * 1024) {
    return applyDecorators(
        UseInterceptors(
            FileInterceptor(fieldName, {
                limits: { fileSize: maxSizeBytes },
                fileFilter(_req, file, callback) {
                    const isExtensionAllowed = /\.(mp4|webm)$/i.test(file.originalname);
                    const isMimeAllowed = DEFAULT_VIDEO_MIME_TYPES.includes(file.mimetype);

                    if (!isExtensionAllowed && !isMimeAllowed) {
                        return callback(
                            new BadRequestException('Only webm and mp4 video formats are allowed!'),
                            false
                        );
                    }
                    callback(null, true);
                },
            })
        )
    );
}

export function UploadFile(fieldName: string = 'file', maxSizeBytes?: number) {
    return applyDecorators(
        UseInterceptors(
            FileInterceptor(fieldName, {
                ...(maxSizeBytes ? { limits: { fileSize: maxSizeBytes } } : {}),
            })
        )
    );
}

export const RequiredFile = (errorMessage: string = 'File payload is required.') =>
    UploadedFile(
        new ParseFilePipe({
            fileIsRequired: true,
            exceptionFactory: () => new BadRequestException(errorMessage),
        })
    );