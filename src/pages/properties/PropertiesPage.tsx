
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building, Plus, Search, MapPin, Bed, Bath, Info, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/types";

// Mock property data
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

export default function PropertiesPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProperties(MOCK_PROPERTIES);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    // In a real app, this would call an API to delete the property
    setProperties(properties.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your properties
          </p>
        </div>
        
        {hasPermission("create:property") && (
          <Button onClick={() => navigate("/properties/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
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
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden h-[280px] animate-pulse">
              <div className="h-full bg-muted/50"></div>
            </Card>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-10">
          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No properties found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Add a property to get started"}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden h-full flex flex-col">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2V8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"}
                  alt={property.name}
                  className="h-full w-full object-cover transition-all hover:scale-105"
                />
              </div>
              
              <CardContent className="flex-1 p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg truncate">{property.name}</h3>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    <span className="truncate">
                      {property.city}, {property.state}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center">
                      <Bed className="mr-1 h-4 w-4" />
                      <span>{property.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="mr-1 h-4 w-4" />
                      <span>{property.bathrooms} Baths</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Link to={`/properties/${property.id}`}>
                  <Button variant="outline" size="sm">
                    <Info className="mr-2 h-4 w-4" /> Details
                  </Button>
                </Link>
                
                {hasPermission("edit:property") && (
                  <div className="flex gap-2">
                    <Link to={`/properties/${property.id}/edit`}>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 sm:h-auto sm:w-48 overflow-hidden">
                  <img
                    src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2V8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"}
                    alt={property.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="flex flex-1 flex-col p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <Badge variant="outline">{`${property.bedrooms} bed / ${property.bathrooms} bath`}</Badge>
                    </div>
                    
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                    </div>
                    
                    {property.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col gap-2 p-4 justify-end items-end">
                  <Link to={`/properties/${property.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Info className="mr-2 h-4 w-4" /> Details
                    </Button>
                  </Link>
                  
                  {hasPermission("edit:property") && (
                    <>
                      <Link to={`/properties/${property.id}/edit`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-destructive hover:text-destructive"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
