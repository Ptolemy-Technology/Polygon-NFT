import { buyNFT } from "../utils/nft-market";
import { useRouter } from "next/router";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";

type NFTProps = {
  name: string;
  description: string;
  price: string;
  imageSrc: string;
  itemId: number;
};

export default function ItemCard({
  name,
  description,
  price,
  imageSrc,
  itemId,
}: NFTProps) {
  const { web3Provider } = useSelector((state: RootState) => state.web3);

  const router = useRouter();

  async function handleBuy() {
    const nft = {
      price,
      itemId,
    };

    await buyNFT(web3Provider, nft);
    router.reload();
  }

  return (
    <div className="w-[17rem] h-[25rem] rounded-lg flex flex-col justify-between overflow-hidden">
      <div>
        <img
          className="w-full h-[13rem] object-cover"
          src={imageSrc}
          alt={imageSrc}
        />
      </div>

      <div className="border-x-2 h-full p-2">
        <h1 className="text-lg font-bold">{name}</h1>

        <p className="text-slate-500 mt-4">{description}</p>
      </div>

      <div className="bg-black text-white h-[40%] p-2">
        <p className="font-bold my-2">{price} MATIC</p>

        {router.pathname == "/" && (
          <button
            onClick={handleBuy}
            className="bg-pink-500 w-full rounded-sm font-bold py-1"
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
}
