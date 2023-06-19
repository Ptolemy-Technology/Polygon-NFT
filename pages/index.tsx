import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Items from "../components/items";
import { getItems } from "../utils/nft-market";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const Home: NextPage = () => {
  const [items, setItems] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const { provider, web3Provider, address, chainId } = useSelector(
    (state: RootState) => state.web3
  );

  async function getMarketItems() {
    const items = await getItems(web3Provider, "marketItems");
    setItems(items);
    setItemsLoaded(true);
  }

  useEffect(() => {
    getMarketItems();
  }, [address]);

  return <Items items={items} header="MarketPlace" itemsLoaded={itemsLoaded} />;
};

export default Home;
