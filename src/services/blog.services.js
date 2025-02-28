const { GraphQLClient, gql } = require("graphql-request");
const APIError = require("../utils/ApiError");
const appConfig = require("../configs/app.config");

// Initialize GraphQL client
const client = new GraphQLClient(appConfig.HYGRAPH.HYGRAPH_ENDPOINT, {
  headers: {
    authorization: `Bearer ${appConfig.HYGRAPH.API_TOKEN}`,
  },
});

// Default cover photo URL
const DEFAULT_COVER_PHOTO_URL = "https://example.com/default-cover.jpg";

const getOrCreateAuthor = async (authorName) => {
  try {
    console.log(`🔍 Searching for author: "${authorName}"`);

    const findAuthorsQuery = gql`
      query FindAuthors($name: String!) {
        authors(where: { name: $name }) {
          id
        }
      }
    `;

    const { authors } = await client.request(findAuthorsQuery, {
      name: authorName,
    });

    if (authors.length > 0) {
      console.log(`✅ Author found: (ID: ${authors[0].id})`);
      return authors[0].id;
    }

    console.log(`🆕 Creating new author: "${authorName}"`);

    const createAuthorMutation = gql`
      mutation CreateAuthor($name: String!) {
        createAuthor(
          data: {
            name: $name
            avatar: { connect: { id: "cm7oeouvfbcvl07zt1jv1risk" } } # Required asset
          }
        ) {
          id
        }
      }
    `;

    const { createAuthor } = await client.request(createAuthorMutation, {
      name: authorName,
    });

    console.log(`✅ Author created successfully (ID: ${createAuthor.id})`);
    return createAuthor.id;
  } catch (error) {
    console.error("❌ Error handling author:", error);
    if (error.response) {
      console.error(
        "🔍 Full Response:",
        JSON.stringify(error.response, null, 2)
      );
    }
    throw new APIError(500, `Failed to create or find author "${authorName}"`);
  }
};

