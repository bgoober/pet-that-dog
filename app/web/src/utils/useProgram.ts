import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

import idl from "./pet_dat_dog.json";

// import { IDLData } from "@/utils/pet_dat_dog";

// import { AnchorProvider } from "@coral-xyz/anchor";
// import { IDLType } from "./idl";

const PROGRAM_ADDRESS = idl.address;
const programID = new PublicKey(PROGRAM_ADDRESS);

export interface Wallet {
  signTransaction(
    tx: anchor.web3.Transaction
  ): Promise<anchor.web3.Transaction>;
  signAllTransactions(
    txs: anchor.web3.Transaction[]
  ): Promise<anchor.web3.Transaction[]>;
}

type ProgramProps = {
  connection: Connection;
  wallet?: Wallet;
};

export const useProgram = ({ connection, wallet }: ProgramProps) => {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();

  useEffect(() => {
    if (connection && wallet) {
      const provider = new anchor.AnchorProvider(connection, wallet as anchor.Wallet, {
        preflightCommitment: "recent",
        commitment: "processed",
      });
      const program = new anchor.Program(idl as anchor.Idl, provider);
      setProgram(program);
    }
  }, [connection, wallet]);

  return {
    program,
  };
};