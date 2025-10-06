import { useMemo, useState, type CSSProperties } from "react";
import { List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { JobSummary } from "@/types/timeClock";
import { useTranslation } from "@/hooks/use-translation";

interface JobSelectModalProps {
  open: boolean;
  onClose: () => void;
  jobs: JobSummary[];
  onSelect: (job: JobSummary) => void;
  loading?: boolean;
}

export function JobSelectModal({ open, onClose, jobs, onSelect, loading }: JobSelectModalProps) {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    const term = search.toLowerCase();
    return jobs.filter((job) =>
      [job.code, job.name, job.client].some((value) => value?.toLowerCase().includes(term))
    );
  }, [jobs, search]);

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const job = filtered[index];
    return (
      <button
        type="button"
        style={style}
        onClick={() => {
          onSelect(job);
          onClose();
        }}
        className="flex w-full flex-col items-start gap-1 border-b px-3 py-3 text-left hover:bg-muted"
      >
        <span className="font-medium text-sm">{job.code} – {job.name}</span>
        <span className="text-xs text-muted-foreground">{job.client}</span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("timeClock.changeJob")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("common.search")}
            autoFocus
          />
          {loading ? (
            <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : (
            <div className="h-60">
              <AutoSizer>
                {({ width, height }) => (
                  <List
                    height={height}
                    width={width}
                    itemCount={filtered.length}
                    itemSize={64}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          )}
          <Button variant="ghost" onClick={onClose} className="w-full">
            {t("common.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
