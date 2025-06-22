
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
import { CalendarEvent, Property, Employee } from "@/types";

// Mock data for dashboard stats
const MOCK_STATS = {
  properties: 12,
  occupancy: 85,
  employees: 8,
  pendingChecklists: 5,
  completedChecklists: 18,
  maintenanceRequests: 3,
  accessCodes: 15,
  recentActivity: [
    { id: 1, message: "New maintenance request for Oceanview Apartment", time: "2 hours ago" },
    { id: 2, message: "Sarah completed checklist for Downtown Loft", time: "5 hours ago" },
    { id: 3, message: "New property added: Mountain Retreat", time: "1 day ago" },
    { id: 4, message: "Access code updated for Beachfront Villa", time: "2 days ago" }
  ]
};

// Mock calendar events
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Checkout Cleaning",
    propertyId: "1",
    assignedTo: "2",
    startDate: new Date().toISOString(), // Today
    endDate: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
    type: "cleaning",
    notes: "Deep clean after guests leave",
    createdAt: "2025-04-10T00:00:00.000Z",
    updatedAt: "2025-04-10T00:00:00.000Z"
  },
  {
    id: "2",
    title: "Maintenance Check",
    propertyId: "2",
    assignedTo: "3",
    startDate: new Date().toISOString(), // Today
    endDate: new Date(new Date().setHours(new Date().getHours() + 1)).toISOString(),
    type: "maintenance",
    notes: "Fix leaking faucet",
    createdAt: "2025-04-12T00:00:00.000Z",
    updatedAt: "2025-04-12T00:00:00.000Z"
  }
];

// Mock properties and employees for reference
const MOCK_PROPERTIES: Record<string, Property> = {
  "1": {
    id: "1",
    name: "Oceanview Apartment",
    address: "123 Coastal Highway",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    bedrooms: 2,
    bathrooms: 2,
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    description: "Beautiful oceanfront apartment with stunning views",
    createdAt: "2023-01-15T00:00:00.000Z",
    updatedAt: "2023-01-15T00:00:00.000Z"
  },
  "2": {
    id: "2",
    name: "Downtown Loft",
    address: "456 Main Street",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: "https://images.unsplash.com/photo-1560448075-32cafe5eb046",
    description: "Modern loft in the heart of downtown",
    createdAt: "2023-02-10T00:00:00.000Z",
    updatedAt: "2023-02-10T00:00:00.000Z"
  }
};

const MOCK_EMPLOYEES: Record<string, Employee> = {
  "2": {
    id: "2",
    name: "Sarah Cleaner",
    email: "cleaner@airbnbflow.com",
    phone: "555-987-6543",
    role: "cleaner",
    startDate: "2023-02-15T00:00:00.000Z",
    properties: ["1", "3", "4"]
  },
  "3": {
    id: "3",
    name: "Mike Johnson",
    email: "mike@airbnbflow.com",
    phone: "555-555-1234",
    role: "cleaner",
    startDate: "2023-03-20T00:00:00.000Z",
    properties: ["2"]
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { language } = useSettings();
  
  const [stats, setStats] = useState(MOCK_STATS);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Get today's events
      const today = new Date();
      const eventsToday = MOCK_EVENTS.filter(event => {
        const eventDate = parseISO(event.startDate);
        return isToday(eventDate);
      });
      
      setTodayEvents(eventsToday);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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

      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="w-full h-[180px] animate-pulse">
              <div className="h-full bg-muted/50"></div>
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
              value={stats.maintenanceRequests}
              icon={Wrench}
              description={`${stats.maintenanceRequests} ${t("dashboard.pendingRequests")}`}
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
                      const property = MOCK_PROPERTIES[event.propertyId];
                      const employee = MOCK_EMPLOYEES[event.assignedTo];
                      
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
                              {property?.name} • {employee?.name}
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
