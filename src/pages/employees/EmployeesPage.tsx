// src/pages/employees/EmployeesPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Plus, Search, Mail, Phone, Calendar, Edit, Trash2, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/hooks/use-data"; // Importar useData
import { Employee } from "@/types";
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

export default function EmployeesPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { employees, removeEmployee } = useData(); // Obter dados do useData
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  
  useEffect(() => {
    // Definir loading como false quando os funcionários forem carregados
    if (Object.keys(employees).length > 0) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        if (Object.keys(employees).length === 0) {
          setLoading(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [employees]);
  
  const employeesArray = Object.values(employees); // Converte o objeto de employees em um array

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredEmployees = employeesArray.filter((employee) => {
    if (!normalizedSearch) return true;

    const name = employee.name?.toLowerCase() ?? "";
    const email = employee.email?.toLowerCase() ?? "";
    const role = employee.role?.toLowerCase?.() ?? "";

    return (
      name.includes(normalizedSearch) ||
      email.includes(normalizedSearch) ||
      role.includes(normalizedSearch)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      await removeEmployee(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage your team members and their assignments
          </p>
        </div>
        
        {hasPermission("create:employee") && (
          <Button
            onClick={() => navigate("/employees/new")}
            className="self-start sm:self-auto flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Employee</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="grid" className="w-[200px]" onValueChange={(v) => setView(v as "grid" | "list")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden h-[180px] animate-pulse">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No employees found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Add an employee to get started"}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const displayName =
              employee.name?.trim() ||
              employee.email?.split("@")[0] ||
              "Unnamed";
            const initials = displayName
              .split(/\s+/)
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const roleLabel =
              employee.role === "manager"
                ? "Property Manager"
                : employee.role === "cleaner"
                ? "Cleaner"
                : "—";
            const propertyCount = Array.isArray(employee.properties)
              ? employee.properties.length
              : 0;
            const startDateLabel = employee.startDate
              ? new Date(employee.startDate).toLocaleDateString()
              : "—";

            return (
              <Card key={employee.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-semibold text-primary">
                        {initials || "?"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mt-2">{displayName}</h3>
                    <Badge variant="outline" className="mt-1">
                      {roleLabel}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{employee.email || "—"}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{employee.phone || "—"}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Started {startDateLabel}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Assigned to {propertyCount} properties</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/employees/${employee.id}`}>View Details</Link>
                    </Button>

                    {hasPermission("edit:employee") && (
                      <div className="flex gap-2">
                        <Button
                          asChild
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Link to={`/employees/${employee.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmployees.map((employee) => {
            const displayName =
              employee.name?.trim() ||
              employee.email?.split("@")[0] ||
              "Unnamed";
            const initials = displayName
              .split(/\s+/)
              .filter(Boolean)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const roleLabel =
              employee.role === "manager"
                ? "Property Manager"
                : employee.role === "cleaner"
                ? "Cleaner"
                : "—";
            const propertyCount = Array.isArray(employee.properties)
              ? employee.properties.length
              : 0;

            return (
              <Card key={employee.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xl font-semibold text-primary">
                        {initials || "?"}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{displayName}</h3>
                          <Badge variant="outline">
                            {roleLabel}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/employees/${employee.id}`}>
                              View Details
                            </Link>
                          </Button>
                          
                          {hasPermission("edit:employee") && (
                            <>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/employees/${employee.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(employee.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.email || "—"}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.phone || "—"}</span>
                        </div>
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Assigned to {propertyCount} properties</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
