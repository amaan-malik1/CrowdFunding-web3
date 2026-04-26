const { Interface } = require("@ethersproject/abi");

const { deploy, rpc, waitForReceipt } = require("./deploy");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const deployment = await deploy();
  const contract = new Interface(deployment.abi);
  const accounts = await rpc("eth_accounts", [], deployment.rpcUrl);
  const owner = accounts[0];
  const donor = accounts[1];
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  const target = `0x${(5n * 10n ** 18n).toString(16)}`;
  const donation = `0x${(10n ** 18n).toString(16)}`;

  const createTxHash = await rpc(
    "eth_sendTransaction",
    [
      {
        from: owner,
        to: deployment.address,
        data: contract.encodeFunctionData("createCampaign", [
          owner,
          "Smoke Test Campaign",
          "Created by the deployment smoke test.",
          target,
          deadline,
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        ]),
        gas: "0x5b8d80",
      },
    ],
    deployment.rpcUrl
  );

  await waitForReceipt(createTxHash, deployment.rpcUrl);

  const rawCampaigns = await rpc(
    "eth_call",
    [
      {
        to: deployment.address,
        data: contract.encodeFunctionData("getCampaigns", []),
      },
      "latest",
    ],
    deployment.rpcUrl
  );
  const [campaigns] = contract.decodeFunctionResult("getCampaigns", rawCampaigns);

  assert(campaigns.length === 1, "Expected exactly one campaign after creation.");
  assert(campaigns[0].title === "Smoke Test Campaign", "Campaign title did not round-trip.");

  const donateTxHash = await rpc(
    "eth_sendTransaction",
    [
      {
        from: donor,
        to: deployment.address,
        data: contract.encodeFunctionData("donateToCampaign", [0]),
        value: donation,
        gas: "0x5b8d80",
      },
    ],
    deployment.rpcUrl
  );

  await waitForReceipt(donateTxHash, deployment.rpcUrl);

  const rawDonators = await rpc(
    "eth_call",
    [
      {
        to: deployment.address,
        data: contract.encodeFunctionData("getDonators", [0]),
      },
      "latest",
    ],
    deployment.rpcUrl
  );
  const [donators, donations] = contract.decodeFunctionResult("getDonators", rawDonators);

  assert(donators.length === 1, "Expected one donator after donation.");
  assert(donators[0].toLowerCase() === donor.toLowerCase(), "Unexpected donor address returned.");
  assert(donations[0].toString() === (10n ** 18n).toString(), "Donation amount mismatch.");

  console.log("Smoke test passed.");
  console.log(`Contract address: ${deployment.address}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