const createPost = async (
  title,
  content,
  description,
  category,
  authorName,
  coverPhotoUrl,
  postDate
) => {
  try {
    const authorId = await getOrCreateAuthor(authorName);

    // Xử lý và chuyển đổi định dạng content
    let formattedContent;

    // Log định dạng content nhận được để debug
    console.log("📄 Received content:", typeof content);

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
      // Đã có định dạng đúng
      formattedContent = content;
    } else if (content?.raw?.children) {
      formattedContent = content.raw;
    } else if (content?.type === "doc" && content?.content) {
      // Chuyển đổi cấu trúc content thành children
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
      console.error(
        "❌ Invalid content format received:",
        JSON.stringify(content, null, 2)
      );
      throw new APIError(
        400,
        "Invalid content format. Expected RichTextAST compatible format."
      );
    }

    // Log định dạng content sau khi chuyển đổi
    console.log(
      "📄 Formatted content:",
      JSON.stringify(formattedContent, null, 2)
    );

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Xử lý postDate - chuyển thành YYYY-MM-DD
    let formattedPostDate;
    if (postDate && !isNaN(Date.parse(postDate))) {
      formattedPostDate = new Date(postDate).toISOString().split("T")[0];
    } else {
      formattedPostDate = new Date().toISOString().split("T")[0];
      console.warn(
        "⚠️ Warning: Invalid postDate provided, using current date."
      );
    }

    // Mutation kết hợp tạo và xuất bản bài viết
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
        # Step 1: Create the post
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

        # Step 2: Publish the post immediately
        publishPost(where: { slug: $slug }, to: PUBLISHED) {
          id
          stage
        }
      }
    `;

    // Đây là điểm quan trọng - đảm bảo định dạng biến chính xác
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

    console.log("📝 Creating and publishing post with variables:", {
      title,
      slug,
      description,
      category,
      authorId,
      coverPhoto: coverPhotoUrl || DEFAULT_COVER_PHOTO_URL,
      postDate: formattedPostDate,
    });

    // Thực hiện mutation với kiểm tra lỗi chi tiết
    try {
      const response = await client.request(
        createAndPublishMutation,
        variables
      );

      if (!response?.createPost?.id) {
        throw new APIError(500, "Failed to create post - no ID returned");
      }

      console.log(
        `✅ Post created and published successfully: ID = ${response.createPost.id}, Stage = ${response.publishPost.stage}`
      );
      return response;
    } catch (graphqlError) {
      console.error("❌ GraphQL Error:", graphqlError);

      // Kiểm tra lỗi cụ thể
      if (
        graphqlError.message &&
        graphqlError.message.includes("RichTextAST")
      ) {
        console.error("💡 Có vẻ như lỗi liên quan đến định dạng RichTextAST");

        // Thử lại với định dạng khác và cũng xuất bản luôn
        console.log("🔄 Thử lại với kiểu dữ liệu JSON...");

        const alternativeMutation = gql`
          mutation CreateAndPublishPostAlternative(
            $title: String!
            $slug: String!
            $description: String!
            $category: String!
            $content: JSON!
            $authorId: ID!
            $coverPhoto: String!
            $postDate: Date!
          ) {
            # Step 1: Create the post
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

            # Step 2: Publish the post immediately
            publishPost(where: { slug: $slug }, to: PUBLISHED) {
              id
              stage
            }
          }
        `;

        const altResponse = await client.request(
          alternativeMutation,
          variables
        );

        if (!altResponse?.createPost?.id) {
          throw new APIError(
            500,
            "Failed to create post with alternative method"
          );
        }

        console.log(
          `✅ Post created and published successfully with alternative method: ID = ${altResponse.createPost.id}, Stage = ${altResponse.publishPost.stage}`
        );
        return altResponse;
      }

      // Nếu lỗi không phải do RichTextAST, thử tạo bài viết trước rồi xuất bản sau
      if (
        graphqlError.message &&
        graphqlError.message.includes("publishPost")
      ) {
        console.error("💡 Có vẻ như lỗi liên quan đến việc xuất bản đồng thời");
        console.log("🔄 Thử tạo bài viết trước, sau đó xuất bản riêng...");

        // Bước 1: Tạo bài viết
        const createPostMutation = gql`
          mutation CreatePost(
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
            }
          }
        `;

        const createResponse = await client.request(
          createPostMutation,
          variables
        );

        if (!createResponse?.createPost?.id) {
          throw new APIError(500, "Failed to create post - no ID returned");
        }

        console.log(
          `✅ Post created successfully: ID = ${createResponse.createPost.id}`
        );

        // Bước 2: Xuất bản bài viết
        try {
          const publishPostMutation = gql`
            mutation PublishPost($id: ID!) {
              publishPost(where: { id: $id }, to: PUBLISHED) {
                id
                stage
              }
            }
          `;

          const publishResponse = await client.request(publishPostMutation, {
            id: createResponse.createPost.id,
          });

          console.log(
            `✅ Post published successfully: Stage = ${publishResponse.publishPost.stage}`
          );

          // Kết hợp kết quả
          return {
            ...createResponse,
            publishPost: publishResponse.publishPost,
          };
        } catch (publishError) {
          console.error(
            "⚠️ Could not publish post, but it was created:",
            publishError
          );
          return createResponse; // Trả về kết quả tạo bài viết dù không xuất bản được
        }
      }

      // Nếu không phải các lỗi đã xử lý, ném lỗi ban đầu
      throw graphqlError;
    }
  } catch (error) {
    console.error("❌ Error creating post:", error);

    if (error.response?.errors) {
      console.error(
        "🔍 GraphQL Errors:",
        JSON.stringify(error.response.errors, null, 2)
      );
    }

    if (error.response) {
      console.error(
        "🔍 Full Response:",
        JSON.stringify(error.response, null, 2)
      );
    }

    throw new APIError(
      500,
      "Error creating post: " + (error.message || "Unknown error")
    );
  }
};

module.exports = {
  createPost,
  getOrCreateAuthor,
};
