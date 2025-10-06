import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeClockStore } from "@/stores/timeClockStore";
import { fetchAdjustments, submitAdjustment } from "@/lib/timeClock/api";
import type { AdjustmentRequestPayload } from "@/types/timeClock";
import { useTranslation } from "@/hooks/use-translation";

const adjustmentSchema = z.object({
  requested_timestamp: z.string().min(1, "Provide the original timestamp"),
  new_timestamp: z.string().min(1, "Provide the new timestamp"),
  reason: z.string().min(5, "Describe the reason"),
});

export default function AdjustmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const isOffline = useTimeClockStore((state) => state.isOffline);

  const [adjustments, setAdjustments] = useState<AdjustmentRequestPayload[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      requested_timestamp: "",
      new_timestamp: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (!user) return;
    async function loadAdjustments() {
      try {
        setLoading(true);
        const response = await fetchAdjustments();
        setAdjustments(response.data as AdjustmentRequestPayload[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAdjustments();
  }, [user]);

  async function onSubmit(values: z.infer<typeof adjustmentSchema>) {
    if (isOffline) {
      toast({
        title: t("adjustments.toast.offlineTitle"),
        description: t("adjustments.toast.offlineDescription"),
      });
      return;
    }

    try {
      await submitAdjustment({ ...values, user_id: user?.id });
      toast({
        title: t("adjustments.toast.successTitle"),
        description: t("adjustments.toast.successDescription"),
      });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        title: t("adjustments.toast.errorTitle"),
        description: t("adjustments.toast.errorDescription"),
      });
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("adjustments.title")}</CardTitle>
          <CardDescription>{t("adjustments.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("adjustments.originalTime")}</label>
              <Input type="datetime-local" {...form.register("requested_timestamp")} />
              {form.formState.errors.requested_timestamp && (
                <p className="text-xs text-destructive">{form.formState.errors.requested_timestamp.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">{t("adjustments.newTime")}</label>
              <Input type="datetime-local" {...form.register("new_timestamp")} />
              {form.formState.errors.new_timestamp && (
                <p className="text-xs text-destructive">{form.formState.errors.new_timestamp.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">{t("adjustments.reason")}</label>
              <Textarea rows={4} {...form.register("reason")} />
              {form.formState.errors.reason && (
                <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isOffline}>
              {t("adjustments.submit")}
            </Button>
            {isOffline && (
              <p className="text-xs text-muted-foreground">{t("adjustments.submitOfflineNotice")}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("adjustments.listTitle")}</CardTitle>
          <CardDescription>{t("adjustments.listDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t("adjustments.listLoading")}</p>
          ) : adjustments.length ? (
            <div className="space-y-4">
              {adjustments.map((item) => (
                <div key={item.id} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{format(new Date(item.requested_timestamp), "dd/MM/yyyy HH:mm")}</p>
                      <p className="text-xs text-muted-foreground">Novo horário: {format(new Date(item.new_timestamp), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                    <Badge
                      variant={
                        item.status === "approved"
                          ? "default"
                          : item.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm">{item.reason}</p>
                  {item.approver_comment && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("adjustments.commentLabel")}: {item.approver_comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("adjustments.listEmpty")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
