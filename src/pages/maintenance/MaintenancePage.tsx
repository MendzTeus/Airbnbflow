
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Building, FileEdit, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/use-translation";
import { MaintenanceRequest, Property } from "@/types";

// Mock data for maintenance requests
const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: "1",
    title: "Leaking Bathroom Faucet",
    description: "The faucet in the master bathroom is leaking and needs repair.",
    propertyId: "1",
    assignedTo: "1",
    status: "open",
    priority: "medium",
    createdAt: new Date(2025, 4, 1).toISOString(),
    updatedAt: new Date(2025, 4, 1).toISOString(),
  },
  {
    id: "2",
    title: "A/C Not Working",
    description: "The air conditioning unit is not cooling properly.",
    propertyId: "2",
    status: "in-progress",
    priority: "high",
    createdAt: new Date(2025, 4, 2).toISOString(),
    updatedAt: new Date(2025, 4, 3).toISOString(),
  },
  {
    id: "3",
    title: "Replace Light Bulbs",
    description: "Several light bulbs in the living room need replacement.",
    propertyId: "1",
    assignedTo: "2",
    status: "completed",
    priority: "low",
    createdAt: new Date(2025, 4, 1).toISOString(),
    updatedAt: new Date(2025, 4, 4).toISOString(),
    completedAt: new Date(2025, 4, 4).toISOString(),
  },
];

// Mock data for properties
const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Luxury Downtown Apt",
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    region: "Downtown",
    zipCode: "94105",
    bedrooms: 2,
    bathrooms: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Beach House",
    address: "456 Ocean Dr",
    city: "Malibu",
    state: "CA",
    region: "Beach",
    zipCode: "90265",
    bedrooms: 3,
    bathrooms: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function MaintenancePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Get the property name by ID
  const getPropertyName = (propertyId: string): string => {
    const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
    return property ? property.name : "Unknown Property";
  };
  
  // Filter requests based on active tab
  const filteredRequests = MOCK_MAINTENANCE_REQUESTS.filter(request => {
    if (activeTab === "all") return true;
    if (activeTab === "open") return request.status === "open";
    if (activeTab === "in-progress") return request.status === "in-progress";
    if (activeTab === "completed") return request.status === "completed";
    return true;
  });
  
  // Get badge color based on priority
  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "high":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "";
    }
  };
  
  // Get badge color based on status
  const getStatusBadge = (status: "open" | "in-progress" | "completed") => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "in-progress":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("maintenance.title")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("maintenance.description")}
          </p>
        </div>
        <Button asChild>
          <Link to="/maintenance/new">
            <Plus className="mr-2 h-4 w-4" /> {t("maintenance.newRequest")}
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("maintenance.requests")}</CardTitle>
          <CardDescription>
            {t("maintenance.requestsDescription")}
          </CardDescription>
          <Tabs defaultValue="all" className="w-full mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">{t("maintenance.issue")}</TableHead>
                <TableHead>{t("maintenance.property")}</TableHead>
                <TableHead>{t("maintenance.status")}</TableHead>
                <TableHead>{t("maintenance.priority")}</TableHead>
                <TableHead>{t("maintenance.date")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No maintenance requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div className="font-medium">{request.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {request.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-muted-foreground mr-2" />
                        {getPropertyName(request.propertyId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(request.status)} variant="secondary">
                        {request.status === "in-progress" ? "In Progress" : 
                          request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityBadge(request.priority)} variant="secondary">
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon">
                        <Link to={`/maintenance/${request.id}`}>
                          <FileEdit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {MOCK_MAINTENANCE_REQUESTS.filter(r => r.status === "open").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {MOCK_MAINTENANCE_REQUESTS.filter(r => r.status === "in-progress").length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {MOCK_MAINTENANCE_REQUESTS.filter(r => r.status === "completed").length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {MOCK_MAINTENANCE_REQUESTS.filter(r => r.status === "open" && r.priority === "high").length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <CardTitle className="text-red-500">High Priority Issues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {MOCK_MAINTENANCE_REQUESTS
                .filter(r => r.status === "open" && r.priority === "high")
                .map(request => (
                  <li key={request.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>
                        {getPropertyName(request.propertyId)}: <strong>{request.title}</strong>
                      </span>
                    </div>
                    <Button asChild variant="outline" size="sm" className="ml-4">
                      <Link to={`/maintenance/${request.id}`}>
                        View
                      </Link>
                    </Button>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
