// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  uint256 listingPrice = 0.0002 ether;

  address payable owner;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value >= listingPrice, "value must be equal to listing price");

    uint256 itemId = _itemIds.current();

    idToMarketItem[itemId] = MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    _itemIds.increment();

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

  function createMarketSale(uint256 itemId) public payable nonReentrant {
    uint256 price = idToMarketItem[itemId].price;
    require(msg.value == price, "Please submit the asking price");
    idToMarketItem[itemId].seller.transfer(price);

    uint256 tokenId = idToMarketItem[itemId].tokenId;
    address nftContract = idToMarketItem[itemId].nftContract;

    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;

    _itemsSold.increment();

    payable(owner).transfer(listingPrice);
  }

  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemsCount = _itemIds.current();
    uint256 unsoldItemsCount = itemsCount - _itemsSold.current();

    MarketItem[] memory items = new MarketItem[](unsoldItemsCount);

    uint256 currentIndex = 0;
    for (uint256 i = 0; i < itemsCount; i++) {
      if (idToMarketItem[i].sold == false) {
        items[currentIndex] = idToMarketItem[i];
        currentIndex += 1;
      }
    }

    return items;
  }

  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint256 itemsCount = _itemIds.current();
    uint256 myNFTsCount = 0;
    for (uint256 i = 0; i < itemsCount; i++) {
      if (idToMarketItem[i].owner == msg.sender) {
        myNFTsCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](myNFTsCount);

    uint256 currentIndex = 0;
    for (uint256 i = 0; i < itemsCount; i++) {
      if (idToMarketItem[i].owner == msg.sender) {
        items[currentIndex] = idToMarketItem[i];
        currentIndex += 1;
      }
    }

    return items;
  }

  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint256 itemsCount = _itemIds.current();
    uint256 createdItemsCount = 0;

    for (uint256 i = 0; i < itemsCount; i++) {
      if (idToMarketItem[i].seller == msg.sender) {
        createdItemsCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](createdItemsCount);

    uint256 currentIndex = 0;
    for (uint256 i = 0; i < itemsCount; i++) {
      if (idToMarketItem[i].seller == msg.sender) {
        items[currentIndex] = idToMarketItem[i];
        currentIndex += 1;
      }
    }

    return items;
  }
}
