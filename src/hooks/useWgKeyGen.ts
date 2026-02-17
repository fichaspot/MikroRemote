import { useState, useCallback } from "react";
import { wgGenerateKeypair, wgDerivePublicKey, wgGeneratePsk } from "@/lib/tauri-commands";
import type { WgKeyPair } from "@/types";

export function useWgKeyGen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateKeypair = useCallback(async (): Promise<WgKeyPair | null> => {
    setLoading(true);
    setError(null);
    try {
      const kp = await wgGenerateKeypair();
      return kp;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const derivePublicKey = useCallback(async (privateKey: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const pk = await wgDerivePublicKey(privateKey);
      return pk;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generatePsk = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const psk = await wgGeneratePsk();
      return psk;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generateKeypair, derivePublicKey, generatePsk, loading, error };
}
