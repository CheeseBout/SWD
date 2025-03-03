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

const getOrCreateAuthor = async (authorName) => {
  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();

    const findAuthorsQuery = gql`
      query FindAuthors($name: String!) {
        authors(where: { name: $name }) {
          id
          stage
        }
      }
    `;

    const { authors } = await graphqlClient.request(findAuthorsQuery, {
      name: authorName,
    });

    if (authors.length > 0) {
      if (authors[0].stage !== "PUBLISHED") {
        const publishAuthorMutation = gql`
          mutation PublishAuthor($id: ID!) {
            publishAuthor(where: { id: $id }, to: PUBLISHED) {
              id
              stage
            }
          }
        `;

        await graphqlClient.request(publishAuthorMutation, {
          id: authors[0].id,
        });
      }
      return authors[0].id;
    }

    const createAuthorMutation = gql`
      mutation CreateAuthor($name: String!) {
        createAuthor(
          data: {
            name: $name
            avatar: { connect: { id: "cm7oeouvfbcvl07zt1jv1risk" } }
          }
        ) {
          id
        }
      }
    `;

    const { createAuthor } = await graphqlClient.request(createAuthorMutation, {
      name: authorName,
    });

    const publishAuthorMutation = gql`
      mutation PublishAuthor($id: ID!) {
        publishAuthor(where: { id: $id }, to: PUBLISHED) {
          id
          stage
        }
      }
    `;

    await graphqlClient.request(publishAuthorMutation, {
      id: createAuthor.id,
    });

    return createAuthor.id;
  } catch (error) {
    throw new APIError(500, `Failed to create or find author "${authorName}"`);
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
  description,
  category,
  authorName,
  coverPhotoUrl,
  postDate,
  req
) => {
  if (req.user.role !== "admin" && req.user.role !== "couple_therapist") {
    throw new APIError(
      403,
      "Only admin and couple therapist can create a post"
    );
  }
  try {
    const { gql } = await import("graphql-request");
    const graphqlClient = await initializeClient();
    const authorId = await getOrCreateAuthor(authorName);

    let formattedContent;
    if (typeof content === "string") {
      try {
        formattedContent = JSON.parse(content);
      } catch (e) {
        formattedContent = {
          children: [
            {
              type: "paragraph",
              children: [{ text: content }],
            },
          ],
        };
      }
    } else if (content?.children) {
      formattedContent = content;
    } else if (content?.raw?.children) {
      formattedContent = content.raw;
    } else if (content?.type === "doc" && content?.content) {
      formattedContent = {
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
    } else {
      throw new APIError(
        400,
        "Invalid content format. Expected RichTextAST compatible format."
      );
    }

    const slug = createSlug(title);

    let formattedPostDate =
      postDate && !isNaN(Date.parse(postDate))
        ? new Date(postDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

    const createAndPublishMutation = gql`
      mutation CreateAndPublishPost(
        $title: String!
        $slug: String!
        $description: String!
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
            description: $description
            postDate: $postDate
            category: $category
            content: $content
            author: { connect: { id: $authorId } }
            coverPhoto: $coverPhoto
          }
        ) {
          id
          title
          description
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
          stage
        }

        publishPost(where: { slug: $slug }, to: PUBLISHED) {
          id
          stage
        }
      }
    `;

    const variables = {
      title,
      slug,
      description,
      category,
      content: formattedContent,
      authorId,
      coverPhoto: coverPhotoUrl || DEFAULT_COVER_PHOTO_URL,
      postDate: formattedPostDate,
    };

    const response = await graphqlClient.request(
      createAndPublishMutation,
      variables
    );
    return response;
  } catch (error) {
    throw new APIError(
      500,
      "Error creating post: " + (error.message || "Unknown error")
    );
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
