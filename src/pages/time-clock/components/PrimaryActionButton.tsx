import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation, type TranslationKey } from "@/hooks/use-translation";

export type TimeClockAction = "clock_in" | "break_start" | "break_end" | "clock_out";

interface PrimaryActionButtonProps {
  action: TimeClockAction;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const labelKeys: Record<TimeClockAction, TranslationKey> = {
  clock_in: "timeClock.action.clockIn",
  break_start: "timeClock.action.breakStart",
  break_end: "timeClock.action.breakEnd",
  clock_out: "timeClock.action.clockOut",
};

export function PrimaryActionButton({ action, onClick, disabled, loading }: PrimaryActionButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className="h-16 w-full rounded-2xl text-lg font-semibold"
      size="lg"
    >
      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} {t(labelKeys[action])}
    </Button>
  );
}
