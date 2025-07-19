// src/pages/access-codes/AccessCodesPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/hooks/use-data"; // Importar useData
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AccessCode, Property } from "@/types";
import { Plus, Search, Edit, Building } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton

// Removidos MOCK_ACCESS_CODES e MOCK_PROPERTIES

export default function AccessCodesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const { accessCodes, properties, removeAccessCode } = useData(); // Obter dados e funções do useData
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Get the property name by ID
  const getPropertyName = (propertyId: string): string => {
    const property = properties[propertyId]; // Usar properties do useData
    return property ? property.name : t("calendar.unknownProperty");
  };

  useEffect(() => {
    // Definir loading como false quando os access codes forem carregados
    if (Object.keys(accessCodes).length > 0) {
      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        if (Object.keys(accessCodes).length === 0) {
          setLoading(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [accessCodes]);

  const accessCodesArray = Object.values(accessCodes); // Converte o objeto em array

  // Filter access codes based on search term
  const filteredCodes = accessCodesArray.filter(code => {
    const propertyName = getPropertyName(code.propertyId);
    return (
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDelete = async (id: string) => {
    await removeAccessCode(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("accessCodes.title")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("accessCodes.title")} {t("common.for")} {t("common.properties")}
          </p>
        </div>
        {hasPermission("create:accessCodes") && (
          <Button asChild>
            <Link to="/access-codes/new">
              <Plus className="mr-2 h-4 w-4" /> {t("accessCodes.newCode")}
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("accessCodes.title")}</CardTitle>
          <CardDescription>
            {t("accessCodes.title")} {t("common.for")} {t("common.properties")}
          </CardDescription>
          <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
            <Input
              placeholder={`${t("common.search")}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-6">
              <Building className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-lg font-semibold">No access codes found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Add an access code to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("accessCodes.property")}</TableHead>
                  <TableHead>{t("accessCodes.codeName")}</TableHead>
                  <TableHead>{t("accessCodes.code")}</TableHead>
                  <TableHead>{t("accessCodes.expiryDate")}</TableHead>
                  {hasPermission("edit:accessCodes") && <TableHead className="w-[100px]">{t("common.actions")}</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {getPropertyName(code.propertyId)}
                    </TableCell>
                    <TableCell>{code.name}</TableCell>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>
                      {code.expiryDate 
                        ? format(new Date(code.expiryDate), "MMM dd, yyyy") 
                        : t("accessCodes.noExpiryDate")}
                    </TableCell>
                    {hasPermission("edit:accessCodes") && (
                      <TableCell>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/access-codes/${code.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(code.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}