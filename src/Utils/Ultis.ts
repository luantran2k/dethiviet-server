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
};
export default Ultis;
