import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { createWriteStream, unlink } from 'fs';
import { get } from 'https';
import muhammara, { createReader, recrypt } from 'muhammara';
const Ultis = {
  getPublicId: (url: string) => {
    const index = url.indexOf(process.env.CLOUDINARY_ROOT_FOLDER + '/' || '/');
    const filePath = url.slice(index);
    const indexDot = filePath.indexOf('.'); // .png, .mp3, ...
    if (indexDot !== -1) return filePath.slice(0, indexDot); //Public id
    return filePath;
  },
  getThisFirstDateOfMonth: () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  },
  getThisLastDateOfMonth: () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0);
  },
  getRndInteger: (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  getRandomString: (length: number) => {
    var result = '';
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  setPassword: (inputPath: string, outPutPath: string, passWord: string) => {
    try {
      recrypt(inputPath, outPutPath, {
        userPassword: passWord,
        userProtectionFlag: 4,
      });
      return true;
    } catch (err) {
      throw new InternalServerErrorException(err.toString());
    }
  },
  removeFile: (path: string) => {
    unlink(path, (err) => {
      if (err) {
        console.log("Can't remove file " + path);
      }
    });
  },
  downloadFileToDisk: (
    url: string,
    folder: string,
    fileExtension: string,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const path = folder + '/' + Date.now() + '.' + fileExtension;
      get(url, (res) => {
        const filePath = createWriteStream(path);
        res.pipe(filePath);
        filePath.on('finish', () => {
          filePath.close();
          resolve(path);
        });
      });
    });
  },

  changePasswordFile: (filePath: string, oldPass: string, newPass: string) => {
    const outputPath = filePath.replace('input', 'output');
    recrypt(filePath, outputPath, {
      userPassword: newPass,
      password: oldPass,
      userProtectionFlag: 4,
    });
    return outputPath;
  },
};
export default Ultis;
