// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, Users, ClipboardCheck, Key, Wrench, ChevronRight, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/use-translation";
import { useData } from "@/hooks/use-data"; // Importar useData
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton
import { useLiveTimeTotals } from "@/hooks/use-live-time-totals";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { properties, employees, maintenanceRequests } = useData(); // Obter dados do useData

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const timeClockDisplay = useLiveTimeTotals();

  // Derivar estatísticas dos dados reais
  const stats = {
    properties: Object.keys(properties).length,
    employees: Object.keys(employees).length,
    pendingMaintenanceRequests: Object.values(maintenanceRequests).filter(req => req.status !== "completed").length,
  };

  useEffect(() => {
    // Considera que os dados terminaram de carregar mesmo quando não há registros
    const hasAnyData = [properties, employees, maintenanceRequests].some(
      (collection) => Object.keys(collection).length > 0,
    );

    if (hasAnyData) {
      setDashboardLoading(false);
      return;
    }

    const timer = setTimeout(() => setDashboardLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [properties, employees, maintenanceRequests]);


  const DashboardCard = ({
    title,
    value,
    icon: Icon,
    description,
    linkTo,
    color = "bg-primary/10",
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    linkTo: string;
    color?: string;
  }) => (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${color} p-2 rounded-full`}>
          <Icon size={18} className="text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between flex-1 pb-0">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link to={linkTo} className="w-full">
          <Button variant="outline" className="w-full text-xs justify-between">
            {t("common.viewDetails")}
            <ChevronRight size={16} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );

  const QuickAccessCard = () => (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t("dashboard.quickAccess")}</CardTitle>
        <CardDescription>{t("dashboard.frequentlyUsed")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-1">
        <div className="space-y-2 flex-1">
          <Link to="/properties/new">
            <Button variant="outline" className="w-full justify-start">
              <Building className="mr-2 h-4 w-4" />
              {t("dashboard.addProperty")}
            </Button>
          </Link>
          <Link to="/checklists/new">
            <Button variant="outline" className="w-full justify-start">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {t("dashboard.createChecklist")}
            </Button>
          </Link>
          <Link to="/access-codes">
            <Button variant="outline" className="w-full justify-start">
              <Key className="mr-2 h-4 w-4" />
              {t("dashboard.manageAccessCodes")}
            </Button>
          </Link>
          <Link to="/maintenance/new">
            <Button variant="outline" className="w-full justify-start">
              <Wrench className="mr-2 h-4 w-4" />
              {t("dashboard.reportIssue")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>

      {dashboardLoading ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {[...Array(user?.role === "manager" ? 5 : 4)].map((_, i) => (
            <Card key={i} className="h-[180px] animate-pulse">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
            <DashboardCard
              title="Time Clock"
              value={timeClockDisplay}
              icon={Clock}
              description="Horas registradas hoje"
              linkTo="/time-clock"
              color="bg-sky-100"
            />
            <DashboardCard
              title={t("dashboard.properties")}
              value={stats.properties}
              icon={Building}
              description={t("dashboard.totalProperties")}
              linkTo="/properties"
            />
            <DashboardCard
              title={t("dashboard.employees")}
              value={stats.employees}
              icon={Users}
              description={t("dashboard.activeEmployees")}
              linkTo="/employees"
            />
            
            <DashboardCard
              title={t("dashboard.maintenanceRequests")}
              value={stats.pendingMaintenanceRequests} // Usar requests pendentes
              icon={Wrench}
              description={`${stats.pendingMaintenanceRequests} ${t("dashboard.pendingRequests")}`}
              linkTo="/maintenance"
              color="bg-amber-100"
            />
            {user?.role === "manager" && <QuickAccessCard />}
          </div>
        </>
      )}
    </div>
  );
}
