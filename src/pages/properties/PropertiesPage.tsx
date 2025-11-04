// src/pages/properties/PropertiesPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building, Plus, Search, MapPin, Info, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/hooks/use-data"; // Importar useData
import { Property } from "@/types";
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

export default function PropertiesPage() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const { properties, removeProperty } = useData();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    // Definir loading como false quando as propriedades forem carregadas
    if (Object.keys(properties).length > 0) {
      setLoading(false);
    } else {
      // Se não houver propriedades, ainda pode estar carregando ou estar vazio.
      // Pode-se adicionar um timeout para evitar loading infinito se a requisição falhar.
      const timer = setTimeout(() => {
        if (Object.keys(properties).length === 0) {
          setLoading(false); // Assume que não há propriedades a serem carregadas
        }
      }, 1500); // Dar um tempo para o fetch inicial
      return () => clearTimeout(timer);
    }
  }, [properties]);

  const propertiesArray = Object.values(properties); // Converte o objeto de propriedades em um array

  const filteredProperties = propertiesArray.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      await removeProperty(id);
    } catch (error) {
      console.error(error);
    }
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
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden h-[280px]">
              <Skeleton className="h-full w-full" />
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
                      {property.city}
                    </span>
                  </div>
                  
                  {property.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.description}
                    </p>
                  )}
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
                    <h3 className="font-semibold text-lg">{property.name}</h3>
                    
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="mr-1 h-3.5 w-3.5" />
                      <span>{property.address}, {property.city} {property.zipCode}</span>
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
