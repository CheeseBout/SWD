const express = require("express");
const multer = require("multer");
const utilsController = require("../controllers/utils.controller");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * @swagger
 * tags:
 *   name: Utils
 *   description: Utility operations like image upload
 */

/**
 * @swagger
 * /api/utils/upload-image:
 *   post:
 *     summary: Upload an image to Imgur
 *     tags: [Utils]
 *     description: Uploads an image file to Imgur and returns the URL of the uploaded image
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         description: The image file to upload
 *         required: true
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: string
 *                   description: URL of the uploaded image
 *                   example: https://i.imgur.com/abcdefg.jpg
 *       400:
 *         description: Bad request - Image file is required
 *       500:
 *         description: Server error - Image upload failed
 */
router.post(
  "/upload-image",
  upload.single("image"),
  utilsController.uploadImage
);

module.exports = router;
