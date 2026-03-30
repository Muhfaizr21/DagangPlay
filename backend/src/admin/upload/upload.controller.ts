import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { Permissions } from "../../auth/decorators/permissions.decorator";

import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { extname } from 'path';

// Validasi ukuran limit
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN_STAFF)
@Permissions('manage_content')
@Controller('admin/upload')
export class UploadController {

    @Post('image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            // Dalam production ini biasanya diarahkan ke AWS S3 atau storage layer lain.
            // Demi prototype, kita letakkan di folder public
            destination: './public/uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname);
                callback(null, `dagangplay-${uniqueSuffix}${ext}`);
            }
        }),
        limits: { fileSize: MAX_FILE_SIZE },
        fileFilter: (req, file, callback) => {
            // Magic strings / Mime validation
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new BadRequestException('Format file tidak didukung. Mohon unggah gambar (jpg, png, webp).'), false);
            }
            callback(null, true);
        }
    }))
    uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File gagal diunggah');
        }

        // Kembalikan URL relasional
        const fileUrl = `/uploads/${file.filename}`;
        return {
            message: 'Berhasil diunggah',
            url: fileUrl,
            size: file.size,
            mimetype: file.mimetype
        };
    }
}
