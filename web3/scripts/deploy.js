const fs = require("fs");
const path = require("path");

const { compileContract } = require("./compile");

const projectRoot = path.resolve(__dirname, "..");
const deploymentsDir = path.join(projectRoot, "deployments");
const clientContractConfigFile = path.resolve(
  projectRoot,
  "..",
  "client",
  "src",
  "contracts",
  "crowdfunding.json"
);

const defaultRpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";

async function rpc(method, params = [], rpcUrl = defaultRpcUrl) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });

  const json = await response.json();

  if (json.error) {
    throw new Error(`${method} failed: ${json.error.message}`);
  }

  return json.result;
}

async function waitForReceipt(txHash, rpcUrl = defaultRpcUrl) {
  for (;;) {
    const receipt = await rpc("eth_getTransactionReceipt", [txHash], rpcUrl);

    if (receipt) {
      return receipt;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function deploy() {
  const artifact = compileContract();
  const accounts = await rpc("eth_accounts");

  if (!accounts.length) {
    throw new Error("No unlocked accounts found on the target RPC.");
  }

  const chainIdHex = await rpc("eth_chainId");
  const txHash = await rpc("eth_sendTransaction", [
    {
      from: accounts[0],
      data: artifact.bytecode,
      gas: "0x5b8d80",
    },
  ]);
  const receipt = await waitForReceipt(txHash);
  const chainId = Number.parseInt(chainIdHex, 16);

  const deployment = {
    contractName: artifact.contractName,
    address: receipt.contractAddress,
    chainId,
    rpcUrl: defaultRpcUrl,
    abi: artifact.abi,
  };

  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${chainId}.json`),
    JSON.stringify(deployment, null, 2)
  );

  fs.mkdirSync(path.dirname(clientContractConfigFile), { recursive: true });
  fs.writeFileSync(
    clientContractConfigFile,
    JSON.stringify(deployment, null, 2)
  );

  console.log(`CrowdFunding deployed to ${deployment.address} on chain ${chainId}`);
  console.log(`Frontend contract config updated at ${clientContractConfigFile}`);

  return deployment;
}

if (require.main === module) {
  deploy().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  deploy,
  rpc,
  waitForReceipt,
};
