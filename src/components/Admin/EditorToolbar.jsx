import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditorToolbar = ({ editor }) => {
  const [imageUrl, setImageUrl] = useState('');
  const inputRef = useRef(null);
  
  useEffect(() => {
    const modalCheckbox = document.getElementById('image_modal');
    if (modalCheckbox && modalCheckbox.checked && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, []);

  if (!editor) {
    return null;
  }

  const openImageModal = () => {
    const modalCheckbox = document.getElementById('image_modal');
    if (modalCheckbox) {
      modalCheckbox.checked = true;
      setImageUrl('');
    }
  };

  const closeImageModal = () => {
    const modalCheckbox = document.getElementById('image_modal');
    if (modalCheckbox) {
      modalCheckbox.checked = false;
      setImageUrl('');
    }
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      closeImageModal();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      insertImage();
    } else if (e.key === 'Escape') {
      closeImageModal();
    }
  };

  return (
    <>
      <div className="p-2 border-b border-gray-300 bg-gray-50 flex flex-wrap gap-1">
        <div className="flex">
          <button
            type="button"
            onClick={openImageModal}
            className="p-1 rounded hover:bg-gray-200 text-gray-700"
            title="Add Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className={`p-1 rounded hover:bg-gray-200 ${
              !editor.can().chain().focus().undo().run() ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
            }`}
            title="Undo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6"></path>
              <path d="M3 13c0-4.4 3.6-8 8-8 3.7 0 6.8 2.5 7.8 6"></path>
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className={`p-1 rounded hover:bg-gray-200 ${
              !editor.can().chain().focus().redo().run() ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
            }`}
            title="Redo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6"></path>
              <path d="M21 13c0-4.4-3.6-8-8-8-3.7 0-6.8 2.5-7.8 6"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Image Modal with checkbox toggle */}
      <input type="checkbox" id="image_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Insert Image</h3>
          
          <div className="my-4">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              ref={inputRef}
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the URL of the image you want to insert
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <label 
              htmlFor="image_modal" 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
            >
              Cancel
            </label>
            <button
              type="button"
              onClick={insertImage}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
            >
              Insert
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor="image_modal">Close</label>
      </div>
    </>
  );
};

EditorToolbar.propTypes = {
  editor: PropTypes.object,
};

export default EditorToolbar;