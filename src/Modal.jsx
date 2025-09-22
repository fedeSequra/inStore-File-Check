
import React from 'react';

const Modal = ({ message, onClose }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose} className="button button-primary">Close</button>
      </div>
    </div>
  );
};

export default Modal;
