
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Property } from "@/types";
import { AlertCircle, ArrowLeft, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwYXBhcnRtZW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
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
    imageUrl: "https://images.unsplash.com/photo-1560448075-32cafe5eb046?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8bG9mdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
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
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bW91bnRhaW4lMjBob21lfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
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
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjB2aWxsYXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    description: "Luxurious villa with direct beach access",
    createdAt: "2023-04-20T00:00:00.000Z",
    updatedAt: "2023-04-20T00:00:00.000Z"
  }
];

// List of US states for dropdown
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", 
  "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", 
  "VA", "WA", "WV", "WI", "WY"
];

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<Partial<Property>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: "",
    description: ""
  });
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (isEditing) {
      // Simulate API call to get property by ID
      const timer = setTimeout(() => {
        const property = MOCK_PROPERTIES.find(p => p.id === id);
        if (property) {
          setFormData(property);
        } else {
          setError("Property not found");
        }
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [id, isEditing]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      // Validate form
      if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
        throw new Error("Please fill in all required fields");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would send data to the server
      console.log("Submitting property:", formData);
      
      // Navigate back to properties list after success
      navigate("/properties");
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
          onClick={() => navigate("/properties")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">
          {isEditing ? "Edit Property" : "Add New Property"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Update the details of your property" 
            : "Fill in the details to add a new property"
          }
        </p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Property Details" : "Property Details"}</CardTitle>
            <CardDescription>
              Enter the basic information about the property
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
              <Label htmlFor="name">Property Name*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="e.g. Oceanview Apartment"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address*</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                placeholder="e.g. 123 Main Street"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City*</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  placeholder="e.g. Miami"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State*</Label>
                <Select 
                  value={formData.state || ""} 
                  onValueChange={(value) => handleSelectChange("state", value)}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code*</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode || ""}
                  onChange={handleChange}
                  placeholder="e.g. 33101"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms*</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms || 0}
                  onChange={handleNumberChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms*</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.bathrooms || 0}
                  onChange={handleNumberChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for the property image (optional)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Describe the property..."
                rows={4}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/properties")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Building className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Property" : "Create Property"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
