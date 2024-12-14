import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';

interface CreateDogPageProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (dogData: {
    name: string;
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;
  }) => Promise<void>;
  isPage?: boolean;
}

export const CreateDogPage: React.FC<CreateDogPageProps> = ({
  show,
  onClose,
  onSubmit,
  isPage = false,
}) => {
  const [name, setName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Here we'd implement IPFS or Arweave upload
      // For now, let's assume we're using a placeholder URI
      const tokenUri = 'https://placeholder.com/metadata.json';
      return tokenUri;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tokenSymbol || !imageFile) return;

    try {
      const tokenUri = await handleImageUpload(imageFile);
      await onSubmit({
        name,
        tokenName: name,
        tokenSymbol: tokenSymbol.toUpperCase(),
        tokenUri,
      });
      onClose();
    } catch (error) {
      console.error('Error creating dog:', error);
    }
  };

  if (!show) return null;

  const formContent = (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Dog Name  </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter dog name"
          required
          // style={{ backgroundColor: '#ffffff' }}
        />
      </div>
      <div style={{ height: '10px' }}></div>

      <div className="form-group">
        <label>Dog Description  </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter dog description"
          required
          // style={{ backgroundColor: '#ffffff' }}
        />
      </div>
      <div style={{ height: '10px' }}></div>

      <div className="form-group">
        <label>Token Symbol  </label>
        <input
          type="text"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          placeholder="e.g. DOGE"
          maxLength={5}
          required
          // style={{ backgroundColor: '#ffffff' }}
        />
      </div>
      <div style={{ height: '10px' }}></div>

      <div className="form-group">
        <label>Dog Token Image  </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      <div style={{ height: '10px' }}></div>

      <div className="button-group">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading || !name || !tokenSymbol || !imageFile}
        >
          {isUploading ? 'Uploading...' : 'Create Dog'}
        </button>
      </div>
    </form>
  );

  if (isPage) {
    return <div className="form-container">{formContent}</div>;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Your Dog</h2>
        {formContent}
      </div>
    </div>
  );
};
