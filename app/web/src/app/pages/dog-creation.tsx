import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateDogPage } from '../create-dog-page';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createTokenMetadata } from '../../utils/token-metadata';
import * as anchor from '@coral-xyz/anchor';
import idl from '../../utils/pet_dat_dog.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export const DogCreation: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const handleSubmit = async (dogData: {
    name: string;
    tokenName: string;
    tokenSymbol: string;
    tokenUri: string;
  }) => {
    if (!wallet) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      const provider = new anchor.AnchorProvider(connection, wallet, {
        preflightCommitment: 'confirmed',
        commitment: 'confirmed',
      });

      const program = new anchor.Program(idl as anchor.Idl, provider);

      // Create UMI instance
      const umi = createUmi(connection.rpcEndpoint);
      
      // Get PDAs
      const [dog] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('dog'), Buffer.from(dogData.name), wallet.publicKey.toBuffer()],
        program.programId
      );

      const dogMint = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('mint'), dog.toBuffer()],
        program.programId
      )[0];

      // Create metadata first
      await createTokenMetadata(umi, dogMint.toBase58(), {
        name: dogData.tokenName,
        symbol: dogData.tokenSymbol,
        uri: dogData.tokenUri,
      });

      // Create dog with token
      const tx = await program.methods
        .createDog(
          dogData.name,
          dogData.tokenName,
          dogData.tokenSymbol,
          dogData.tokenUri
        )
        .accounts({
          owner: wallet.publicKey,
          dog,
          dogMint,
          // Add other required accounts
        })
        .rpc();

      console.log('Dog created:', tx);
      navigate('/');
    } catch (error) {
      console.error('Error creating dog:', error);
      alert('Failed to create dog. See console for details.');
    }
  };

  return (
    <div className="dog-creation-page" style={{
      minHeight: '100vh',
      background: '#111827',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <button 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: '#512da8',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          fontFamily: 'Arial, sans-serif',
          transition: 'background-color 0.2s'
        }}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Dogs
      </button>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          marginBottom: '2rem', 
          color: '#ffffff',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          letterSpacing: '0.05em'
        }}>
          Create your own Dog + Token
        </h1>
        <div style={{
          width: '100%',
          background: '#111827',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '1px 5px 10px rgba(0, 0, 0, 1)',
        }}>
          <CreateDogPage
            show={true}
            onClose={() => navigate('/')}
            onSubmit={handleSubmit}
            isPage={true}
          />
        </div>
      </div>
    </div>
  );
}; 