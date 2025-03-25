import PropTypes from "prop-types";
import { useRef } from "react";

const EditorToolbar = ({ editor, onImageUpload }) => {
  const imageInputRef = useRef(null);

  if (!editor) {
    return null;
  }

  const handleImageButtonClick = () => {
    imageInputRef.current.click();
  };

  const handleImageInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size too large. Please choose an image under 10MB.');
        return;
      }
      onImageUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="border-b border-gray-300">
      <div className="p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6"></path>
            <path d="M3 13c0-4.97 4.03-9 9-9a9 9 0 0 1 9 9"></path>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6"></path>
            <path d="M21 13c0-4.97-4.03-9-9-9a9 9 0 0 0-9 9"></path>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleImageButtonClick}
          className="p-1 rounded hover:bg-gray-200"
          title="Insert Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

EditorToolbar.propTypes = {
  editor: PropTypes.object,
  onImageUpload: PropTypes.func.isRequired,
};

export default EditorToolbar;