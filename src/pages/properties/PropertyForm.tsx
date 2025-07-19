// src/pages/properties/PropertyForm.tsx
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
import { useData } from "@/hooks/use-data"; // Importar useData
import { useToast } from "@/hooks/use-toast"; // Importar useToast

// Removido MOCK_PROPERTIES
// Local STATES_BY_COUNTRY constant; consider moving to a constants file.
// The user's country is detected from the browser locale and the
// appropriate list of states/regions is used.

const STATES_BY_COUNTRY: Record<string, string[]> = {
  US: [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT",
    "VA", "WA", "WV", "WI", "WY"
  ],
  BR: [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ],
  GB: ["England", "Scotland", "Wales", "Northern Ireland"]
};

const getUserCountryCode = (): string => {
  const locale = navigator.language || "";
  const parts = locale.split("-");
  if (parts.length > 1) {
    return parts[1].toUpperCase();
  }
  return "US";
};

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { getPropertyById, addProperty, updateProperty } = useData(); // Obter funções do useData
  const { toast } = useToast();

  const [countryCode] = useState<string>(getUserCountryCode());
  const availableStates = STATES_BY_COUNTRY[countryCode] || STATES_BY_COUNTRY.US;

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
      const property = getPropertyById(id);
      if (property) {
        setFormData(property);
      } else {
        setError("Property not found");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Property not found.",
        });
        navigate("/properties"); // Redirecionar se não encontrar
      }
      setLoading(false);
    } else {
      setLoading(false); // Não está em modo de edição, então não está carregando
    }
  }, [id, isEditing, getPropertyById, navigate, toast]);
  
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
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 })); // Use parseFloat para banheiros
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode || formData.bedrooms === undefined || formData.bathrooms === undefined) {
        throw new Error("Please fill in all required fields and ensure bedrooms/bathrooms are numbers.");
      }
      
      if (isEditing) {
        await updateProperty(formData as Property); // 'formData' deve ser um tipo 'Property' completo para update
      } else {
        await addProperty(formData); // 'formData' pode ser Partial<Property> para add
      }
      
      navigate("/properties");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to save property: ${err.message}`,
        });
      } else {
        setError("An unexpected error occurred");
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while saving the property.",
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
                    {availableStates.map(state => (
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