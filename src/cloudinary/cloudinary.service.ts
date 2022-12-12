import { Injectable } from '@nestjs/common';
import {
  UploadApiResponse,
  UploadApiErrorResponse,
  v2,
  UploadApiOptions,
} from 'cloudinary';
import * as toStream from 'buffer-to-stream';

export type resourceType = 'image' | 'javascript' | 'css' | 'video' | 'raw';
export interface UploadOptions extends UploadApiOptions {}

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions,
    resource_type?: resourceType,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          resource_type: resource_type || 'auto',
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

  async removeFile(public_id: string, resource_type: resourceType) {
    const res = await v2.uploader.destroy(public_id, {
      resource_type: resource_type,
    });
    return res;
  }

  uploadFiles(files: Express.Multer.File[], options: UploadOptions) {
    const filesUpload = files.map((file) => {
      return this.uploadFile(file, options);
    });
    return filesUpload;
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
