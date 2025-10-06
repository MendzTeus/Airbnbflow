import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/hooks/use-data";
import {
  adminListJobs,
  adminUpsertJob,
  adminToggleJob,
  adminAssignUsers,
  fetchAdjustments,
  updateAdjustmentStatus,
  fetchTimesheet,
  exportTimesheet,
} from "@/lib/timeClock/api";
import type { JobSummary, AdjustmentRequestPayload, TimesheetEntry } from "@/types/timeClock";

const jobSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1),
  name: z.string().min(1),
  client: z.string().optional(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().min(10),
  allowed_start: z.string().default("06:00"),
  allowed_end: z.string().default("22:00"),
  color_tag: z.string().optional(),
  active: z.boolean().default(true),
});

export default function AdminTimeClockPage() {
  const { toast } = useToast();
  const { employees } = useData();

  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [adjustments, setAdjustments] = useState<AdjustmentRequestPayload[]>([]);
  const [timesheet, setTimesheet] = useState<TimesheetEntry[]>([]);
  const [loadingTimesheet, setLoadingTimesheet] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      code: "",
      name: "",
      client: "",
      lat: -23.55,
      lng: -46.63,
      radius: 150,
      allowed_start: "06:00",
      allowed_end: "22:00",
      color_tag: "#2563eb",
      active: true,
    },
  });

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await adminListJobs();
        setJobs(response.data as JobSummary[]);
      } catch (error) {
        console.error(error);
        toast({ title: "Erro ao carregar jobs", description: "Verifique a conexão." });
      }
    }

    async function loadAdjustments() {
      try {
        const data = await fetchAdjustments();
        setAdjustments(data.data as AdjustmentRequestPayload[]);
      } catch (error) {
        console.error(error);
      }
    }

    loadJobs();
    loadAdjustments();
  }, [toast]);

  async function handleSubmitJob(values: z.infer<typeof jobSchema>) {
    try {
      const payload: Partial<JobSummary> = {
        id: values.id,
        code: values.code,
        name: values.name,
        client: values.client ?? "",
        geofence_center: { lat: values.lat, lng: values.lng },
        geofence_radius_m: values.radius,
        allowed_hours: { start: values.allowed_start, end: values.allowed_end },
        color_tag: values.color_tag,
        active: values.active,
      };
      const saved = await adminUpsertJob(payload);
      setJobs((current) => {
        const index = current.findIndex((item) => item.id === saved.id);
        if (index >= 0) {
          const copy = [...current];
          copy[index] = saved as JobSummary;
          return copy;
        }
        return [saved as JobSummary, ...current];
      });
      toast({ title: "Job salvo", description: `${saved.code} atualizado com sucesso.` });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar job", description: "Revise os campos e tente novamente." });
    }
  }

  async function handleToggleJob(job: JobSummary) {
    try {
      const updated = await adminToggleJob(job.id, !job.active);
      setJobs((current) => current.map((item) => (item.id === job.id ? (updated as JobSummary) : item)));
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao atualizar status" });
    }
  }

  async function handleAssign() {
    if (!selectedJob || !selectedUser) {
      toast({ title: "Selecione job e usuário" });
      return;
    }
    try {
      await adminAssignUsers(selectedJob, [selectedUser]);
      toast({ title: "Usuário atribuído" });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao atribuir", description: "Tente novamente." });
    }
  }

  async function handleModerateAdjustment(id: string, action: "approve" | "reject") {
    try {
      await updateAdjustmentStatus(id, action, "Analisado pelo administrador");
      setAdjustments((current) =>
        current.map((item) => (item.id === id ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item))
      );
      toast({ title: `Solicitação ${action === "approve" ? "aprovada" : "rejeitada"}` });
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao atualizar solicitação" });
    }
  }

  async function loadAdminTimesheet() {
    if (!selectedUser) {
      toast({ title: "Selecione um usuário" });
      return;
    }
    try {
      setLoadingTimesheet(true);
      const data = await fetchTimesheet({ user_id: selectedUser, from: format(new Date(), "yyyy-MM-01"), to: format(new Date(), "yyyy-MM-dd") });
      setTimesheet(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao carregar timesheet" });
    } finally {
      setLoadingTimesheet(false);
    }
  }

  async function handleExportAdmin(formatType: "csv" | "xlsx" | "pdf") {
    if (!selectedUser) {
      toast({ title: "Selecione um usuário" });
      return;
    }
    try {
      const { blob, fileName } = await exportTimesheet({ user_id: selectedUser, format: formatType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast({ title: "Erro na exportação" });
    }
  }

  const employeesList = useMemo(() => Object.values(employees ?? {}), [employees]);

  return (
    <Tabs defaultValue="jobs" className="space-y-6">
      <TabsList>
        <TabsTrigger value="jobs">Jobs/Sites</TabsTrigger>
        <TabsTrigger value="assignments">Atribuições</TabsTrigger>
        <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
        <TabsTrigger value="adjustments">Solicitações</TabsTrigger>
      </TabsList>

      <TabsContent value="jobs" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Job/Site</CardTitle>
            <CardDescription>Cadastre perímetro, janela de batida e status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmitJob)} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Código</label>
                <Input {...form.register("code")} />
              </div>
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input {...form.register("name")} />
              </div>
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Input {...form.register("client")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Latitude</label>
                  <Input type="number" step="0.000001" {...form.register("lat", { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="text-sm font-medium">Longitude</label>
                  <Input type="number" step="0.000001" {...form.register("lng", { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Raio (m)</label>
                <Input type="number" {...form.register("radius", { valueAsNumber: true })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Início permitido</label>
                  <Input type="time" {...form.register("allowed_start")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Fim permitido</label>
                  <Input type="time" {...form.register("allowed_end")} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Cor tag</label>
                <Input type="color" {...form.register("color_tag")} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.watch("active") ?? true} onCheckedChange={(checked) => form.setValue("active", checked)} />
                <span className="text-sm">Ativo</span>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit">Salvar Job</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs cadastrados</CardTitle>
            <CardDescription>Gerencie o status e revise perímetros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length ? (
              jobs.map((job) => (
                <div key={job.id} className="flex items-start justify-between rounded-xl border p-4">
                  <div>
                    <p className="font-semibold">{job.code} – {job.name}</p>
                    <p className="text-xs text-muted-foreground">Raio {job.geofence_radius_m} m • Horário {job.allowed_hours?.start} - {job.allowed_hours?.end}</p>
                    <p className="text-xs text-muted-foreground">Lat {job.geofence_center.lat}, Lng {job.geofence_center.lng}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={job.active ? "default" : "secondary"}>{job.active ? "Ativo" : "Inativo"}</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleToggleJob(job)}>
                      {job.active ? "Desativar" : "Reativar"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum job cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assignments">
        <Card>
          <CardHeader>
            <CardTitle>Atribuir usuários a Jobs</CardTitle>
            <CardDescription>Selecione um job e vincule colaboradores.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Job</label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.code} – {job.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Usuário</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employeesList.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button onClick={handleAssign}>Atribuir</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timesheet" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Timesheet administrativo</CardTitle>
            <CardDescription>Filtre por usuário e exporte.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Usuário</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {employeesList.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3">
              <Button onClick={loadAdminTimesheet} disabled={loadingTimesheet}>
                {loadingTimesheet ? "Carregando..." : "Carregar"}
              </Button>
              <Button variant="outline" onClick={() => handleExportAdmin("csv")}>Exportar CSV</Button>
              <Button variant="outline" onClick={() => handleExportAdmin("xlsx")}>Exportar XLSX</Button>
            </div>
          </CardContent>
        </Card>

        <div className="overflow-hidden rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Job</th>
                <th className="px-4 py-3 text-left">Entrada</th>
                <th className="px-4 py-3 text-left">Saída</th>
                <th className="px-4 py-3 text-left">Total trabalhado</th>
              </tr>
            </thead>
            <tbody>
              {timesheet.length ? (
                timesheet.map((entry) => (
                  <tr key={entry.event_uuid} className="border-t">
                    <td className="px-4 py-2">{format(new Date(entry.date), "dd/MM/yyyy")}</td>
                    <td className="px-4 py-2">{entry.job_name}</td>
                    <td className="px-4 py-2">{format(new Date(entry.clock_in), "HH:mm")}</td>
                    <td className="px-4 py-2">{entry.clock_out ? format(new Date(entry.clock_out), "HH:mm") : "--"}</td>
                    <td className="px-4 py-2">{Math.round(entry.total_minutes - entry.break_minutes)} min</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum dado carregado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="adjustments">
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de ajuste</CardTitle>
            <CardDescription>Approve ou rejeite com comentário registrado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adjustments.length ? (
              adjustments.map((item) => (
                <div key={item.id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{format(new Date(item.requested_timestamp), "dd/MM/yyyy HH:mm")} → {format(new Date(item.new_timestamp), "dd/MM/yyyy HH:mm")}</p>
                      <p className="text-xs text-muted-foreground">Motivo: {item.reason}</p>
                    </div>
                    <Badge variant={item.status === "pending" ? "secondary" : item.status === "approved" ? "default" : "destructive"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <Button size="sm" variant="outline" onClick={() => handleModerateAdjustment(item.id, "approve")}>Aprovar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleModerateAdjustment(item.id, "reject")}>Rejeitar</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma solicitação pendente.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
