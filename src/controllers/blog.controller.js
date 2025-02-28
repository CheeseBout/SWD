const { createPost } = require("../services/blog.services");
const APIError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class BlogController {
  createPost = catchAsync(async (req, res) => {
    const {
      title,
      content,
      category,
      authorName,
      coverPhotoUrl,
      postDate,
      description,
    } = req.body;

    if (
      !title ||
      !content ||
      !category ||
      !authorName ||
      !coverPhotoUrl ||
      !description
    ) {
      throw new APIError(400, "Missing required fields");
    }

    // Ensure postDate is valid
    const formattedPostDate =
      postDate && !isNaN(Date.parse(postDate))
        ? new Date(postDate).toISOString()
        : new Date().toISOString();

    const post = await createPost(
      title,
      content,
      description,
      category,
      authorName,
      coverPhotoUrl,
      formattedPostDate
    );

    return OK(res, "Created post successfully!", post);
  });
}

module.exports = new BlogController();
