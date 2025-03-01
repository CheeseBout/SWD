const { ImgurClient } = require('imgur');
const APIError = require('../utils/ApiError');
const appConfig = require('../configs/app.config');
const imgurClient = new ImgurClient({ clientId: appConfig.imgur.clientID });

class ImgurService {
  uploadImage = async (imageFile) => {
    try {
      const res = await imgurClient.upload({
        image: imageFile.buffer.toString('base64'),
      });
      return res.data.link;
    } catch (error) {
      throw new APIError(400, 'Upload image failed');
    }
  };
}

module.exports = new ImgurService();
