const newImageName = function newImageName() {
    const imageName = "image-" + Math.floor(Math.random() * 999999);
    return imageName;
};

module.exports = newImageName;