const Ultis = {
  getPublicId: (url: string) => {
    const index = url.indexOf(process.env.CLOUDINARY_ROOT_FOLDER + '/' || '/');
    const filePath = url.slice(index);
    const indexDot = filePath.indexOf('.'); // .png, .mp3, ...
    if (indexDot !== -1) return filePath.slice(0, indexDot); //Public id
    return filePath;
  },
};
export default Ultis;
