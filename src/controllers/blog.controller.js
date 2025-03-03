const blogServices = require("../services/blog.services");
const catchAsync = require("../utils/catchAsync");
const { OK } = require("../utils/response");
const { updatePost, deletePost } = require("../services/blog.services");

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
      postDate,
      req
    );

    return OK(res, "Blog post created successfully", result);
  });

  updatePost = catchAsync(async (req, res) => {
    const postId = req.params.id;
    const updateData = req.body;
    const result = await updatePost(postId, updateData, req);
    return OK(res, "Post updated successfully", result);
  });

  deletePost = catchAsync(async (req, res) => {
    const postId = req.params.id;
    const result = await deletePost(postId, req);
    return OK(res, "Post deleted successfully", result);
  });
}

module.exports = new BlogController();
