import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Items from "../components/items";
import { getItems } from "../utils/nft-market";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Home: NextPage = () => {
  const { web3Provider } = useSelector((state: RootState) => state.web3);

  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);

  async function getMarketItems() {
    const items = await getItems(web3Provider, "myNFTs");
    setItems(items);
    setItemsLoaded(true);
  }

  useEffect(() => {
    getMarketItems();
  }, []);

  return (
    <Items items={items} header="My Digital Assets" itemsLoaded={itemsLoaded} />
  );
};

export default Home;
