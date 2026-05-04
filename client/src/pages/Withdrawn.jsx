import React, { useEffect, useState } from 'react';

import { DisplayCampaigns } from '../components';
import { useStateContext } from '../context';

const Withdrawn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  const { address, contract, getUserCampaigns } = useStateContext();

  const fetchWithdrawnCampaigns = async () => {
    setIsLoading(true);

    try {
      const data = await getUserCampaigns();
      const withdrawnCampaigns = data.filter((campaign) => campaign.withdrawn);

      setCampaigns(withdrawnCampaigns);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchWithdrawnCampaigns();
    }
  }, [address, contract]);

  return (
    <DisplayCampaigns
      title="Withdrawn Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Withdrawn;
