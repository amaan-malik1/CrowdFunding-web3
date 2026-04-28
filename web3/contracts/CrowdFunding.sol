// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.3;
pragma experimental ABIEncoderV2;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        address[] donators;
        uint256[] donations;
        bool withdrawn;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        require(
            _deadline > block.timestamp,
            "The deadline should be a date in the future."
        );

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        require(_id < numberOfCampaigns, "Campaign does not exist.");

        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        require(
            block.timestamp < campaign.deadline,
            "Campaign deadline has passed."
        );
        require(amount > 0, "Donation should be greater than 0.");

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");

        require(sent, "Failed to send Ether to campaign owner.");

        campaign.amountCollected = campaign.amountCollected + amount;
    }

    function getDonators(
        uint256 _id
    ) public view returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for (uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }

        return allCampaigns;
    }

    function withdraw(uint256 _id) public {
        require(_id < numberOfCampaigns, "Campaign does not exist.");

        Campaign storage campaign = campaigns[_id];

        require(
            msg.sender == campaign.owner,
            "Only campaign owner can withdraw."
        );
        require(
            block.timestamp > campaign.deadline,
            "Campaign deadline has not passed yet."
        );
        require(
            campaign.amountCollected >= campaign.target,
            "Target amount not reached."
        );
        require(!campaign.withdrawn, "Funds have already been withdrawn.");

        campaign.withdrawn = true;

        (bool sent, ) = payable(campaign.owner).call{
            value: campaign.amountCollected
        }("");

        require(sent, "Failed to send Ether to campaign owner.");
    }
}
