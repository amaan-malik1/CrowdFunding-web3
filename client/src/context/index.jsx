import React, { useContext, createContext } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../components/WalletAdapter';

import contractConfig from '../contracts/crowdfunding.json';

const StateContext = createContext();

const contractAddress = contractConfig.address || undefined;
const contractAbi = contractConfig.abi?.length ? contractConfig.abi : undefined;

const parseCampaign = (campaign, pId) => ({
  owner: campaign.owner,
  title: campaign.title,
  description: campaign.description,
  target: ethers.utils.formatEther(campaign.target.toString()),
  deadline: campaign.deadline.toNumber() * 1000,
  amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
  image: campaign.image,
  pId,
});

export const StateContextProvider = ({ children }) => {
  const { account, signer, isConnected, connectWallet } = useWallet();

  const assertContract = () => {
    if (!isConnected || !signer) {
      throw new Error('Please connect your wallet first.');
    }
  };

  const publishCampaign = async (form) => {
    try {
      assertContract();

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);

      const data = await contract.createCampaign(
        account, // owner
        form.title, // title
        form.description, // description
        ethers.utils.parseEther(form.target), // target
        Math.floor(new Date(form.deadline).getTime() / 1000), // deadline
        form.image, // image
      );

      console.log("contract call success", data);
      return data;
    } catch (error) {
      console.log("contract call failure", error);
      throw error;
    }
  };

  const getCampaigns = async () => {
    try {
      if (!signer) return [];

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const campaigns = await contract.getCampaigns();
      const parsedCampaings = campaigns.map((campaign, i) => parseCampaign(campaign, i));

      return parsedCampaings;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      return [];
    }
  };

  const getCampaign = async (pId) => {
    try {
      if (!signer) throw new Error('Wallet not connected');

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const campaign = await contract.campaigns(pId);
      return parseCampaign(campaign, Number(pId));
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  };

  const getUserCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns();
      const filteredCampaigns = allCampaigns.filter((campaign) => (
        campaign.owner.toLowerCase() === account?.toLowerCase()
      ));

      return filteredCampaigns;
    } catch (error) {
      console.error('Error getting user campaigns:', error);
      return [];
    }
  };

  const donate = async (pId, amount) => {
    try {
      assertContract();

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const data = await contract.donateToCampaign(pId, {
        value: ethers.utils.parseEther(amount)
      });

      return data;
    } catch (error) {
      console.error('Error donating:', error);
      throw error;
    }
  };

  const getDonations = async (pId) => {
    try {
      if (!signer) return [];

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const donations = await contract.getDonators(pId);
      const numberOfDonations = donations[0].length;

      const parsedDonations = [];

      for (let i = 0; i < numberOfDonations; i++) {
        parsedDonations.push({
          donator: donations[0][i],
          donation: ethers.utils.formatEther(donations[1][i].toString())
        });
      }

      return parsedDonations;
    } catch (error) {
      console.error('Error getting donations:', error);
      return [];
    }
  };

  const withdrawFunds = async (pId) => {
    try {
      assertContract();

      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const data = await contract.withdraw(pId);

      return data;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      throw error;
    }
  };

  return (
    <StateContext.Provider
      value={{
        address: account,
        contract: signer ? new ethers.Contract(contractAddress, contractAbi, signer) : null,
        connect: connectWallet,
        contractAddress,
        createCampaign: publishCampaign,
        getCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        withdrawFunds
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
