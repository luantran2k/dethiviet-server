import { v2 as cloudinary } from 'cloudinary';
import { cloudinaryConst } from './constants';

export const CloudinaryProvider = {
  provide: cloudinaryConst.provider,
  useFactory: () => {
    return cloudinary.config({
      cloud_name: cloudinaryConst.name,
      api_key: cloudinaryConst.key,
      api_secret: cloudinaryConst.secret,
    });
  },
};
