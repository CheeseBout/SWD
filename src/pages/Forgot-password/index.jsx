import React from "react";

export default function ForgotPasswordPage() {
  return (
    <>
      <label htmlFor="forgot_password_modal" className="btn">open modal</label>

      <input type="checkbox" id="forgot_password_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello!</h3>
          <p className="py-4">Press ESC key or click outside to close</p>
        </div>
        <label className="modal-backdrop" htmlFor="forgot_password_modal">Close</label>
      </div>
    </>
  );
}
