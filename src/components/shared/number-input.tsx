import { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";

interface NumberInputProps {
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  allowNegative?: boolean;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <NumericFormat
        {...props}
        getInputRef={ref}
        thousandSeparator="."
        decimalSeparator=","
        allowNegative={props.allowNegative}
        onValueChange={(values) => {
          onChange(values.floatValue?.toString() || "");
        }}
        customInput={Input}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
