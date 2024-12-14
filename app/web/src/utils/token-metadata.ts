import { Umi } from '@metaplex-foundation/umi';
import { 
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from '@metaplex-foundation/umi';

export async function createTokenMetadata(
  umi: Umi,
  mint: string,
  metadata: {
    name: string,
    symbol: string,
    uri: string,
    sellerFeeBasisPoints?: number
  }
) {
  const accounts: CreateMetadataAccountV3InstructionAccounts = {
    mint: publicKey(mint),
    mintAuthority: umi.identity,
  };

  const data: DataV2Args = {
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 0,
    creators: null,
    collection: null,
    uses: null,
  };

  const args: CreateMetadataAccountV3InstructionArgs = {
    data,
    isMutable: true,
    collectionDetails: null
  };

  const tx = createMetadataAccountV3(umi, {
    ...accounts,
    ...args
  });

  return await tx.sendAndConfirm(umi);
} 