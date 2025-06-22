
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
  },
  {
    id: "4",
    name: "Beachfront Villa",
    address: "101 Ocean Drive",
    city: "San Diego",
    state: "CA",
    zipCode: "92109",
    bedrooms: 4,
    bathrooms: 3,
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1",
    description: "Luxurious villa with direct beach access",
    createdAt: "2023-04-20T00:00:00.000Z",
    updatedAt: "2023-04-20T00:00:00.000Z"
  }
];

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    role: "cleaner",
    startDate: new Date().toISOString().split("T")[0],
    properties: []
  });
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    // Simulate API call to get properties
    const timer = setTimeout(() => {
      setProperties(MOCK_PROPERTIES);
      
      if (isEditing) {
        const employee = MOCK_EMPLOYEES.find(e => e.id === id);
        if (employee) {
          setFormData({
            ...employee,
            startDate: new Date(employee.startDate).toISOString().split("T")[0]
          });
        } else {
          setError("Employee not found");
        }
      }
      
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id, isEditing]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePropertyToggle = (propertyId: string) => {
    setFormData(prev => {
      const properties = prev.properties || [];
      
      if (properties.includes(propertyId)) {
        return { ...prev, properties: properties.filter(id => id !== propertyId) };
      } else {
        return { ...prev, properties: [...properties, propertyId] };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.role) {
        throw new Error("Please fill in all required fields");
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would send data to the server
      console.log("Submitting employee:", formData);
      
      // Navigate back to employees list after success
      navigate("/employees");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
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
                    value={formData.role as string} 
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
                  {properties.length === 0 ? (
                    <p className="text-muted-foreground">No properties available</p>
                  ) : (
                    properties.map(property => (
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
