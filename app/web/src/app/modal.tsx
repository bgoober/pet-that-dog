// src/Modal.tsx
import React from 'react';

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>
          &times;
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'flex-start', // Align to the left
    alignItems: 'flex-end', // Align to the bottom
  },
  modal: {
    background: "#512da8",
    color: "#fffcee",
    padding: '20px',
    borderRadius: '5px',
    width: '80%',
    maxWidth: '350px',
    position: 'relative' as 'relative',
    marginBottom: '10px', // Space above the button
  },
  closeButton: {
    position: 'absolute' as 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
};

interface BlinkModalProps {
  signature: string;
  action: string;
  isOpen: boolean;
  onClose: () => void;
}

const BlinkModal: React.FC<BlinkModalProps> = ({ signature, action, isOpen, onClose }) => {
  const blinkUrl = getBlink(signature);
  const twitterText = `I just ${action} a dog on Solana! Check it out:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(blinkUrl)}`;

  return isOpen ? (
    <div className="modal">
      <div className="modal-content">
        <h2>Transaction Complete!</h2>
        <p>View on BLINK: <a href={blinkUrl} target="_blank" rel="noopener noreferrer">View Transaction</a></p>
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
          Share on Twitter
        </a>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  ) : null;
};

export default Modal;