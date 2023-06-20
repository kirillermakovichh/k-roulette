import { useState } from "react";
import Button from "./Button";
import CustomDialog from "./CustomDialog";
import { Input } from "./Input";

const BetForm = (props) => {
  const { open, onClose, onSubmit } = props;
  const [value, setValue] = useState();
  const [bettype, setBetType] = useState();
  const [error, setError] = useState();

  const onConfirm = () => {
    if (!value) return setError("Must be a valid number");
    if (!bettype) return setError("Must be a valid bet type");
    let xType;

    bettype == "color" ? (xType = 0) : "";
    bettype == "column" ? (xType = 1) : "";
    bettype == "dozen" ? (xType = 2) : "";
    bettype == "eighteen" ? (xType = 3) : "";
    bettype == "modulus" ? (xType = 4) : "";
    bettype == "number" ? (xType = 5) : "";
    onSubmit(value, xType);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Place your bet!"
      description="Choose bet type and value."
    >
      <div className="flex items-end">
        <div className="mr-2 flex flex-grow flex-col">
          <div className="flex">
            <label
              htmlFor="color"
              className="-mt-[3px] mb-1 text-xs font-semibold"
            >
              Color
            </label>
            <Input
              name="bettype"
              id="color"
              type="radio"
              onChange={(e) => setBetType("color")}
              error={error}
            />
            <label
              htmlFor="column"
              className="-mt-[3px] ml-2 mb-1 text-xs font-semibold text-red-500"
            >
              Column
            </label>
            <Input
              name="bettype"
              id="column"
              type="radio"
              onChange={(e) => setBetType("column")}
              error={error}
            />
            <label
              htmlFor="dozen"
              className="-mt-[3px] ml-2 mb-1 text-xs font-semibold"
            >
              Dozen
            </label>
            <Input
              name="bettype"
              id="dozen"
              type="radio"
              onChange={(e) => setBetType("dozen")}
              error={error}
            />
            <label
              htmlFor="eighteen"
              className="-mt-[3px] ml-2 mb-1 text-xs font-semibold text-green-500"
            >
              Eighteen
            </label>
            <Input
              name="bettype"
              id="eighteen"
              type="radio"
              onChange={(e) => setBetType("eighteen")}
              error={error}
            />
            <label
              htmlFor="modulus"
              className="-mt-[3px] ml-2 mb-1 text-xs font-semibold text-red-500"
            >
              Even/Odd
            </label>
            <Input
              name="bettype"
              id="modulus"
              type="radio"
              onChange={(e) => setBetType("modulus")}
              error={error}
            />
            <label
              htmlFor="number"
              className="-mt-[3px] ml-2 mb-1 text-xs font-semibold"
            >
              Number
            </label>
            <Input
              name="bettype"
              id="number"
              type="radio"
              onChange={(e) => setBetType("number")}
              error={error}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="value" className="-mt-2 mb-1 text-sm font-semibold">
              Value
            </label>
            <Input
              name="value"
              id="value"
              type="number"
              onChange={(e) => setValue(e.target.value)}
              error={error}
            />
          </div>
          <Button onClick={onConfirm}>BET</Button>
        </div>
      </div>
    </CustomDialog>
  );
};

export default BetForm;
