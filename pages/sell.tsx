import { NextPage } from "next";
import NewItem from "../components/new-item";

const Sell: NextPage = () => {
  return (
    <div className="flex flex-col justify-center items-center pt-4">
      <NewItem />
    </div>
  );
};

export default Sell;
