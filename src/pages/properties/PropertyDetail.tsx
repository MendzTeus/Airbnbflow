// src/pages/properties/PropertyDetail.tsx
import { useState, useMemo } from "react"; // Adicionado useMemo
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  ChevronLeft,
  Building,
  Bed,
  Bath,
  MapPin,
  Home,
  Calendar,
  Key,
  ClipboardList,
  Wrench,
  Plus,
  Edit,
  Trash
} from "lucide-react";
import { format, parseISO } from "date-fns";
// Removida importação de useProperties, pois getPropertyById e removeProperty virão de useData
// import { useProperties } from "@/hooks/use-properties";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/hooks/use-data"; // Importar useData
import { Property, CalendarEvent, AccessCode, MaintenanceRequest, Checklist } from "@/types"; // Mantido tipos

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Obter getPropertyById e removeProperty diretamente do useData
  // Além disso, obter todos os dados relacionados para filtrar localmente
  const {
    properties,
    events,
    accessCodes,
    maintenanceRequests,
    checklists,
    getPropertyById,
    removeProperty
  } = useData();

  const [activeTab, setActiveTab] = useState("overview");

  // Load property data from context
  const property = useMemo(() => {
    return id ? getPropertyById(id) : null;
  }, [id, properties, getPropertyById]); // Depende de 'properties' para re-renderizar se a lista de propriedades mudar

  // Filtrar dados relacionados à propriedade atual
  const filteredEvents = useMemo(() => {
    return Object.values(events).filter(event => event.propertyId === id);
  }, [id, events]);

  const filteredAccessCodes = useMemo(() => {
    return Object.values(accessCodes).filter(code => code.propertyId === id);
  }, [id, accessCodes]);

  const filteredMaintenanceRequests = useMemo(() => {
    return Object.values(maintenanceRequests).filter(request => request.propertyId === id);
  }, [id, maintenanceRequests]);

  const filteredChecklists = useMemo(() => {
    return Object.values(checklists).filter(checklist => checklist.propertyId === id);
  }, [id, checklists]);


  // Handle property deletion
  const handleDeleteProperty = async () => { // Tornar a função async
    if (!id) return;

    try {
      await removeProperty(id); // Chamar a função removeProperty do useData
      toast({
        title: "Property Deleted",
        description: "The property has been deleted successfully.",
      });
      navigate("/properties");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete the property. Please try again.",
      });
    }
  };

  // Carregamento: a página está carregando se a propriedade ainda não foi encontrada e os dados do contexto ainda não estão populados
  const isLoading = Object.keys(properties).length === 0 && !property;

  if (isLoading) {
    // Pode usar um Skeleton aqui ou um spinner global se preferir
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Property Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-4">
            <Link to="/properties">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Properties
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link to="/properties">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{property.name}</h2>
            <p className="text-muted-foreground mt-1 flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {property.address}, {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to={`/properties/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the property
                  and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProperty}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="access-codes">Access Codes</TabsTrigger>
          <TabsTrigger value="checklists">Checklists</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <div className="text-sm text-muted-foreground">Bedrooms</div>
                        <div className="font-medium">{property.bedrooms}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <div className="text-sm text-muted-foreground">Bathrooms</div>
                        <div className="font-medium">{property.bathrooms}</div>
                      </div>
                    </div>
                  </div>

                  {property.region && (
                    <div className="flex items-center">
                      <Home className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <div className="text-sm text-muted-foreground">Region</div>
                        <div className="font-medium">{property.region}</div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Full Address</div>
                    <div className="font-medium">
                      {property.address}<br />
                      {property.city}, {property.state} {property.zipCode}
                    </div>
                  </div>

                  {property.description && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Description</div>
                      <div>{property.description}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No upcoming events</p>
                ) : (
                  <div className="space-y-4">
                    {filteredEvents.map((event) => (
                      <div key={event.id} className="flex items-start">
                        <div className="mr-4 p-2 border rounded-md">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(parseISO(event.startDate), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`mt-1 ${event.type === 'cleaning' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}
                          >
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/calendar/new?propertyId=${id}`}>
                        <Plus className="mr-2 h-4 w-4" /> Add Event
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {property.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Property Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={property.imageUrl}
                  alt={property.name}
                  className="w-full h-auto rounded-md object-cover"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Calendar Events</CardTitle>
                <CardDescription>Scheduled events for this property</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/calendar/new?propertyId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {filteredEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  No events scheduled for this property
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={event.type === 'cleaning' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}
                          >
                            {event.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(event.startDate), "MMM d, yyyy 'at' h:mm a")}
                        </TableCell>
                        <TableCell>{event.assignedTo || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            {/* Link para o formulário de edição de evento, passando o ID do evento */}
                            <Link to={`/calendar/${event.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Codes Tab */}
        <TabsContent value="access-codes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Access Codes</CardTitle>
                <CardDescription>Door codes and access information</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/access-codes/new?propertyId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Code
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {filteredAccessCodes.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  No access codes for this property
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccessCodes.map(code => (
                      <TableRow key={code.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                            {code.name}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{code.code}</TableCell>
                        <TableCell>
                          {code.expiryDate
                            ? format(parseISO(code.expiryDate), "MMM d, yyyy")
                            : "No expiry date"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/access-codes/${code.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Checklists</CardTitle>
                <CardDescription>Cleaning and maintenance checklists</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/checklists/new?propertyId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" /> Add Checklist
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {filteredChecklists.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  No checklists for this property
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Checklist</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChecklists.map(checklist => {
                      const completedItems = checklist.items.filter(item => item.completed).length;
                      const totalItems = checklist.items.length;
                      const isComplete = checklist.completedAt || (totalItems > 0 && completedItems === totalItems);

                      return (
                        <TableRow key={checklist.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <ClipboardList className="h-4 w-4 mr-2 text-muted-foreground" />
                              {checklist.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {checklist.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                            >
                              {isComplete ? 'Complete' : 'In Progress'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {completedItems} of {totalItems} items
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to={`/checklists/${checklist.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Repair and maintenance issues</CardDescription>
              </div>
              <Button asChild>
                <Link to={`/maintenance/new?propertyId=${id}`}>
                  <Plus className="mr-2 h-4 w-4" /> Report Issue
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {filteredMaintenanceRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">
                  No maintenance requests for this property
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Issue</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Reported</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaintenanceRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                            {request.title}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {request.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              request.priority === 'high' ? 'bg-red-100 text-red-800' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              request.status === 'open' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(parseISO(request.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/maintenance/${request.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}