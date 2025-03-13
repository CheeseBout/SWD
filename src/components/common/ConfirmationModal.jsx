import PropTypes from "prop-types";

const ConfirmationModal = ({
  id,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  confirmButtonClass,
}) => {
  return (
    <>
      <input type="checkbox" id={id} className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold mb-3">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          
          <div className="flex justify-end space-x-3">
            <label
              htmlFor={id}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {cancelText || "Cancel"}
            </label>
            <button
              onClick={() => {
                onConfirm();
                document.getElementById(id).checked = false;
              }}
              className={`px-4 py-2 text-white rounded-md ${
                confirmButtonClass || "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {confirmText || "Confirm"}
            </button>
          </div>
        </div>
        <label className="modal-backdrop" htmlFor={id}>Close</label>
      </div>
    </>
  );
};

ConfirmationModal.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  confirmButtonClass: PropTypes.string,
};

export default ConfirmationModal;
