import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeClockStore } from "@/stores/timeClockStore";
import { exportTimesheet, fetchTimesheet } from "@/lib/timeClock/api";
import type { TimesheetEntry } from "@/types/timeClock";
import { useTranslation } from "@/hooks/use-translation";

const EXPORT_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "XLSX" },
  { value: "pdf", label: "PDF" },
] as const;

export default function TimesheetPage() {
  const { user } = useAuth();
  const jobs = useTimeClockStore((state) => state.jobs);
  const { toast } = useToast();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [jobId, setJobId] = useState<string>("");
  const [from, setFrom] = useState(() => format(subDays(new Date(), 7), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (!user) return;
    async function loadTimesheet() {
      try {
        setLoading(true);
        const data = await fetchTimesheet({ user_id: user.id, from, to, job_id: jobId || undefined });
        setEntries(data);
      } catch (error) {
        console.error(error);
        toast({
          title: t("timesheet.toast.loadErrorTitle"),
          description: t("timesheet.toast.loadErrorDescription"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTimesheet();
  }, [user, from, to, jobId, toast]);

  const totalMinutes = entries.reduce((sum, entry) => sum + entry.total_minutes - entry.break_minutes, 0);
  const totalHours = `${Math.floor(totalMinutes / 60)}h ${(totalMinutes % 60).toString().padStart(2, "0")}m`;

  async function handleExport(formatType: "csv" | "xlsx" | "pdf") {
    if (!user) return;
    try {
      const { blob, fileName } = await exportTimesheet({
        user_id: user.id,
        from,
        to,
        job_id: jobId || undefined,
        format: formatType,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast({
        title: t("timesheet.toast.exportErrorTitle"),
        description: t("timesheet.toast.exportErrorDescription"),
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("timesheet.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("timesheet.from")}</label>
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("timesheet.to")}</label>
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("timesheet.job")}</label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger>
                <SelectValue placeholder={t("timesheet.allJobs") as string} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("timesheet.allJobs")}</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.code} – {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("timesheet.periodTotal")}</label>
            <p className="rounded-lg border bg-muted px-3 py-2 text-sm">{totalHours}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {EXPORT_FORMATS.map((item) => (
          <Button key={item.value} variant="outline" onClick={() => handleExport(item.value)}>
            {t("timesheet.exportPrefix")} {item.label}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left">
              <th className="px-4 py-3">{t("timesheet.table.date")}</th>
              <th className="px-4 py-3">{t("timesheet.table.job")}</th>
              <th className="px-4 py-3">{t("timesheet.table.clockIn")}</th>
              <th className="px-4 py-3">{t("timesheet.table.clockOut")}</th>
              <th className="px-4 py-3">{t("timesheet.table.breaks")}</th>
              <th className="px-4 py-3">{t("timesheet.table.total")}</th>
              <th className="px-4 py-3">{t("timesheet.table.source")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  {t("timesheet.loading")}
                </td>
              </tr>
            ) : entries.length ? (
              entries.map((entry) => (
                <tr key={entry.event_uuid} className="border-t">
                  <td className="px-4 py-3">{format(new Date(entry.date), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3">{entry.job_name}</td>
                  <td className="px-4 py-3">{format(new Date(entry.clock_in), "HH:mm")}</td>
                  <td className="px-4 py-3">{entry.clock_out ? format(new Date(entry.clock_out), "HH:mm") : "--"}</td>
                  <td className="px-4 py-3">{Math.round(entry.break_minutes)} {t("timesheet.table.breakMinutesSuffix")}</td>
                  <td className="px-4 py-3">{Math.round(entry.total_minutes - entry.break_minutes)} {t("timesheet.table.totalMinutesSuffix")}</td>
                  <td className="px-4 py-3">
                    <Badge variant={entry.source === "offline" ? "secondary" : "outline"} className="flex items-center gap-1">
                      {entry.source === "offline" ? t("timesheet.table.offline") : t("timesheet.table.online")}
                      <ArrowUpRight className="h-3 w-3" />
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                  {t("timesheet.noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
