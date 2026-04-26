# 🚀 CrowdFunding Platform - Web3 Kickstarter Clone

A decentralized crowdfunding platform built on Ethereum, where creators can launch campaigns and supporters can fund them directly with cryptocurrency. Built with React, Solidity, and Hardhat.

![Crowdfunding Platform](https://moaning-tomato-gyn2alevhb.edgeone.app/Screenshot%202026-04-26%20155644.png)

## ✨ Features

- **🏗️ Create Campaigns**: Launch your own crowdfunding campaigns with title, description, target amount, and deadline
- **💰 Direct Donations**: Support campaigns with direct cryptocurrency transfers
- **📊 Real-time Tracking**: Monitor campaign progress, donations, and donor information
- **🔐 Wallet Integration**: Secure MetaMask wallet connection for transactions
- **🌐 Decentralized**: Built on Ethereum blockchain for transparency and trustlessness
- **📱 Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS
- **⚡ Fast Transactions**: Optimized for Base Sepolia testnet with low gas fees

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Ethers.js** - Ethereum wallet and contract interaction
- **React Router** - Client-side routing
- **Thirdweb** - Web3 development tools

### Backend/Smart Contracts
- **Solidity 0.7.3** - Smart contract programming language
- **Hardhat** - Ethereum development environment
- **Base Sepolia** - Ethereum Layer 2 testnet for fast, low-cost transactions

### Development Tools
- **Node.js** - JavaScript runtime
- **npm/yarn** - Package management
- **MetaMask** - Browser wallet for Ethereum

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd project_crowdfunding
```

### 2. Install Dependencies

#### Frontend Setup
```bash
cd client
npm install
```

#### Smart Contract Setup
```bash
cd ../web3
npm install
```

### 3. Environment Configuration

#### Smart Contract Environment
Create a `.env` file in the `web3` directory:
```env
PRIVATE_KEY=your_private_key_here
RPC_URL=https://sepolia.base.org
```

> **Security Note**: Never commit your private key to version control. Use environment variables.

#### MetaMask Setup
1. Install MetaMask browser extension
2. Create or import a wallet
3. Add Base Sepolia testnet:
   - Network Name: `Base Sepolia`
   - RPC URL: `https://sepolia.base.org`
   - Chain ID: `84532`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.basescan.org`

### 4. Deploy Smart Contracts

```bash
cd web3
npm run deploy
```

This will deploy your CrowdFunding contract to Base Sepolia and generate the contract artifacts.

### 5. Update Frontend Configuration

Update `client/src/contracts/crowdfunding.json` with your deployed contract address and chain ID.

### 6. Start Development Servers

#### Terminal 1: Smart Contract Development (Optional)
```bash
cd web3
npm run node  # For local Hardhat network
```

#### Terminal 2: Frontend Development
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 📖 Usage

### For Campaign Creators
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Create Campaign**:
   - Navigate to "Create Campaign"
   - Fill in campaign details (title, description, target amount, deadline, image URL)
   - Submit the form and confirm the transaction in MetaMask
3. **Monitor Progress**: View your campaigns in the "Profile" section

### For Supporters
1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Browse Campaigns**: View all active campaigns on the home page
3. **Donate**: Click on a campaign, enter donation amount, and confirm transaction
4. **Track Donations**: View donation history in campaign details

## 🏗️ Smart Contract Architecture

### CrowdFunding Contract

The main smart contract handles:

- **Campaign Creation**: `createCampaign()` - Creates new crowdfunding campaigns
- **Donation Processing**: `donateToCampaign()` - Processes donations and transfers funds
- **Data Retrieval**: `getCampaigns()`, `getDonators()` - Read campaign and donation data

#### Key Functions:
```solidity
function createCampaign(address _owner, string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256)

function donateToCampaign(uint256 _id) public payable

function getCampaigns() public view returns (Campaign[] memory)

function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory)
```

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
npm run deploy  # Uses Thirdweb for deployment
```

### Smart Contract Deployment
```bash
cd web3
npm run deploy
```

## 🔧 Development Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Smart Contracts
```bash
npm run build    # Compile contracts
npm run deploy   # Deploy to configured network
npm run smoke    # Run smoke tests
```

## 🧪 Testing

### Smart Contract Testing
```bash
cd web3
npm run smoke  # Run basic functionality tests
```

### Manual Testing Checklist
- [ ] Wallet connection works
- [ ] Network switching to Base Sepolia
- [ ] Campaign creation succeeds
- [ ] Donation transactions complete
- [ ] Campaign data displays correctly
- [ ] Responsive design on mobile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write clear commit messages
- Test on Base Sepolia testnet before mainnet deployment
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built following JavaScript Mastery tutorial
- Inspired by Kickstarter and GoFundMe
- Thanks to the Ethereum and Base communities

## 📞 Support

If you encounter issues:
1. Check MetaMask is connected to Base Sepolia
2. Ensure you have test ETH for transactions
3. Verify contract address in frontend config
4. Check browser console for error messages

## 🔮 Future Enhancements

- [ ] Multi-token support (ERC-20 donations)
- [ ] Campaign categories and filtering
- [ ] Social features (comments, sharing)
- [ ] Milestone-based funding
- [ ] NFT rewards for donors
- [ ] Governance features
- [ ] Mobile app development

---

**Built with ❤️ for the Web3 community**