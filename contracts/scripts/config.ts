"use strict";

const path = require("path");

/** Contract deployment configuration.
 *
 * 1. Pulls the deployer wallet from the environment.
 * 2. Pulls the Monad testnet RPC URL from the environment.
 * 3. Returns a config object consumed by scripts/deploy.ts.
 */
function getDeployConfig() {
  const monadRpcUrl = process.env.MONAD_RPC_URL;
  const monadPrivateKey = process.env.MONAD_PRIVATE_KEY;

  if (!monadRpcUrl) {
    console.warn(
      "WARN: MONAD_RPC_URL is not set. Deploy to localhost instead.\n" +
        "Set it with: export MONAD_RPC_URL=http://127.0.0.1:8545"
    );
  }

  return {
    monadRpcUrl: monadRpcUrl || "http://127.0.0.1:8545",
    monadPrivateKey: monadPrivateKey || "",
    monadChainId: monadPrivateKey ? 10143 : 31337,
  };
}

module.exports = { getDeployConfig };
