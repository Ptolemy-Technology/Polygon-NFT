import { ethers } from "ethers";
import config from "../config/contract";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import { NFTMarket as nftMarketType } from "../typechain/NFTMarket";
import { NFT as nftType } from "../typechain/NFT";
import axios from "axios";

type fetchType = "marketItems" | "myNFTs" | "itemsCreated";

type NFT = {
  price: string;
  itemId: number;
};

export async function getItems(web3Provider: any, fetch: fetchType) {
  if (!web3Provider) {
    return false;
  }

  const fetchMethodConvert = {
    marketItems: "fetchMarketItems",
    myNFTs: "fetchMyNFTs",
    itemsCreated: "fetchItemsCreated",
  };

  const signer = web3Provider.getSigner();

  const nftMarketContract = new ethers.Contract(
    config.nftMarketAddress,
    NFTMarket.abi,
    signer
  ) as nftMarketType;

  const nftContract = new ethers.Contract(
    config.nftAddress,
    NFT.abi,
    signer
  ) as nftType;

  let items = await nftMarketContract[fetchMethodConvert[fetch]]();

  items = await Promise.all(
    items.map(async (item) => {
      const tokenURI = await nftContract.tokenURI(item.tokenId);
      const metaData = (await axios.get(tokenURI)).data;

      return {
        name: metaData.name,
        description: metaData.description,
        imageSrc: metaData.imageUrl,
        itemId: item.itemId.toNumber(),
        price: ethers.utils.formatUnits(item.price, "ether"),
      };
    })
  );

  return items;
}

export async function buyNFT(web3Provider: any, nft: NFT) {
  const signer = web3Provider.getSigner();

  const nftMarketContract = new ethers.Contract(
    config.nftMarketAddress,
    NFTMarket.abi,
    signer
  ) as nftMarketType;
  const price = ethers.utils.parseUnits(nft.price, "ether");

  const transaction = await nftMarketContract.createMarketSale(nft.itemId, {
    value: price,
  });
  await transaction.wait();
}
