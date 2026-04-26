import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TARGET_CHAIN_ID_HEX = '0x14a34';
const TARGET_CHAIN_ID = 84532;
const TARGET_CHAIN_IDS = [TARGET_CHAIN_ID_HEX];
const TARGET_RPC_URL = 'https://sepolia.base.org';

const TARGET_NETWORK_PARAMS = {
  chainId: TARGET_CHAIN_ID_HEX,
  chainName: 'Base Sepolia',
  rpcUrls: [TARGET_RPC_URL],
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

const WalletAdapter = ({ children }) => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);

  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum;
  };

  const switchToBaseSepoliaNetwork = async () => {
    if (!window.ethereum) return false;

    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId === TARGET_CHAIN_ID_HEX) {
      return true;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID_HEX }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code !== 4902) {
        console.warn('Switch error to target chain', TARGET_CHAIN_ID_HEX, switchError);
        return false;
      }

      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [TARGET_NETWORK_PARAMS],
        });
        return true;
      } catch (addError) {
        if (addError.code === -32002) {
          console.warn('MetaMask add chain request already pending; please complete the prompt before retrying.', addError);
        } else {
          console.warn('Could not add Base Sepolia network via MetaMask', addError);
        }
        return false;
      }
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!(await switchToBaseSepoliaNetwork())) {
        throw new Error('Unable to switch to Base Sepolia network.');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });

      console.log('Connected to wallet:', address);
      console.log('Provider chainId:', network.chainId);
      console.log('Wallet chainId hex:', chainIdHex);

      if (network.chainId !== TARGET_CHAIN_ID) {
        throw new Error(`Connected to wrong network: ${network.chainId} (expected ${TARGET_CHAIN_ID})`);
      }

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(network.chainId);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      disconnectWallet();
      alert('Failed to connect wallet. Please make sure MetaMask is on Base Sepolia and try again.');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setChainId(null);
    console.log('Disconnected from wallet');
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (chainIdHex) => {
        const nextChainId = parseInt(chainIdHex, 16);
        setChainId(nextChainId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) return;

        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        let network = await provider.getNetwork();
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });

        console.log('Re-check wallet chainId:', network.chainId, chainIdHex);

        if (network.chainId !== TARGET_CHAIN_ID) {
          const switched = await switchToBaseSepoliaNetwork();
          if (switched) {
            network = await provider.getNetwork();
          }
        }

        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        setChainId(network.chainId);
        setIsConnected(true);
      } catch (error) {
        console.error('Error checking connection:', error);
        disconnectWallet();
      }
    };

    checkConnection();
  }, []);

  const walletContext = {
    account,
    provider,
    signer,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToBaseSepoliaNetwork,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };

  // Network warning component
  const NetworkWarning = () => {
    if (!isConnected || chainId === TARGET_CHAIN_ID) return null;

    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Wrong Network</span>
          </div>
        </div>
        <p className="text-sm mb-3">
          Connected to chain ID {chainId}, but need {TARGET_CHAIN_ID} (Base Sepolia)
        </p>
        <div className="text-xs mb-3">
          <p className="mb-1">To fix this:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open MetaMask</li>
            <li>Click network dropdown → "Base Sepolia"</li>
            <li>Click "Remove network"</li>
            <li>Then click "Switch to Base Sepolia" below</li>
          </ol>
        </div>
        <button
          onClick={switchToBaseSepoliaNetwork}
          className="w-full bg-white text-red-500 px-3 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Switch to Base Sepolia
        </button>
      </div>
    );
  };

  return (
    <WalletContext.Provider value={walletContext}>
      <NetworkWarning />
      {children}
    </WalletContext.Provider>
  );
};

const WalletContext = React.createContext();

export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletAdapter');
  }
  return context;
};

export default WalletAdapter;