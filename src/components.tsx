import { forwardRef } from "react";

export type ButtonProps = React.ComponentPropsWithRef<"button">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    return (
      <button
        {...props}
        ref={ref}
        className={[props.className, "Button rounded shadow px-4 py-2"]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }
);
