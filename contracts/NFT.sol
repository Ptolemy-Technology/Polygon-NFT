// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  address private _marketplaceAddress;

  event TokenCreated(uint256 indexed tokenId);

  constructor(address marketplaceAddres) ERC721("Metaverse tokens", "MTT") {
    _marketplaceAddress = marketplaceAddres;
  }

  function createToken(string memory tokenURI) public returns (uint256) {
    uint256 tokenId = _tokenIds.current();

    _mint(msg.sender, tokenId);
    _setTokenURI(tokenId, tokenURI);
    setApprovalForAll(_marketplaceAddress, true);

    _tokenIds.increment();
    emit TokenCreated(tokenId);
    return tokenId;
  }
}
