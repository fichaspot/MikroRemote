import { invoke } from "@tauri-apps/api/core";
import type { WgKeyPair } from "@/types";

interface KeyPairResult {
  private_key: string;
  public_key: string;
}

export async function wgGenerateKeypair(): Promise<WgKeyPair> {
  const result = await invoke<KeyPairResult>("wg_generate_keypair");
  return {
    privateKey: result.private_key,
    publicKey: result.public_key,
  };
}

export async function wgDerivePublicKey(privateKey: string): Promise<string> {
  return invoke<string>("wg_derive_public_key", { privateKey });
}

export async function wgGeneratePsk(): Promise<string> {
  return invoke<string>("wg_generate_psk");
}
