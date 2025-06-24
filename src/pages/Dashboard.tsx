// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Building, 
  Users, 
  ClipboardCheck, 
  Key, 
  Wrench,
  ChevronRight,
  Percent,
  TrendingUp,
  AlertTriangle,
  CalendarDays
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/use-translation";
import { useSettings } from "@/contexts/SettingsContext";
import { useData } from "@/hooks/use-data"; // Importar useData
import { CalendarEvent, Property, Employee } from "@/types";
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useSettings();
  const { properties, employees, maintenanceRequests, events } = useData(); // Obter dados do useData

  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Derivar estatísticas dos dados reais
  const stats = {
    properties: Object.keys(properties).length,
    // A ocupação é complexa e dependeria de dados de reservas,
    // manteremos um valor mockado ou simplificado por enquanto
    occupancy: 85, 
    employees: Object.keys(employees).length,
    pendingMaintenanceRequests: Object.values(maintenanceRequests).filter(req => req.status !== "completed").length,
    // Recents activity é mockado para não complicar demais o escopo
    recentActivity: [
      { id: 1, message: "New maintenance request for Oceanview Apartment", time: "2 hours ago" },
      { id: 2, message: "Sarah completed checklist for Downtown Loft", time: "5 hours ago" },
      { id: 3, message: "New property added: Mountain Retreat", time: "1 day ago" },
      { id: 4, message: "Access code updated for Beachfront Villa", time: "2 days ago" }
    ]
  };

  const todayEvents = Object.values(events).filter(event => {
    const eventDate = parseISO(event.startDate);
    return isToday(eventDate);
  }).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

  useEffect(() => {
    // Definir loading como false quando todos os dados do DataContext forem carregados
    // Uma forma simples é verificar se há algum dado carregado
    if (Object.keys(properties).length > 0 || Object.keys(employees).length > 0) {
      setDashboardLoading(false);
    }
    // Uma abordagem mais robusta seria ter um isLoading global no DataContext
    // ou usar react-query com isLoading para cada fetch.
  }, [properties, employees, maintenanceRequests, events]);


  const DashboardCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    linkTo,
    color = "bg-primary/10"
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    linkTo: string;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`${color} p-2 rounded-full`}>
          <Icon size={18} className="text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <div className="text-sm text-muted-foreground">
          {t("dashboard.welcomeBack")}, {user?.name}
        </div>
      </div>

      {dashboardLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="w-full h-[180px] animate-pulse">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title={t("dashboard.properties")}
              value={stats.properties}
              icon={Building}
              description={t("dashboard.totalProperties")}
              linkTo="/properties"
            />
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{t("dashboard.occupancy")}</CardTitle>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Percent size={18} className="text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{stats.occupancy}%</div>
                <Progress value={stats.occupancy} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  {t("dashboard.occupancyTrend")}
                </p>
              </CardContent>
            </Card>
            
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
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Today's schedule */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{t("dashboard.todaySchedule")}</CardTitle>
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  {format(new Date(), "EEEE, MMMM d, yyyy", { 
                    locale: language === "pt-br" ? ptBR : undefined 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todayEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">{t("dashboard.noEventsToday")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map(event => {
                      const property = properties[event.propertyId]; // Obter da data real
                      const employee = employees[event.assignedTo || '']; // Obter da data real
                      
                      return (
                        <div 
                          key={event.id} 
                          className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0"
                        >
                          <div className={`p-2 rounded-full ${
                            event.type === "cleaning" ? "bg-green-100" : 
                            event.type === "maintenance" ? "bg-amber-100" : "bg-blue-100"
                          }`}>
                            {event.type === "cleaning" ? (
                              <ClipboardCheck className="h-4 w-4" />
                            ) : (
                              <Wrench className="h-4 w-4" />
                            )}
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{event.title}</p>
                              <Badge variant="outline" className="text-xs">
                                {format(parseISO(event.startDate), "h:mm a")}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {property?.name} • {employee?.name || t("calendar.unassigned")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link to="/calendar" className="w-full">
                  <Button variant="outline" className="w-full text-xs justify-between">
                    {t("dashboard.viewCalendar")}
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Recent Activity */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
                <CardDescription>{t("dashboard.latestUpdates")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0">
                      <div className="bg-muted rounded-full p-2">
                        <AlertTriangle size={12} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.quickAccess")}</CardTitle>
                <CardDescription>{t("dashboard.frequentlyUsed")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
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
                <Link to="/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {t("dashboard.viewCalendar")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}