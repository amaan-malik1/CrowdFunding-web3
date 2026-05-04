import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';

const getReadableErrorMessage = (error) => {
  const rawMessage =
    error?.reason ||
    error?.data?.message ||
    error?.error?.message ||
    error?.message ||
    'Transaction failed. Please try again.';

  if (rawMessage.includes('execution reverted:')) {
    return rawMessage.split('execution reverted:')[1].trim();
  }

  if (rawMessage.includes('reverted with reason string')) {
    return rawMessage.split('reverted with reason string')[1].replace(/['":]/g, '').trim();
  }

  return rawMessage.trim();
};

const CampaignDetails = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { donate, getCampaign, getDonations, withdrawCampaign, contract, address } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);
  const [campaign, setCampaign] = useState(state || null);
  const [hasWithdrawn, setHasWithdrawn] = useState(Boolean(state?.withdrawn));
  const [withdrawFeedback, setWithdrawFeedback] = useState({ type: '', text: '' });

  const remainingDays = campaign ? daysLeft(campaign.deadline) : '0';
  const numericAmountCollected = Number(campaign?.amountCollected || 0);
  const numericTarget = Number(campaign?.target || 0);
  const isOwner = Boolean(address && campaign?.owner && address.toLowerCase() === campaign.owner.toLowerCase());
  const isTargetReached = numericAmountCollected >= numericTarget;
  const isWithdrawDisabled = hasWithdrawn || !isTargetReached;

  const withdrawButtonTitle = hasWithdrawn
    ? 'Already Withdrawn'
    : !isTargetReached
      ? 'Target Not Reached'
      : 'Withdraw Funds';

  const fetchCampaign = async () => {
    if (state) {
      setCampaign((prevCampaign) => prevCampaign || state);
    }

    try {
      const data = await getCampaign(id);
      setCampaign((prevCampaign) => ({ ...(prevCampaign || {}), ...data }));

      if (typeof data?.withdrawn === 'boolean') {
        setHasWithdrawn(data.withdrawn);
      }
    } catch (error) {
      if (!state) {
        console.error('Error fetching campaign:', error);
      }
    }
  };

  const fetchDonators = async () => {
    const data = await getDonations(state?.pId ?? id);

    setDonators(data);
  }

  useEffect(() => {
    if(contract) {
      fetchCampaign();
      fetchDonators();
    }
  }, [address, contract, id, state])

  const handleDonate = async () => {
    if (!campaign) {
      return;
    }

    setIsLoading(true);
    setWithdrawFeedback({ type: '', text: '' });

    try {
      await donate(campaign.pId, amount);
      navigate('/');
    } catch (error) {
      alert(getReadableErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  const handleWithdraw = async () => {
    if (!campaign) {
      return;
    }

    if (hasWithdrawn) {
      setWithdrawFeedback({
        type: 'error',
        text: 'Amount has already been withdrawn by the owner.',
      });
      return;
    }

    if (!isTargetReached) {
      setWithdrawFeedback({
        type: 'error',
        text: 'Withdraw becomes available once the funding target is reached.',
      });
      return;
    }

    setIsLoading(true);
    setWithdrawFeedback({ type: '', text: '' });

    try {
      await withdrawCampaign(campaign.pId ?? Number(id));
      setHasWithdrawn(true);
      setWithdrawFeedback({
        type: 'success',
        text: 'Campaign funds were withdrawn successfully.',
      });

      const latestCampaign = await getCampaign(id);
      setCampaign((prevCampaign) => ({ ...(prevCampaign || {}), ...latestCampaign, withdrawn: true }));
    } catch (error) {
      const message = getReadableErrorMessage(error);

      if (message.toLowerCase().includes('already') && message.toLowerCase().includes('withdrawn')) {
        setHasWithdrawn(true);
        setWithdrawFeedback({
          type: 'error',
          text: 'Amount has already been withdrawn by the owner.',
        });
      } else {
        setWithdrawFeedback({
          type: 'error',
          text: message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!campaign) {
    return null;
  }

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={campaign.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl"/>
          <div className="relative w-full h-[5px] bg-[#3a3a43] mt-2">
            <div className="absolute h-full bg-[#4acd8d]" style={{ width: `${calculateBarPercentage(campaign.target, campaign.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountBox title="Days Left" value={remainingDays} />
          <CountBox title={`Raised of ${campaign.target}`} value={campaign.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Creator</h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-white break-all">{campaign.owner}</h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-[#808191]">10 Campaigns</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Story</h4>

              <div className="mt-[20px]">
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">{campaign.description}</p>
              </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Donators</h4>

              <div className="mt-[20px] flex flex-col gap-4">
                {donators.length > 0 ? donators.map((item, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-[#b2b3bd] leading-[26px] break-ll">{index + 1}. {item.donator}</p>
                    <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] break-ll">{item.donation}</p>
                  </div>
                )) : (
                  <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">No donators yet. Be the first one!</p>
                )}
              </div>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-white uppercase">Fund</h4>   

          <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
              <input 
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">Back it because you believe in it.</h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">Support the project for no reward, just because it speaks to you.</p>
              </div>

              <CustomButton 
                btnType="button"
                title="Fund Campaign"
                styles="w-full bg-[#8c6dfd]"
                handleClick={handleDonate}
              />
            </div>
          </div>

          {isOwner && (
            <div className="mt-[20px] flex flex-col p-4 bg-[#1c1c24] rounded-[10px]">
              <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-[#808191]">
                Withdraw campaign funds
              </p>

              <div className="my-[20px] p-4 bg-[#13131a] rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-white">
                  Owner withdrawal
                </h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                  {hasWithdrawn
                    ? 'The campaign funds have already been withdrawn.'
                    : !isTargetReached
                      ? 'You can withdraw after the campaign reaches its funding target.'
                      : 'The campaign is ready for withdrawal.'}
                </p>
              </div>

              {withdrawFeedback.text && (
                <p className={`mb-[20px] font-epilogue font-normal text-[14px] leading-[22px] ${
                  withdrawFeedback.type === 'error' ? 'text-[#ff6b6b]' : 'text-[#4acd8d]'
                }`}>
                  {withdrawFeedback.text}
                </p>
              )}

              <CustomButton
                btnType="button"
                title={withdrawButtonTitle}
                styles="w-full bg-[#1dc071]"
                handleClick={handleWithdraw}
                disabled={isWithdrawDisabled}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CampaignDetails
