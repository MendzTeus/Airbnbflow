// src/pages/maintenance/MaintenancePage.tsx
import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton
import { Plus, Building, FileEdit, AlertTriangle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/use-translation";
import { useData } from "@/hooks/use-data";
import { MaintenanceRequest, Property } from "@/types";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
  } from "@/components/ui/alert-dialog";


export default function MaintenancePage() {
  const { t } = useTranslation();
  const { maintenanceRequests, properties, getPropertyById, removeMaintenanceRequest } = useData();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Object.keys(maintenanceRequests).length > 0) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
          setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [maintenanceRequests]);


  // Filter requests based on active tab
  const filteredRequests = Object.values(maintenanceRequests).filter(request => {
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

  const handleDelete = async (id: string) => {
    await removeMaintenanceRequest(id);
  };

  const openRequestsCount = Object.values(maintenanceRequests).filter(r => r.status === "open").length;
  const inProgressRequestsCount = Object.values(maintenanceRequests).filter(r => r.status === "in-progress").length;
  const completedRequestsCount = Object.values(maintenanceRequests).filter(r => r.status === "completed").length;
  const highPriorityOpenRequests = Object.values(maintenanceRequests)
    .filter(r => r.status === "open" && r.priority === "high");

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
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-6">
                    <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-semibold">No maintenance requests found</h3>
                    <p className="text-muted-foreground">
                        {activeTab === "all" ? "Add a new maintenance request to get started" : "Try adjusting your filters or search terms"}
                    </p>
                </div>
            ) : (
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
              {filteredRequests.map((request) => (
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
                        {getPropertyById(request.propertyId)?.name || t("calendar.unknownProperty")}
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
                        <Link to={`/maintenance/${request.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the maintenance request.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(request.id)}>
                                        {t("common.delete")}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
            )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {openRequestsCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {inProgressRequestsCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedRequestsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {highPriorityOpenRequests.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <CardTitle className="text-red-500">High Priority Issues</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {highPriorityOpenRequests.map(request => (
                  <li key={request.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-muted-foreground mr-2" />
                      <span>
                        {getPropertyById(request.propertyId)?.name || t("calendar.unknownProperty")}: <strong>{request.title}</strong>
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