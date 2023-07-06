import type { EncodeObject } from "@cosmjs/proto-signing";
import type { WalletData } from "@/types";
import type { Account } from "@cosmjs/stargate/build/accounts";
import type { MultisigThresholdPubkey } from "@cosmjs/amino/build/pubkeys";
import type { SignerData } from "@cosmjs/stargate/build/signingstargateclient";
import { BnMul, gasOfTx, MsgTypeUrls } from "@/common";
import { loadingWalletData } from "@/env_data";
import { createMultisigThresholdPubkey, isMultisigThresholdPubkey } from "@cosmjs/amino";
import { pubkeyToAddress } from "@cosmjs/amino/build/addresses";
import { toBase64 } from "@cosmjs/encoding";
import { cw20BaseContracts } from "@/contracts";
import { executeMsgEncodeObject, sendTokensMsgEncodeObject } from "@/common";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino/build/encoding";
import { calculateFee, makeMultisignedTxBytes } from "@cosmjs/stargate";
import { assert } from "@cosmjs/utils";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

main().catch(console.error);

async function main(): Promise<void> {
  const walletData: WalletData = await loadingWalletData(false);

  // const RPC_ENDPOINT = "https://rpc.atlantic-2.seinetwork.io";
  const RPC_ENDPOINT = walletData.RPC_ENDPOINT;

  const address0: string = "sei17cylnnnxa92pd6w40y6af78zk3yslr3n8st588";

  let cw20Address: string = "sei1q007yqtxrwf50duwg6ra8rwjgqh3uykf4gnzadfc8t674tz5auxqwldu7c";
  if (walletData.chainId === "atlantic-2") {
    cw20Address = "sei1amm3euthqn5dn33sartp7jww5lvp40t4evtlmephvfmvw0dreh7qqhyp6l";
  }

  // return
  const cw20BaseClient = new cw20BaseContracts.Cw20Base.Cw20BaseClient(walletData.signingCosmWasmClient, walletData.address, cw20Address);
  const cw20BaseQueryClient = new cw20BaseContracts.Cw20Base.Cw20BaseQueryClient(walletData.signingCosmWasmClient, cw20Address);

  const mutilPubkeyN: MultisigThresholdPubkey = createMultisigThresholdPubkey([encodeSecp256k1Pubkey(walletData.account.pubkey), encodeSecp256k1Pubkey(walletData.account2.pubkey)], 2);
  console.log(`\n  mutilPubkeyN: `, JSON.stringify(mutilPubkeyN), pubkeyToAddress(mutilPubkeyN, walletData.prefix));
  // multiSig address: sei15cz7n3ylxxfx2y4j5r440tl6acq6v37c2yxjhc

  // multiSig
  const senderAddress = pubkeyToAddress(mutilPubkeyN, walletData.prefix);
  const senderAccount: Account | null = await walletData.signingCosmWasmClient.getAccount(senderAddress);
  console.log(`unknown address ${senderAddress}`, senderAccount);
  if (!senderAccount?.pubkey) {
    // return;
  }
  const multisigPubkey: MultisigThresholdPubkey = (senderAccount?.pubkey as MultisigThresholdPubkey) ?? mutilPubkeyN;
  assert(isMultisigThresholdPubkey(multisigPubkey), "Pubkey on chain is not of type MultisigThreshold");

  const memo = "";
  const messages: EncodeObject[] = sendTokensMsgEncodeObject(senderAddress, address0, [{ amount: "1000", denom: "usei" }]);
  const messagesTransferCw20: EncodeObject[] = executeMsgEncodeObject(senderAddress, cw20Address, {
    transfer: {
      amount: "1000000",
      recipient: address0
    }
  });
  messages.push(...messagesTransferCw20);
  // Failed to retrieve account from signer
  const fee = calculateFee(gasOfTx([MsgTypeUrls.Send, MsgTypeUrls.Execute]), walletData.gasPrice);
  const explicitSignerData: SignerData = {
    accountNumber: senderAccount.accountNumber,
    sequence: senderAccount.sequence,
    chainId: walletData.chainId
  };
  const signMap: Map<string, TxRaw> = new Map<string, TxRaw>();
  signMap.set(walletData.address, (await walletData.signingCosmWasmClient.sign(walletData.address, messages, fee, memo, explicitSignerData)) as unknown as TxRaw);
  signMap.set(walletData.address2, (await walletData.signingCosmWasmClient2.sign(walletData.address2, messages, fee, memo, explicitSignerData)) as unknown as TxRaw);
  const signatures: Map<string, Uint8Array> = new Map<string, Uint8Array>();
  signMap.forEach((value, key) => {
    signatures.set(key, value.signatures[0]);
  });

  const bodyBytes = signMap.values().next().value?.bodyBytes;
  const signedTxBytes = makeMultisignedTxBytes(multisigPubkey, explicitSignerData.sequence, fee, bodyBytes, signatures);
  console.log(`check_tx ------ `, RPC_ENDPOINT + "/check_tx?tx=" + encodeURI(toBase64(signedTxBytes)));
  console.log(`check_tx ------ `, RPC_ENDPOINT + "/check_tx?tx=" + encodeURIComponent(toBase64(signedTxBytes)));
  const res = await walletData.signingCosmWasmClient.broadcastTx(signedTxBytes);
  console.log(`res:`, res);
}
