// src/pages/checklists/ChecklistsPage.tsx
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
import { useData } from "@/hooks/use-data"; // Importar useData
import { Checklist, Property, Employee } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

export default function ChecklistsPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { checklists, properties, employees, removeChecklist } = useData(); // Obter dados e funções do useData
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  
  useEffect(() => {
    // Definir loading como false quando os checklists forem carregados
    if (Object.keys(checklists).length > 0) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        if (Object.keys(checklists).length === 0) {
          setLoading(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [checklists]);
  
  // Converter objetos para arrays para filtragem
  const checklistsArray = Object.values(checklists);
  const propertiesMap = properties; // Já é um Record<string, Property>
  const employeesMap = employees;   // Já é um Record<string, Employee>

  // Calculate completion percentage for a checklist
  const getCompletionPercentage = (checklist: Checklist) => {
    if (checklist.items.length === 0) return 0;
    
    const completedItems = checklist.items.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };
  
  const filteredChecklists = checklistsArray
    .filter(checklist => {
      // Apply status filter
      if (filter === "completed") return !!checklist.completedAt;
      if (filter === "pending") return !checklist.completedAt;
      return true;
    })
    .filter(checklist => {
      // Apply search filter
      const property = propertiesMap[checklist.propertyId];
      const employee = checklist.assignedTo ? employeesMap[checklist.assignedTo] : null;
      
      const searchString = [
        checklist.title,
        property?.name,
        property?.address,
        property?.city,
        employee?.name
      ].filter(Boolean).join(" ").toLowerCase();
      
      return searchString.includes(searchQuery.toLowerCase());
    });

  const handleDelete = async (id: string) => {
    try {
      await removeChecklist(id);
    } catch (error) {
      console.error(error);
    }
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
          <Button
            onClick={() => navigate("/checklists/new")}
            className="self-start sm:self-auto flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Checklist</span>
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
              <Skeleton className="h-full w-full" />
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
            const property = propertiesMap[checklist.propertyId];
            const employee = checklist.assignedTo ? employeesMap[checklist.assignedTo] : null;
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
