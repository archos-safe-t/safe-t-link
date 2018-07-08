/* @flow */

// Module for verifying ECDSA signature of configuration.

import {ECPair, ECSignature, crypto} from "bitcoinjs-lib-zcash";

import BigInteger from "bigi";

/* eslint-disable quotes */
// First key is the first new archos one
// Second key is the trezor one used in the latest config_signed.bin file. Maube usefull to keep it for now
const ARCHOS_KEYS: Array<string> = [
  '\x04\xc6\xf9\x92\x90\xeb\xb3\xf0\x56\x8b\x93\xa9\x33\x34\xd8\x5d\x0d\x0c\x55\x94\x6f\xf9\x0b\x83\xbb\x65\x75\x28\xd6\x31\xf0\xe7\x18\x37\xb2\x0d\x31\x9b\x68\x52\x5c\xdd\xd7\x1e\x7d\x08\x18\x48\xa4\x08\x1a\x39\x95\xc0\x6d\xcb\x32\x72\xb3\xdb\x76\x6c\x65\x37\x9c',
  '\x04\x63\x27\x9c\x0c\x08\x66\xe5\x0c\x05\xc7\x99\xd3\x2b\xd6\xba\xb0\x18\x8b\x6d\xe0\x65\x36\xd1\x10\x9d\x2e\xd9\xce\x76\xcb\x33\x5c\x49\x0e\x55\xae\xe1\x0c\xc9\x01\x21\x51\x32\xe8\x53\x09\x7d\x54\x32\xed\xa0\x6b\x79\x20\x73\xbd\x77\x40\xc9\x4c\xe4\x51\x6c\xb1',
];
/* eslint-enable */

const keys: Array<Buffer> = ARCHOS_KEYS.map(key => new Buffer(key, `binary`));

// Verifies ECDSA signature
// pubkeys - Public keys
// signature - ECDSA signature (concatenated R and S, both 32 bytes)
// data - Data that are signed
// returns True, iff the signature is correct with any of the pubkeys
function verify(pubkeys: Array<Buffer>, bsignature: Buffer, data: Buffer): boolean {
  const r = BigInteger.fromBuffer(bsignature.slice(0, 32));
  const s = BigInteger.fromBuffer(bsignature.slice(32));
  const signature = new ECSignature(r, s);

  const hash = crypto.sha256(data);

  return pubkeys.some(pubkey => {
    const pair = ECPair.fromPublicKeyBuffer(pubkey);
    return pair.verify(hash, signature);
  });
}

// Verifies if a given data is a correctly signed config
// Returns the data, if correctly signed, else throws
export function verifyHexBin(data: string): Buffer {
  const signature = new Buffer(data.slice(0, 64 * 2), `hex`);
  const dataB = new Buffer(data.slice(64 * 2), `hex`);
  const verified = verify(keys, signature, dataB);
  if (!verified) {
    throw new Error(`Not correctly signed.`);
  } else {
    return dataB;
  }
}
