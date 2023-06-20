import { useMemo } from "react";
import Blockies from "react-blockies";
import { minifyAddress } from "../helpers";

const AddressAvatar = ({ address }) => {
  const shortAddress = useMemo(() => minifyAddress(address), [address]);

  return (
    <div className="flex h-10 items-center">
      <Blockies
        scale={3}
        seed={address.toLowerCase()}
        className="mx-2 rounded-md"
      />
      <span className="text-xs text-white font-semibold drop-shadow-md cursor-default">
        {shortAddress}
      </span>
    </div>
  );
};

export default AddressAvatar;
