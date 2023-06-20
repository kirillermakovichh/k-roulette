const Button = (props) => {
  const { loading, disabled, children, ...rest } = props;

  return (
    <button
      className="h-12 rounded-lg bg-green-500 px-4 py-2 text-xl font-semibold text-white "
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "Busy..." : children}
    </button>
  );
};

export default Button;