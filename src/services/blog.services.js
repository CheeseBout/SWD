const APIError = require("../utils/ApiError");
const appConfig = require("../configs/app.config");

const DEFAULT_COVER_PHOTO_URL = "https://example.com/default-cover.jpg";
let client;

const initializeClient = async () => {
  const { GraphQLClient } = await import("graphql-request");
  if (!client) {
    client = new GraphQLClient(appConfig.HYGRAPH.HYGRAPH_ENDPOINT, {
      headers: {
        authorization: `Bearer ${appConfig.HYGRAPH.API_TOKEN}`,
      },
    });
  }
  return client;
};

const getAllBlogPosts = async () => {
  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();
    const getAllQuery = gql`
      {
        posts {
          id
          title
          postDate
          slug
          category
          content {
            html
          }
          author {
            userId
            name
            avatar {
              id
            }
          }
          coverPhoto
        }
      }
    `;
    const response = await graphqlClient.request(getAllQuery);
    return response.posts;
  } catch (error) {
    throw new APIError(500, "Failed to fetch blog posts");
  }
};

const getPostBySlug = async (slug) => {
  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();
    const getPostQuery = gql`
      query GetPostBySlug($slug: String!) {
        posts(where: { slug: $slug }) {
          id
          title
          postDate
          slug
          category
          content {
            html
          }
          author {
            name
            avatar {
              id
            }
          }
          coverPhoto
        }
      }
    `;
    const response = await graphqlClient.request(getPostQuery, { slug });
    return response.posts[0];
  } catch (error) {
    throw new APIError(500, "Failed to fetch blog post");
  }
};

const getOrCreateAuthor = async (userId, user) => {
  if (!userId || !user) {
    throw new APIError(400, "User ID and user data are required");
  }

  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();

    // First try to find existing author by userId
    const findAuthorsQuery = gql`
      query FindAuthors($userId: String!) {
        authors(where: { userId: $userId }) {
          id
          name
          userId
          stage
        }
      }
    `;

    const { authors } = await graphqlClient.request(findAuthorsQuery, {
      userId: userId.toString(),
    });

    // If author exists, return their ID
    const existingAuthor = authors.find((author) => author.userId === userId);
    if (existingAuthor) {
      return existingAuthor.id;
    }

    // Create new author using fullname
    const authorName = user.fullname || user.name || "Anonymous User";
    const createAuthorMutation = gql`
      mutation CreateNewAuthor($name: String!, $userId: String!) {
        createAuthor(
          data: {
            name: $name
            userId: $userId
            avatar: { connect: { id: "cm7oeouvfbcvl07zt1jv1risk" } }
          }
        ) {
          id
          name
          userId
        }
      }
    `;

    const { createAuthor } = await graphqlClient.request(createAuthorMutation, {
      name: authorName,
      userId: userId.toString(),
    });

    // Publish the new author
    const publishAuthorMutation = gql`
      mutation PublishAuthor($id: ID!) {
        publishAuthor(where: { id: $id }, to: PUBLISHED) {
          id
        }
      }
    `;

    await graphqlClient.request(publishAuthorMutation, {
      id: createAuthor.id,
    });

    return createAuthor.id;
  } catch (error) {
    console.error("Author creation error details:", error);
    throw new APIError(
      500,
      `Failed to create or find author: ${error.message}`
    );
  }
};

const createSlug = (str) => {
  // Chuyển về lowercase và bỏ dấu tiếng Việt
  str = str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  // Thay thế ký tự đặc biệt bằng dấu gạch ngang
  str = str
    .replace(/[^a-z0-9]+/g, "-") // thay thế ký tự không phải chữ và số bằng dấu gạch ngang
    .replace(/^-+|-+$/g, "") // xóa dấu gạch ngang ở đầu và cuối
    .replace(/-+/g, "-"); // thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu

  return str;
};

