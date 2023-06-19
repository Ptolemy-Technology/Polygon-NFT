import { withFormik, Form, Field, FormikProps } from "formik";
import { ChangeEvent, useEffect, useState } from "react";
import * as Yup from "yup";
import { create } from "ipfs-http-client";
import SyncLoader from "react-spinners/SyncLoader";
import { CheckIcon } from "@heroicons/react/outline";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import config from "../config/contract";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";
import { NFT as nftType } from "../typechain/NFT";
import { NFTMarket as nftMarketType } from "../typechain/NFTMarket";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const ipfsClient = create({
  url: "https://ipfs.infura.io:5001/api/v0",
});

const FormSchema = Yup.object().shape({
  name: Yup.string().required("NFT name is required"),
  description: Yup.string().required("NFT description is required"),
  price: Yup.number()
    .moreThan(0, "NFT price must be greater than 0")
    .required("NFT price is required"),
  fileUrl: Yup.string().required("File is required"),
});

type FormValues = {
  name: string;
  description: string;
  fileUrl: string;
  price: number;
};

export default function NewNFT() {
  const { web3Provider, address } = useSelector(
    (state: RootState) => state.web3
  );
  const [fileUrl, setFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  async function createMarketItem(values: FormValues, setSubmitting) {
    try {
      const { name, description, fileUrl } = values;
      const data = JSON.stringify({ name, description, imageUrl: fileUrl });

      const added = await ipfsClient.add(data);

      const tokenURI = `https://ipfs.infura.io/ipfs/${added.path}`;

      const signer = web3Provider.getSigner();

      const nftContract = new ethers.Contract(
        config.nftAddress,
        NFT.abi,
        signer
      ) as nftType;

      let transaction = await nftContract.createToken(tokenURI);

      const tx = await transaction.wait();

      const event = tx.events[0];
      const value = event.args[2];
      const tokenId = value.toNumber();

      const price = ethers.utils.parseUnits(String(values.price), "ether");

      const nftMarketContract = new ethers.Contract(
        config.nftMarketAddress,
        NFTMarket.abi,
        signer
      ) as nftMarketType;

      const listingPrice = await nftMarketContract.getListingPrice();

      transaction = await nftMarketContract.createMarketItem(
        config.nftAddress,
        tokenId,
        price,
        {
          value: listingPrice,
        }
      );

      await transaction.wait();

      router.push("/");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  }

  const InnerForm = (props: FormikProps<FormValues>) => {
    const {
      touched,
      errors,
      isSubmitting,
      values,
      setFieldValue,
      setFieldError,
    } = props;

    async function onChange(event: ChangeEvent<HTMLInputElement>) {
      const file = event.target.files[0];
      try {
        setIsUploading(true);
        const added = await ipfsClient.add(file, {
          progress: (prog) => console.log(`received: ${prog}`),
        });

        const url = `https://ipfs.infura.io/ipfs/${added.path}`;

        setFileUrl(url);
        setIsUploading(false);
      } catch (error) {
        setFieldError("fileUrl", "failed to upload file to IPFS");
      }
    }

    useEffect(() => {
      setFieldValue("fileUrl", fileUrl);
    }, [fileUrl]);

    return (
      <div className="m-10">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-xl font-medium leading-6 text-gray-900 mb-2">
                Create New Item
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Make NFT item using following form.
                <br />
                <span className="font-bold">
                  0.0002 MATIC will be charged from your account for the listing
                  price.
                </span>
              </p>
            </div>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <Form method="POST">
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  <div className="col-span-3 sm:col-span-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-400 after:ml-0.5"
                    >
                      Name
                    </label>
                    {touched.name && errors.name && (
                      <div className="text-red-400 text-sm">{errors.name}</div>
                    )}
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <Field
                        type="text"
                        name="name"
                        id="name"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 p-2"
                        placeholder="NFT name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="about"
                      className="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-400 after:ml-0.5"
                    >
                      Description
                    </label>
                    {touched.description && errors.description && (
                      <div className="text-red-400 text-sm">
                        {errors.description}
                      </div>
                    )}

                    <div className="mt-1">
                      <Field
                        as="textarea"
                        id="description"
                        name="description"
                        rows={3}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        placeholder="Description about NFT"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      brief description for your NFT.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-400 after:ml-0.5">
                      Item Image
                    </label>
                    {touched.fileUrl && errors.fileUrl && (
                      <div className="text-red-400 text-sm">
                        {errors.fileUrl}
                      </div>
                    )}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="fileUrl"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-500 hover:text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="fileUrl"
                              name="fileUrl"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={onChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                      </div>
                    </div>
                    {isUploading && (
                      <div className="text-gray-500 my-2 flex justify-between">
                        <p>uploading file</p>
                        <SyncLoader size={7} />
                      </div>
                    )}

                    {!isUploading && fileUrl.length ? (
                      <div className="my-2">
                        <p className="text-gray-500">
                          file uploaded to IPFS{" "}
                          <CheckIcon className="w-5 h-5 text-green-400 inline" />
                        </p>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 after:content-['*'] after:text-red-400 after:ml-0.5"
                    >
                      Item price
                    </label>
                    {touched.price && errors.price && (
                      <div className="text-red-400 text-sm">{errors.price}</div>
                    )}
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <Field
                        type="number"
                        name="price"
                        id="price"
                        className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 p-2"
                        placeholder="NFT price in MATIC"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading || !address}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-pink-600 disabled:cursor-not-allowed disabled:bg-pink-400"
                  >
                    {address ? "Create Asset" : "Connect Wallet to Continue"}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  };

  interface MyFormProps {}

  const MyForm = withFormik<MyFormProps, FormValues>({
    mapPropsToValues: (props) => {
      return {
        name: "",
        price: undefined,
        description: "",
        fileUrl: "",
      };
    },

    validationSchema: FormSchema,

    handleSubmit: (values, { setSubmitting }) => {
      createMarketItem(values, setSubmitting);
    },
  })(InnerForm);

  return <MyForm />;
}
