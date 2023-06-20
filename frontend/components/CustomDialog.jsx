import { Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";

const CustomDialog = (props) => {
  const { open, onClose, title, description, children } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto "
    >
      <div className="relative z-20 flex flex-col rounded-xl bg-[#eae7dc] p-4">
        <button onClick={onClose} className="absolute right-4 top-4">
          <XIcon className="h-5 w-5" />
        </button>
        <Dialog.Title className="text-2xl font-bold ">{title}</Dialog.Title>
        <Dialog.Description className="mb-2">{description}</Dialog.Description>
        {children}
      </div>
      <Dialog.Overlay className="fixed inset-0 z-10 bg-black opacity-30" />
    </Dialog>
  );
};

export default CustomDialog;
