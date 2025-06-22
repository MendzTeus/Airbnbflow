
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardCheck, Plus, Search, Building, Calendar, CheckCircle, Edit, Trash2, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Checklist, Property, Employee } from "@/types";
import { cn } from "@/lib/utils";

// Mock checklist data
const MOCK_CHECKLISTS: Checklist[] = [
  {
    id: "1",
    title: "Pre-arrival Cleaning",
    propertyId: "1",
    assignedTo: "2",
    type: "checkin", // Added the type property
    items: [
      { id: "1", text: "Clean bathrooms", completed: true },
      { id: "2", text: "Change bed linens", completed: true },
      { id: "3", text: "Vacuum floors", completed: false },
      { id: "4", text: "Stock toiletries", completed: false }
    ],
    createdAt: "2023-05-15T00:00:00.000Z",
    updatedAt: "2023-05-15T00:00:00.000Z"
  },
  {
    id: "2",
    title: "Post-checkout Cleaning",
    propertyId: "2",
    assignedTo: "3",
    type: "checkout", // Added the type property
    items: [
      { id: "5", text: "Remove trash", completed: true },
      { id: "6", text: "Sanitize kitchen", completed: true },
      { id: "7", text: "Dust all surfaces", completed: true },
      { id: "8", text: "Check for damages", completed: true }
    ],
    createdAt: "2023-06-10T00:00:00.000Z",
    updatedAt: "2023-06-10T00:00:00.000Z",
    completedAt: "2023-06-10T12:00:00.000Z"
  },
  {
    id: "3",
    title: "Monthly Maintenance Check",
    propertyId: "3",
    assignedTo: "2",
    type: "maintenance", // Added the type property
    items: [
      { id: "9", text: "Check smoke detectors", completed: true },
      { id: "10", text: "Test all appliances", completed: false },
      { id: "11", text: "Inspect plumbing", completed: false },
      { id: "12", text: "Check HVAC system", completed: false }
    ],
    createdAt: "2023-07-05T00:00:00.000Z",
    updatedAt: "2023-07-05T00:00:00.000Z"
  }
];

// Mock properties data
const MOCK_PROPERTIES: Property[] = [
  {
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
  {
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
  },
  {
    id: "3",
    name: "Mountain Retreat",
    address: "789 Alpine Road",
    city: "Aspen",
    state: "CO",
    zipCode: "81611",
    bedrooms: 3,
    bathrooms: 2,
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
    description: "Cozy cabin with breathtaking mountain views",
    createdAt: "2023-03-05T00:00:00.000Z",
    updatedAt: "2023-03-05T00:00:00.000Z"
  }
];

// Mock employees data
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "John Manager",
    email: "manager@airbnbflow.com",
    phone: "555-123-4567",
    role: "manager",
    startDate: "2023-01-10T00:00:00.000Z",
    properties: ["1", "2"]
  },
  {
    id: "2",
    name: "Sarah Cleaner",
    email: "cleaner@airbnbflow.com",
    phone: "555-987-6543",
    role: "cleaner",
    startDate: "2023-02-15T00:00:00.000Z",
    properties: ["1", "3", "4"]
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@airbnbflow.com",
    phone: "555-555-1234",
    role: "cleaner",
    startDate: "2023-03-20T00:00:00.000Z",
    properties: ["2"]
  }
];

export default function ChecklistsPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  
  useEffect(() => {
    // Simulate API calls
    const timer = setTimeout(() => {
      setChecklists(MOCK_CHECKLISTS);
      
      // Create lookup objects for properties and employees
      const propertiesMap: Record<string, Property> = {};
      MOCK_PROPERTIES.forEach(property => {
        propertiesMap[property.id] = property;
      });
      setProperties(propertiesMap);
      
      const employeesMap: Record<string, Employee> = {};
      MOCK_EMPLOYEES.forEach(employee => {
        employeesMap[employee.id] = employee;
      });
      setEmployees(employeesMap);
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate completion percentage for a checklist
  const getCompletionPercentage = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    
    const completedItems = checklist.items.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };
  
  const filteredChecklists = checklists
    .filter(checklist => {
      // Apply status filter
      if (filter === "completed") return !!checklist.completedAt;
      if (filter === "pending") return !checklist.completedAt;
      return true;
    })
    .filter(checklist => {
      // Apply search filter
      const property = properties[checklist.propertyId];
      const employee = checklist.assignedTo ? employees[checklist.assignedTo] : null;
      
      const searchString = [
        checklist.title,
        property?.name,
        property?.address,
        property?.city,
        property?.state,
        employee?.name
      ].filter(Boolean).join(" ").toLowerCase();
      
      return searchString.includes(searchQuery.toLowerCase());
    });

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the checklist
    setChecklists(checklists.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground">
            Manage cleaning and maintenance checklists for your properties
          </p>
        </div>
        
        {hasPermission("create:checklist") && (
          <Button onClick={() => navigate("/checklists/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Checklist
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search checklists..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-[300px]" onValueChange={(v) => setFilter(v as "all" | "completed" | "pending")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[220px] animate-pulse">
              <div className="h-full bg-muted/50"></div>
            </Card>
          ))}
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="text-center py-10">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No checklists found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Add a checklist to get started"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredChecklists.map((checklist) => {
            const property = properties[checklist.propertyId];
            const employee = checklist.assignedTo ? employees[checklist.assignedTo] : null;
            const completionPercentage = getCompletionPercentage(checklist);
            const isCompleted = !!checklist.completedAt;
            
            return (
              <Card 
                key={checklist.id} 
                className={cn(
                  isCompleted && "bg-muted/30 border-muted"
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{checklist.title}</CardTitle>
                      {property && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Building className="mr-1 h-3.5 w-3.5" />
                          <span>{property.name}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={isCompleted ? "outline" : "default"}>
                      {isCompleted ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{completionPercentage}%</span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(checklist.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {employee && (
                        <div className="flex items-center justify-end">
                          <User className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate max-w-[100px]">
                            {employee.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm mb-2">Items:</h4>
                      <ul className="space-y-1">
                        {checklist.items.slice(0, 3).map(item => (
                          <li key={item.id} className="flex items-center text-sm">
                            <CheckCircle 
                              className={cn(
                                "mr-2 h-4 w-4",
                                item.completed ? "text-primary" : "text-muted-foreground/40"
                              )} 
                            />
                            <span className={item.completed ? "text-muted-foreground line-through" : ""}>
                              {item.text}
                            </span>
                          </li>
                        ))}
                        {checklist.items.length > 3 && (
                          <li className="text-sm text-muted-foreground pl-6">
                            +{checklist.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4">
                  <div className="flex justify-between w-full">
                    <Link to={`/checklists/${checklist.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    
                    {hasPermission("edit:checklist") && !isCompleted && (
                      <div className="flex gap-2">
                        <Link to={`/checklists/${checklist.id}/edit`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(checklist.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