const createPost = async (
  title,
  content,
  category,
  coverPhotoUrl,
  postDate,
  req
) => {
  if (!req.user || !req.user.id) {
    throw new APIError(401, "User not authenticated");
  }

  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();
    const authorId = await getOrCreateAuthor(req.user.id, req.user);

    const slug = createSlug(title);
    const formattedPostDate = postDate
      ? new Date(postDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // Simplified create mutation
    const mutation = gql`
      mutation CreatePost(
        $title: String!
        $slug: String!
        $category: String!
        $content: RichTextAST!
        $authorId: ID!
        $coverPhoto: String!
        $postDate: Date!
      ) {
        createPost(
          data: {
            title: $title
            slug: $slug
            category: $category
            content: $content
            author: { connect: { id: $authorId } }
            coverPhoto: $coverPhoto
            postDate: $postDate
          }
        ) {
          id
          slug
        }
      }
    `;

    // Create the post
    const { createPost: newPost } = await graphqlClient.request(mutation, {
      title,
      slug,
      category,
      content,
      authorId,
      coverPhoto: coverPhotoUrl || DEFAULT_COVER_PHOTO_URL,
      postDate: formattedPostDate,
    });

    // Separate publish mutation
    if (newPost?.id) {
      const publishMutation = gql`
        mutation PublishPost($id: ID!) {
          publishPost(where: { id: $id }, to: PUBLISHED) {
            id
            title
            postDate
            slug
            category
            content {
              html
            }
            author {
              userId
              name
              avatar {
                id
              }
            }
            coverPhoto
          }
        }
      `;

      const { publishPost } = await graphqlClient.request(publishMutation, {
        id: newPost.id,
      });

      return { createPost: publishPost };
    }

    throw new Error("Failed to create post");
  } catch (error) {
    console.error("Create post error:", error);
    throw new APIError(500, `Error creating post: ${error.message}`);
  }
};

const updatePost = async (postId, updateData, req) => {
  if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
    throw new APIError(403, "Only admin and couple therapist can update posts");
  }

  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();

    // Format content if it exists in updateData
    if (updateData.content) {
      updateData.content = formatContent(updateData.content);
    }

    // Create new slug if title is updated
    if (updateData.title) {
      updateData.slug = createSlug(updateData.title);
    }

    // Format date if it exists
    if (updateData.postDate) {
      updateData.postDate = new Date(updateData.postDate)
        .toISOString()
        .split("T")[0];
    }

    const updatePostMutation = gql`
      mutation UpdatePost(
        $postId: ID!
        $title: String
        $slug: String
        $description: String
        $category: String
        $content: RichTextAST
        $coverPhoto: String
        $postDate: Date
      ) {
        updatePost(
          where: { id: $postId }
          data: {
            title: $title
            slug: $slug
            description: $description
            category: $category
            content: $content
            coverPhoto: $coverPhoto
            postDate: $postDate
          }
        ) {
          id
          title
          description
          slug
          category
          content {
            html
          }
          coverPhoto
          postDate
        }

        publishPost(where: { id: $postId }, to: PUBLISHED) {
          id
          stage
        }
      }
    `;

    const response = await graphqlClient.request(updatePostMutation, {
      postId,
      ...updateData,
    });

    return response;
  } catch (error) {
    throw new APIError(
      500,
      "Error updating post: " + (error.message || "Unknown error")
    );
  }
};

const deletePost = async (postId, req) => {
  if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
    throw new APIError(403, "Only admin and couple therapist can delete posts");
  }

  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();

    // First unpublish the post
    const unpublishMutation = gql`
      mutation UnpublishPost($postId: ID!) {
        unpublishPost(where: { id: $postId }) {
          id
        }
      }
    `;

    await graphqlClient.request(unpublishMutation, { postId });

    // Then delete the post
    const deletePostMutation = gql`
      mutation DeletePost($postId: ID!) {
        deletePost(where: { id: $postId }) {
          id
          title
        }
      }
    `;

    const response = await graphqlClient.request(deletePostMutation, {
      postId,
    });
    return response;
  } catch (error) {
    throw new APIError(
      500,
      "Error deleting post: " + (error.message || "Unknown error")
    );
  }
};

// Add helper function to format content
const formatContent = (content) => {
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch (e) {
      return {
        children: [
          {
            type: "paragraph",
            children: [{ text: content }],
          },
        ],
      };
    }
  } else if (content?.children) {
    return content;
  } else if (content?.raw?.children) {
    return content.raw;
  } else if (content?.type === "doc" && content?.content) {
    return {
      children: content.content.map((item) => {
        const transformNode = (node) => {
          const newNode = { ...node };
          if (newNode.content) {
            newNode.children = newNode.content.map(transformNode);
            delete newNode.content;
          }
          return newNode;
        };
        return transformNode(item);
      }),
    };
  }
  throw new APIError(400, "Invalid content format");
};

module.exports = {
  getAllBlogPosts,
  getPostBySlug,
  createPost,
  getOrCreateAuthor,
  updatePost,
  deletePost,
};
