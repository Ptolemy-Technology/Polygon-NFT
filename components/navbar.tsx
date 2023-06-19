import { Disclosure } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useRouter } from "next/router";

import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import Loading from "./loading";

const Web3Button = dynamic(() => import("../components/web3-button"), {
  ssr: false,
  loading: () => <Loading />,
});

type Navigation = {
  name: string;
  href: string;
};

const navigations: Navigation[] = [
  { name: "Home", href: "/" },
  { name: "Sell Digital Asset", href: "/sell" },
  { name: "My Digital Assets", href: "/assets" },
  { name: "Creator Dashboard", href: "/creator-dashboard" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const router = useRouter();
  const { user, address } = useSelector((state: RootState) => state.web3);

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="w-[95%] h-[5rem] flex items-center justify-between mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center flex-col gap-2 w-35">
                <h1 className="text-white text-lg font-bold whitespace-nowrap">
                  NFT MarketPlace
                </h1>
                <Web3Button className="text-white border-2 px-2 hover:bg-white hover:text-black transition-all duration-300" />
              </div>
              {(user || address) && (
                <h2 className="text-white text-xl border-2 px-2 rounded-md max-w-[10rem] lg:max-w-[30rem] truncate">
                  {user ? user.sub : address}
                </h2>
              )}
            </div>

            <ul className="hidden md:flex gap-2 items-center justify-around w-[70%] lg:w-[50%]">
              {navigations.map((n, index) => {
                return (
                  <Link key={index} href={n.href}>
                    <li
                      className={classNames(
                        router.pathname === n.href
                          ? "bg-white px-2 py-1 rounded-lg hover:text-black"
                          : "hover:text-white",
                        "cursor-pointer text-pink-400"
                      )}
                    >
                      {n.name}
                    </li>
                  </Link>
                );
              })}
            </ul>

            <Disclosure.Button className="md:hidden">
              {open ? (
                <XIcon className="block text-white w-6 h-6" />
              ) : (
                <MenuIcon className="block text-white w-6 h-6" />
              )}
            </Disclosure.Button>
          </div>

          <Disclosure.Panel
            as="div"
            className="md:hidden h-44 w-full bg-gray-600 flex flex-col justify-center"
          >
            {navigations.map((n, index) => {
              return (
                <Disclosure.Button
                  key={index}
                  className={classNames(
                    router.pathname == n.href ? "bg-white" : "",
                    "p-2 text-pink-400 hover:bg-white hover:text-black"
                  )}
                >
                  <Link href={n.href}>{n.name}</Link>
                </Disclosure.Button>
              );
            })}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
