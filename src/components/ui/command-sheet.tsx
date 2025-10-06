import * as React from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CommandSheetProps extends React.ComponentProps<typeof Dialog> {}

const CommandSheet = React.forwardRef<HTMLDivElement, CommandSheetProps>(
  ({ children, ...props }, ref) => (
    <Dialog {...props}>
      <DialogContent className="p-0 overflow-hidden">
        <Command className="h-96 w-full" ref={ref}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  ),
);
CommandSheet.displayName = "CommandSheet";

export { CommandSheet };
