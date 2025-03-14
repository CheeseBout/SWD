import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import EditorToolbar from './EditorToolbar';

const BlogForm = ({
  title,
  setTitle,
  category,
  setCategory,
  status = 'PUBLISHED',
  coverPhoto,
  setCoverPhoto,
  slug,
  setSlug,
  initialContent,
  isSubmitting,
  onSubmit,
  submitButtonText,
  onCancel,
  autoGenerateSlug = true
}) => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const editorContainerRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your blog content here...',
        showOnlyWhenEditable: true,
        includeChildren: true,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialContent || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[400px] px-3 py-2 outline-none',
      },
    },
    autofocus: false,
  });

  useEffect(() => {
    if (autoGenerateSlug && title) {
      setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [title, setSlug, autoGenerateSlug]);

  const handleEditorContainerClick = (e) => {
    if (editor && !editor.isFocused) {
      editor.commands.focus();
      if (e.target.classList.contains('ProseMirror')) {
        const domRect = e.target.getBoundingClientRect();
        const y = e.clientY - domRect.top;
        editor.view.posAtCoords({ left: e.clientX, top: y })
          .pos && editor.commands.setTextSelection(editor.view.posAtCoords({ left: e.clientX, top: y }).pos);
      }
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      e.preventDefault();
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !editor?.getHTML() || editor.getHTML() === '<p></p>') {
      alert('Title and content are required');
      return;
    }
    const blogData = {
      title,
      category,
      status,
      coverPhoto,
      slug,
      tags,
      content: {
        html: editor.getHTML(),
      },
    };
    onSubmit(blogData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-4">
          <label htmlFor="title" className="block mb-1 font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="slug" className="block mb-1 font-medium text-gray-700">Slug <span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-2">/blogs/</span>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">URL-friendly version of the title</p>
        </div>

        <div className="mb-4">
          <div>
            <label htmlFor="category" className="block mb-1 font-medium text-gray-700">Category</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="coverPhoto" className="block mb-1 font-medium text-gray-700">Cover Photo URL</label>
          <input
            type="text"
            id="coverPhoto"
            value={coverPhoto}
            onChange={(e) => setCoverPhoto(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {coverPhoto && (
            <div className="mt-2 border border-gray-200 rounded-md p-2 bg-gray-50">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <img 
                src={coverPhoto} 
                alt="Cover preview" 
                className="h-48 object-cover rounded-md" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block mb-1 font-medium text-gray-700">Tags</label>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Press Enter to add tags"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center">
                {tag}
                <button
                  type="button"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  onClick={() => handleTagRemove(tag)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <label className="block mb-2 font-medium text-gray-700">Content <span className="text-red-500">*</span></label>
        <div 
          ref={editorContainerRef}
          className="border border-gray-300 rounded-md overflow-hidden"
          onClick={handleEditorContainerClick}
        >
          <EditorToolbar editor={editor} />
          <div className="p-2 mb-4 cursor-text">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {submitButtonText === 'Create Blog' ? 'Creating...' : 'Updating...'}
            </span>
            : submitButtonText || 'Submit'
          }
        </button>
      </div>
    </form>
  );
};

BlogForm.propTypes = {
  title: PropTypes.string.isRequired,
  setTitle: PropTypes.func.isRequired,
  category: PropTypes.string,
  setCategory: PropTypes.func.isRequired,
  status: PropTypes.string,
  setStatus: PropTypes.func.isRequired,
  coverPhoto: PropTypes.string,
  setCoverPhoto: PropTypes.func.isRequired,
  slug: PropTypes.string,
  setSlug: PropTypes.func.isRequired,
  initialContent: PropTypes.string,
  isSubmitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  submitButtonText: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  autoGenerateSlug: PropTypes.bool
};

export default BlogForm;