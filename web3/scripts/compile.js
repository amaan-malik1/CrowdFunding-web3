const fs = require("fs");
const path = require("path");
const solc = require("solc");

const projectRoot = path.resolve(__dirname, "..");
const contractFile = path.join(projectRoot, "contracts", "CrowdFunding.sol");
const artifactFile = path.join(
  projectRoot,
  "artifacts",
  "contracts",
  "CrowdFunding.sol",
  "CrowdFunding.json"
);

function compileContract() {
  const source = fs.readFileSync(contractFile, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "CrowdFunding.sol": {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors || [];
  const fatalErrors = errors.filter((error) => error.severity === "error");

  if (fatalErrors.length > 0) {
    fatalErrors.forEach((error) => console.error(error.formattedMessage));
    throw new Error("Contract compilation failed.");
  }

  const contractOutput = output.contracts["CrowdFunding.sol"].CrowdFunding;
  const artifact = {
    contractName: "CrowdFunding",
    sourceName: "contracts/CrowdFunding.sol",
    abi: contractOutput.abi,
    bytecode: `0x${contractOutput.evm.bytecode.object}`,
  };

  fs.mkdirSync(path.dirname(artifactFile), { recursive: true });
  fs.writeFileSync(artifactFile, JSON.stringify(artifact, null, 2));

  return artifact;
}

if (require.main === module) {
  const artifact = compileContract();
  console.log(`Compiled ${artifact.contractName} -> ${artifactFile}`);
}

module.exports = {
  artifactFile,
  compileContract,
};
