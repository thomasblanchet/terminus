import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  noBorder?: boolean;
}

const MultiLineInput = React.forwardRef<HTMLTextAreaElement, InputProps>(
  ({ className, noBorder = false, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight + 8}px`;
      }
    };

    React.useEffect(() => {
      adjustHeight();
    }, [props.value]);

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();

      if (props.onChange) {
        props.onChange(event);
      }
    };

    return (
      <textarea
        className={cn(
          "flex w-full resize-none overflow-hidden bg-transparent px-3 pt-[7px] pb-[1px] text-sm shadow-sm transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          noBorder
            ? "border-0 shadow-none focus:border-none focus:outline-none focus:ring-0 appearance-none outline-none"
            : "rounded-md border border-input focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className,
        )}
        rows={1}
        ref={(el) => {
          textareaRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        onChange={handleInput}
        {...props}
      />
    );
  },
);
MultiLineInput.displayName = "MultiLineInput";

export { MultiLineInput };
