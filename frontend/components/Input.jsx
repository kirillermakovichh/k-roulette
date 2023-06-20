import { useField } from "formik";
import classNames from "classnames";

export const Input = (props) => {
  const { error, className, ...rest } = props;

  return (
    <input
      className={classNames(
        className,
        "rounded border border-[#000] px-2 py-2 mb-2 mx-1 text-xl bg-inherit",
        {
          "border-black-300": !error,
          "border-red-500": error,
        }
      )}
      {...rest}
    />
  );
};

const FormikInput = (props) => {
  const [, { error, value }, { setValue }] = useField(props.name);

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      error={error}
      {...props}
    />
  );
};

export default FormikInput;
