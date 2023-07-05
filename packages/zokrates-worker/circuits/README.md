# ZKP Circuits


## ZoKrates
These `.zok` files are circuits which we can compile with [ZoKrates](https://github.com/ZoKrates/ZoKrates/) to a R1CS system. We use this to compute witnesses, generate a proving and verifying key pair, generate proofs, and verify those proofs.

The circuits are used in this project's `generate-proof` route. They prove correct decryption of tally through ownership of the encryption public key. A node.js test which doesn't require the use of most APIs can be found in `tests/climateZKP.js`.

## Decrypt Tally Circuits
### `decrypt-tally.zok`

This circuit contains all the logic to prove that we have correctly decrypted the tally (total of votes) and funding amounts (total of contributions) per project. Note that it does _not_ enforce ownership of the public key, whereas the next circuit does.

The constant `numProjects` can be changed before compiling.

**Public inputs:**
    - `totalVotesEnc` - the encrypted tally (two curve points per project)
    - `totalContributionsEnc` - the encrypted total funding (as above)
    - `totalVotes` - the plaintext (decrypted) tally
    - `totalContributions` - the plaintext total contributions

**Private inputs:**
    - `secretKey` - the authority's secret key (used for decrypting)

**A proof will be generated if:**
    - Each point `totalVotesEnc[i]` is decrypted to the value `totalVotes[i]` using `secretKey`
    - Each point `totalContributionsEnc[i]` is decrypted to the value `totalContributions[i]` using `secretKey`

### `decrypt-tally-hash.zok`

If we have 5 projects, then the above circuit will have 30 public inputs. This means 30 values need to be used in expensive elliptic curve operations on-chain to verify the corresponding proof. We can instead use one public input: the hash of all these 30 values.

The constant `numProjects` can be changed before compiling *but* this may require a different size SHA hash to be written.

**Public inputs:**
    - `publicInputHash` - a hash of all public inputs for `decrypt-tally.zok`

**Private inputs:**
    - `totalVotesEnc` - the encrypted tally (two curve points per project)
    - `totalContributionsEnc` - the encrypted total funding (as above)
    - `totalVotes` - the plaintext (decrypted) tally
    - `totalContributions` - the plaintext total contributions
    - `secretKey` - the authority's secret key (used for decrypting)

**A proof will be generated if:**
    - Each point `totalVotesEnc[i]` is decrypted to the value `totalVotes[i]` using `secretKey`
    - Each point `totalContributionsEnc[i]` is decrypted to the value `totalContributions[i]` using `secretKey`
    - The given `publicInputHash` can be reconciled from:
    `SHA256( SHA256(compressedVotes, compressedContributions) compressedPublicKey, totalVotes, totalContributions)`


Where we use Edwards compression to reduce the size of an elliptic curve point to one coordinate (`compressedVotes` are compressed points of `totalVotesEnc`). Similarly for the auth public key, we first calculate the public key from the private key, then compress it. The auth cannot generate a proof if any of these values are incorrect.

We can safely host encrypted votes and contributions publicly, and add them using homomorphic addition, without any loss of privacy.

## Constraints

The more constraints a circuit's compiled R1CS has, the longer it takes to generate a proof for it. SHA hashing is cheap in terms of gas but uses up many constraints.

`decrypt-tally.zok` has approximately 100,000 constraints whereas `decrypt-tally-hash.zok`has just over 500,000. However, verifying a proof for `decrypt-tally-hash.zok` will cost much less gas.

## Usage

Using the CLI:
 - `zokrates compile -i <path>.zok`

 Compiles the circuit to a R1CS binary (`out`).

 - `zokrates setup -s gm17 -b ark`


Completes a trusted setup using the GM17 proof system, generating `verifying.key` and `proving.key`.

 - `zokrates compute-witness -a <circuit inputs>`


Computes a `witness` given valid circuit inputs (examples given at the bottom of each circuit file).

 - `zokrates generate-proof -s gm17 -b ark`

Generates a proof that you hold a valid witness (`witness` file required in your path).
