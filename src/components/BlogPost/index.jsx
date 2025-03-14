import PropTypes from "prop-types";
import { useState } from "react";
import { Link } from "react-router-dom";

export function BlogPost({ post }) {
  const [imageError, setImageError] = useState(false);

  const defaultAvatar =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
  const defaultCoverPhoto =
    "https://www.beautylabinternational.com/wp-content/uploads/2020/03/Hero-Banner-Placeholder-Light-1024x480-1.png";

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Blog Post Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { title, coverPhoto, content, author, postDate, category, stage } = post;

  const getStageBadgeColor = (stage) => {
    switch(stage) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formattedDate = postDate
    ? new Date(postDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative w-full h-[60vh] mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/40 to-gray-900/80 z-10"></div>
        <img
          src={coverPhoto || defaultCoverPhoto}
          alt={title}
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            setImageError(true);
            e.target.src = defaultCoverPhoto;
          }}
        />

        <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-8 lg:p-12 container mx-auto max-w-5xl">
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-100 bg-blue-600/80 backdrop-blur-sm rounded-full">
                  {category}
                </span>
              )}
              {stage && (
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full backdrop-blur-sm ${getStageBadgeColor(stage)}`}>
                  {stage}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-sm">
              {title}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <img
                  src={author?.avatar?.url || defaultAvatar}
                  alt={author?.name || "Author"}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-md object-cover"
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                <div className="ml-3">
                  <p className="font-medium text-white">
                    {author?.name || "Unknown Author"}
                  </p>
                  <div className="flex items-center text-sm text-gray-200">
                    {formattedDate && (
                      <span className="inline-flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formattedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <Link
              to="/blogs"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Articles
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 lg:p-10">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg blog-content">
            {content?.html ? (
              <div dangerouslySetInnerHTML={{ 
                __html: content.html.replace(/([^<>]+)(?![^<]*>)/g, '<p>$1</p>').replace(/<p><\/p>/g, '') 
              }} />
            ) : (
              <p className="text-gray-500 italic">
                No content available for this post.
              </p>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              You might also like
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              <Link
                to="/blogs"
                className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                  Explore more articles
                </h3>
                <p className="text-sm text-gray-600">
                  Browse our full collection of relationship advice and
                  counseling resources
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

BlogPost.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    slug: PropTypes.string,
    coverPhoto: PropTypes.string,
    category: PropTypes.string,
    postDate: PropTypes.string,
    stage: PropTypes.string, // Add stage property to PropTypes
    content: PropTypes.shape({
      html: PropTypes.string,
    }),
    author: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.shape({
        url: PropTypes.string,
      }),
    }),
  }),
};

export default BlogPost;
