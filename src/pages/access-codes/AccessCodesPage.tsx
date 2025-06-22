
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { useAuth } from "@/contexts/AuthContext";
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

// Mock data for access codes
const MOCK_ACCESS_CODES: AccessCode[] = [
  {
    id: "1",
    propertyId: "1",
    code: "1234",
    name: "Front Door",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    propertyId: "1",
    code: "5678",
    name: "Garage",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    propertyId: "2",
    code: "9876",
    name: "Main Entrance",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock data for properties
const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Beach House",
    address: "123 Ocean Drive",
    city: "Miami",
    state: "FL",
    zipCode: "33139",
    bedrooms: 3,
    bathrooms: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Mountain Cabin",
    address: "45 Alpine Road",
    city: "Aspen",
    state: "CO",
    zipCode: "81611",
    bedrooms: 2,
    bathrooms: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function AccessCodesPage() {
  const { t } = useTranslation();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Get the property name by ID
  const getPropertyName = (propertyId: string): string => {
    const property = MOCK_PROPERTIES.find(p => p.id === propertyId);
    return property ? property.name : "Unknown Property";
  };

  // Filter access codes based on search term
  const filteredCodes = MOCK_ACCESS_CODES.filter(code => {
    const propertyName = getPropertyName(code.propertyId);
    return (
      code.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
              {filteredCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasPermission("edit:accessCodes") ? 5 : 4} className="text-center py-6">
                    No access codes found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCodes.map((code) => (
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
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
