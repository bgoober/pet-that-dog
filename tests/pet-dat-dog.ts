import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { PetDatDog } from "../target/types/pet_dat_dog";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import wallet from "/home/agent/.config/solana/id.json";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";

describe("pet-dat-dog", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.PetDatDog as Program<PetDatDog>;

  const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

  let bonkMint: anchor.web3.PublicKey;
  let dogMint: anchor.web3.PublicKey;

  it("Setup token environment", async () => {
    bonkMint = await createMint(
      provider.connection,
      keypair,
      provider.publicKey,
      null,
      6
    );
    console.log("Bonk Mint address: ", bonkMint.toBase58());

    const userBonkAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        keypair,
        bonkMint,
        keypair.publicKey
      )
    ).address;
    await mintTo(
      provider.connection,
      keypair,
      bonkMint,
      userBonkAta,
      keypair,
      1_000_000_0
    );
    console.log("User bonkAta address: ", userBonkAta.toBase58());
  });

  const dogNames = ["Max"];
  dogNames.forEach((dogName) => {
    it(`Is initialized! - ${dogName}`, async () => {
      try {
        const [dog] = web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("dog"),
            Buffer.from(dogName),
            keypair.publicKey.toBuffer(),
          ],
          program.programId
        );
        dogMint = await createMint(
          provider.connection,
          keypair,
          dog,
          null,
          6
        );
        const dogBonkAta = (
          await getOrCreateAssociatedTokenAccount(
            provider.connection,
            keypair,
            bonkMint,
            dog,
            true
          )
        ).address;

        console.log("Dog PETS Mint address: ", dogMint.toBase58());

        const tx = await program.methods
          .createDog(dogName)
          .accountsPartial({
            dog: dog,
            owner: keypair.publicKey,
            dogMint,
            bonkMint,
            dogBonkAta,
            associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([keypair])
          .rpc();
        console.log("Your createDog tx signature is: ", tx);
      } catch (error) {
        console.error("An error occurred:", error);
      }
    });

    it(`Is pet! - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("dog"),
          Buffer.from(dogName),
          keypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      const userPetsAta = (
        await getOrCreateAssociatedTokenAccount(
          provider.connection,
          keypair,
          dogMint,
          keypair.publicKey
        )
      ).address;

      const tx = await program.methods
        .pet()
        .accountsPartial({ owner: keypair.publicKey, dog, dogMint, userPetsAta })
        .rpc();
      console.log("Your pet tx signature is: ", tx);
    });

    it(`Is bonked! - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("dog"),
          Buffer.from(dogName),
          keypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      const dogBonkAta = (
        await getOrCreateAssociatedTokenAccount(
          provider.connection,
          keypair,
          bonkMint,
          dog,
          true
        )
      ).address;

      const userBonkAta = (
        await getOrCreateAssociatedTokenAccount(
          provider.connection,
          keypair,
          bonkMint,
          keypair.publicKey
        )
      ).address;

      const tx = await program.methods
        .bonk()
        .accountsPartial({
          dog,
          owner: keypair.publicKey,
          dogBonkAta,
          bonkMint,
          userBonkAta,
        })
        .rpc();
      console.log("Your bonk tx signature is: ", tx);
    });

    it(`Fetches dog state - ${dogName}`, async () => {
      const [dog] = web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("dog"),
          Buffer.from(dogName),
          keypair.publicKey.toBuffer(),
        ],
        program.programId
      );

      const dogAccount = await program.account.dog.fetch(dog);

      console.log(`Dog's pets: ${dogName}`, dogAccount.pets.toString());
      console.log(`Dog's bonks: ${dogName}`, dogAccount.bonks.toString());

      // find all the accounts underneath the dog account
    });
  });
});
