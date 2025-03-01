const blogServices = require("../services/blog.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");

class BlogController {
  createPost = catchAsync(async (req, res) => {
    const {
      title,
      content,
      description,
      category,
      authorName,
      coverPhotoUrl,
      postDate,
    } = req.body;

    const result = await blogServices.createPost(
      title,
      content,
      description,
      category,
      authorName,
      coverPhotoUrl,
      postDate
    );

    return OK(res, "Blog post created successfully", result);
  });
}

module.exports = new BlogController();
