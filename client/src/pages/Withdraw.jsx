import React, { useState, useEffect } from 'react'

import { CustomButton, Loader } from '../components';
import { useStateContext } from '../context'

const Withdraw = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [withdrawing, setWithdrawing] = useState({});

  const { address, contract, getUserCampaigns, withdrawFunds, getCampaigns } = useStateContext();

  const fetchWithdrawableCampaigns = async () => {
    setIsLoading(true);
    try {
      const userCampaigns = await getUserCampaigns();
      const allCampaigns = await getCampaigns();
      
      // Filter campaigns that are eligible for withdrawal
      const withdrawableCampaigns = userCampaigns.filter((campaign) => {
        const now = Date.now();
        const deadlinePassed = now > campaign.deadline;
        const targetReached = parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
        
        return deadlinePassed && targetReached;
      });

      setCampaigns(withdrawableCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if(contract) fetchWithdrawableCampaigns();
  }, [address, contract]);

  const handleWithdraw = async (pId) => {
    setWithdrawing(prev => ({ ...prev, [pId]: true }));
    try {
      const data = await withdrawFunds(pId);
      console.log('Withdrawal successful:', data);
      
      // Refresh campaigns after withdrawal
      await fetchWithdrawableCampaigns();
      alert('Funds withdrawn successfully!');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Error withdrawing funds: ' + error.message);
    }
    setWithdrawing(prev => ({ ...prev, [pId]: false }));
  };

  return (
    <div className="w-full">
      <div className="w-full flex justify-between items-center mb-[20px]">
        <h1 className="font-epilogue font-bold sm:text-[26px] text-[18px] text-white">Withdraw Funds</h1>
        <CustomButton 
          btnType="button"
          title="Refresh"
          styles="bg-[#1dc071]"
          handleClick={() => fetchWithdrawableCampaigns()}
        />
      </div>

      {isLoading && (
        <Loader />
      )}

      {!isLoading && campaigns.length === 0 && (
        <div className="flex justify-center items-center">
          <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
            No campaigns eligible for withdrawal. <br /> 
            Make sure your campaign deadline has passed and the target amount was reached.
          </p>
        </div>
      )}

      {!isLoading && campaigns.length > 0 && (
        <div className="flex flex-wrap mt-[20px] w-full gap-[26px]">
          {campaigns.map((campaign, index) => (
            <div key={index} className="sm:min-w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer">
              <img src={campaign.image} alt="fund" className="w-full h-[158px] object-cover rounded-[15px]"/>

              <div className="flex flex-col p-4">
                <div className="flex flex-col items-center w-full mb-[16px]">
                  <h3 className="font-epilogue font-semibold text-[16px] text-white text-center line-clamp-1">
                    {campaign.title}
                  </h3>
                  <p className="mt-[5px] font-epilogue font-normal text-[13px] text-[#808191] text-center line-clamp-2">
                    {campaign.description}
                  </p>
                </div>

                <div className="flex justify-between flex-wrap gap-2 mb-[16px]">
                  <div>
                    <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">Target</h4>
                    <p className="mt-[3px] font-epilogue font-bold text-[20px] text-[#1dc071]">{campaign.target} ETH</p>
                  </div>
                  <div>
                    <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">Collected</h4>
                    <p className="mt-[3px] font-epilogue font-bold text-[20px] text-[#1dc071]">{campaign.amountCollected} ETH</p>
                  </div>
                </div>

                <CustomButton 
                  btnType="button"
                  title={withdrawing[campaign.pId] ? "Withdrawing..." : "Withdraw"}
                  styles="w-full bg-[#1dc071]"
                  handleClick={() => handleWithdraw(campaign.pId)}
                  disabled={withdrawing[campaign.pId]}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Withdraw
