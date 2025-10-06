// src/pages/properties/PropertyForm.tsx
import { useEffect, useRef, useState } from "react";
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
import { Property } from "@/types";
import { AlertCircle, ArrowLeft, Building, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useData } from "@/hooks/use-data"; // Importar useData
import { useToast } from "@/hooks/use-toast"; // Importar useToast

type ZipSuggestion = {
  id: string;
  label: string;
  postcode: string;
  city?: string;
  region?: string;
  country?: string;
};

type PostcodeApiResult = {
  postcode: string;
  admin_district?: string;
  parish?: string;
  post_town?: string;
  region?: string;
  admin_county?: string;
  country?: string;
};

export default function PropertyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { getPropertyById, addProperty, updateProperty } = useData(); // Obter funções do useData
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<Partial<Property>>({
    name: "",
    address: "",
    city: "",
    zipCode: "",
    bedrooms: 1,
    bathrooms: 1,
    imageUrl: "",
    description: ""
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [zipLookupError, setZipLookupError] = useState("");
  const [zipLookupMessage, setZipLookupMessage] = useState("");
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [zipSuggestions, setZipSuggestions] = useState<ZipSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const suggestionAbortRef = useRef<AbortController | null>(null);
  const suggestionTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (isEditing) {
      const property = getPropertyById(id);
      if (property) {
        setFormData(property);
        setImagePreview(property.imageUrl || "");
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

  useEffect(() => {
    const query = formData.zipCode?.trim();
    if (!query || query.length < 2) {
      setZipSuggestions([]);
      if (suggestionAbortRef.current) {
        suggestionAbortRef.current.abort();
      }
      if (suggestionTimeoutRef.current) {
        window.clearTimeout(suggestionTimeoutRef.current);
      }
      return;
    }

    if (suggestionTimeoutRef.current) {
      window.clearTimeout(suggestionTimeoutRef.current);
    }

    suggestionTimeoutRef.current = window.setTimeout(async () => {
      try {
        setIsFetchingSuggestions(true);
        setZipLookupError("");

        if (suggestionAbortRef.current) {
          suggestionAbortRef.current.abort();
        }
        const controller = new AbortController();
        suggestionAbortRef.current = controller;

        const response = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          setZipSuggestions([]);
          setIsFetchingSuggestions(false);
          return;
        }

        const payload = await response.json();
        const suggestions = Array.isArray(payload?.result)
          ? payload.result.slice(0, 8).map((item: PostcodeApiResult) => ({
              id: item.postcode,
              label: `${item.postcode}${item.admin_district ? ` • ${item.admin_district}` : ""}`,
              postcode: item.postcode,
              city: item.admin_district || item.parish || item.post_town,
              region: item.region || item.admin_county,
              country: item.country,
            }))
          : [];

        setZipSuggestions(suggestions);
      } catch (suggestionError) {
        if ((suggestionError as DOMException)?.name === "AbortError") {
          return;
        }
        setZipSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 400);

    return () => {
      if (suggestionTimeoutRef.current) {
        window.clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [formData.zipCode]);
  
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

  const applyZipSuggestion = (suggestion: { postcode: string; city?: string; region?: string; country?: string }) => {
    setFormData(prev => ({
      ...prev,
      zipCode: suggestion.postcode,
      city: suggestion.city || prev.city,
      region: suggestion.region || prev.region,
      address: prev.address || `${suggestion.postcode}${suggestion.city ? `, ${suggestion.city}` : ""}${suggestion.region ? `, ${suggestion.region}` : ""}${suggestion.country ? `, ${suggestion.country}` : ""}`,
    }));
    setZipSuggestions([]);
    setZipLookupMessage(suggestion.city || suggestion.region ? `Location selected: ${suggestion.postcode}` : "");
    setZipLookupError("");
    setIsLookingUpZip(false);
  };

  const lookupAddressByZip = async () => {
    const rawZip = formData.zipCode?.trim();
    if (!rawZip) {
      return;
    }

    setZipLookupError("");
    setZipLookupMessage("");
    setIsLookingUpZip(true);

    const sanitizedZip = rawZip.replace(/\s+/g, "");
    const candidateCountries = ["GB", "US", "CA", "BR", "AU"];

    for (const country of candidateCountries) {
      try {
        const response = await fetch(`https://api.zippopotam.us/${country}/${encodeURIComponent(sanitizedZip)}`);
        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const place = data?.places?.[0];
        if (!place) {
          continue;
        }

        setFormData(prev => ({
          ...prev,
          city: prev.city || place["place name"],
          address:
            prev.address ||
            `${place["place name"]}, ${place["state"] || place["state abbreviation"] || ""}, ${data?.country || data?.["country abbreviation"] || country}`
              .replace(/,\s*,/g, ", ")
              .replace(/,\s*$/, ""),
          region: prev.region || place["state"] || place["state abbreviation"] || undefined,
        }));

        setZipLookupMessage(`Location found: ${place["place name"]}${place["state"] ? ", " + place["state"] : ""}`);
        setIsLookingUpZip(false);
        return;
      } catch (zipErr) {
        // Tenta o próximo país, se disponível
        continue;
      }
    }

    setIsLookingUpZip(false);
    setZipLookupError("Unable to find address details for this postal code. Please fill the fields manually.");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFormData(prev => ({ ...prev, imageUrl: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      if (!formData.name || !formData.address || !formData.city || !formData.zipCode || formData.bedrooms === undefined || formData.bathrooms === undefined) {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="zipCode">ZIP Code*</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode || ""}
                  onChange={(event) => {
                    setZipLookupError("");
                    setZipLookupMessage("");
                    handleChange(event);
                  }}
                  onBlur={() => {
                    if (formData.zipCode) {
                      void lookupAddressByZip();
                    }
                  }}
                  placeholder="e.g. 33101"
                  required
                />
                {isFetchingSuggestions && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Searching postal codes…
                  </p>
                )}
                {!isFetchingSuggestions && zipSuggestions.length > 0 && (
                  <div className="mt-2 space-y-1 rounded-md border border-border bg-muted/40 p-2">
                    {zipSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className="w-full text-left text-xs rounded-sm px-2 py-1 hover:bg-muted transition-colors"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          applyZipSuggestion(suggestion);
                        }}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                )}
                {isLookingUpZip && (
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Looking up address information…
                  </p>
                )}
                {!isLookingUpZip && zipLookupMessage && (
                  <p className="text-xs text-muted-foreground">{zipLookupMessage}</p>
                )}
                {!isLookingUpZip && zipLookupError && (
                  <p className="text-xs text-destructive">{zipLookupError}</p>
                )}
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
                  value={formData.bedrooms ?? 0}
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
                  value={formData.bathrooms ?? 0}
                  onChange={handleNumberChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUpload">Property Image</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  {imagePreview && (
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image from your device (optional)
                </p>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Property preview"
                    className="h-40 w-full rounded-md object-cover"
                  />
                </div>
              )}
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
