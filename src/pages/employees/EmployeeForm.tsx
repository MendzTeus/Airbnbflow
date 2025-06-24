// src/pages/employees/EmployeeForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee, Property, UserRole } from "@/types";
import { AlertCircle, ArrowLeft, Building, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/hooks/use-data"; // Importar useData
import { useToast } from "@/hooks/use-toast"; // Importar useToast

// Removido MOCK_EMPLOYEES e MOCK_PROPERTIES

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { getEmployeeById, addEmployee, updateEmployee, properties: allProperties } = useData(); // Obter dados e funções do useData
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    role: "cleaner",
    startDate: new Date().toISOString().split("T")[0],
    properties: []
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (isEditing) {
      const employee = getEmployeeById(id);
      if (employee) {
        setFormData({
          ...employee,
          startDate: new Date(employee.startDate).toISOString().split("T")[0] // Formata a data para input type="date"
        });
      } else {
        setError("Employee not found");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Employee not found.",
        });
        navigate("/employees"); // Redirecionar se não encontrar
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [id, isEditing, getEmployeeById, navigate, toast]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as UserRole })); // Certifique-se de que o cast é seguro
  };
  
  const handlePropertyToggle = (propertyId: string) => {
    setFormData(prev => {
      const currentProperties = prev.properties || [];
      
      if (currentProperties.includes(propertyId)) {
        return { ...prev, properties: currentProperties.filter(id => id !== propertyId) };
      } else {
        return { ...prev, properties: [...currentProperties, propertyId] };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      if (!formData.name || !formData.email || !formData.phone || !formData.role || !formData.startDate) {
        throw new Error("Please fill in all required fields.");
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address.");
      }
      
      if (isEditing) {
        await updateEmployee(formData as Employee); // Cast para Employee completo
      } else {
        await addEmployee(formData); // Partial<Employee> é aceitável para adicionar
      }
      
      navigate("/employees");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to save employee: ${err.message}`,
        });
      } else {
        setError("An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while saving the employee.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/employees")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Employees
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit Employee" : "Add New Employee"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Update employee details and property assignments" 
            : "Add a new team member to your airbnbFlow team"
          }
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>
                Enter basic information about the employee
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="e.g. John Smith"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address*</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number*</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="e.g. 555-123-4567"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role*</Label>
                  <Select 
                    value={formData.role || ""} 
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Property Manager</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Assignments</CardTitle>
                <CardDescription>
                  Assign properties to this employee
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {Object.values(allProperties).length === 0 ? (
                    <p className="text-muted-foreground">No properties available</p>
                  ) : (
                    Object.values(allProperties).map(property => (
                      <div key={property.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`property-${property.id}`}
                          checked={(formData.properties || []).includes(property.id)}
                          onCheckedChange={() => handlePropertyToggle(property.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`property-${property.id}`}
                            className="font-medium"
                          >
                            {property.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {property.city}, {property.state}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      {isEditing ? "Update Employee" : "Create Employee"}
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/employees")}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}