import { Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 } from 'cloudinary';
import * as toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    options?: { folderName?: string },
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder:
            process.env.CLOUDINARY_ROOT_FOLDER + '/' + options.folderName ||
            options.folderName,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }

  async removeFile(public_id: string) {
    return await v2.uploader.destroy(public_id);
  }

  async uploadFiles(files: Express.Multer.File[]) {
    return 'upload Files';
  }

  async getAllFileInFolder(
    folder: string,
    options?: { resourceType?: string },
  ) {
    return await v2.search
      .expression(
        `folder:${folder} ${
          options.resourceType && `AND resource_type:${options.resourceType}`
        }`,
      )
      .execute();
  }
}
