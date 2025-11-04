// src/pages/access-codes/AccessCodeForm.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useData } from "@/hooks/use-data"; // Importar useData
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Property } from "@/types";
import { ArrowLeft } from "lucide-react";

// Removido MOCK_PROPERTIES

// Access code form schema
const accessCodeSchema = z.object({
  propertyId: z.string({
    required_error: "Please select a property",
  }),
  name: z.string({
    required_error: "Please enter a name for this code",
  })
  .min(2, {
    message: "Name must be at least 2 characters",
  }),
  code: z.string({
    required_error: "Please enter an access code",
  })
  .min(4, {
    message: "Code must be at least 4 characters",
  }),
});

export default function AccessCodeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getAccessCodeById, addAccessCode, updateAccessCode, properties: allProperties } = useData(); // Obter dados e funções do useData
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!id;

  const form = useForm<z.infer<typeof accessCodeSchema>>({
    resolver: zodResolver(accessCodeSchema),
    defaultValues: {
      propertyId: "",
      name: "",
      code: "",
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const accessCode = getAccessCodeById(id);
      if (accessCode) {
        form.reset({
          propertyId: accessCode.propertyId,
          name: accessCode.name,
          code: accessCode.code,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Access code not found.",
        });
        navigate("/access-codes"); // Redirecionar se não encontrar
      }
    }
  }, [isEditMode, id, getAccessCodeById, form, navigate]);

  const onSubmit = async (values: z.infer<typeof accessCodeSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (isEditMode) {
        await updateAccessCode({ ...values, id: id } as AccessCode);
      } else {
        await addAccessCode(values);
      }

      navigate("/access-codes");
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/access-codes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? t("common.edit") : t("accessCodes.newCode")}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? t("common.edit") : t("accessCodes.newCode")}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? t("common.edit") + " " + t("accessCodes.title").toLowerCase()
              : t("common.create") + " " + t("accessCodes.title").toLowerCase()
            }
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accessCodes.property")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(allProperties).map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("accessCodes.property")} {t("common.for")} {t("accessCodes.title").toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accessCodes.codeName")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Front Door, Garage, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("common.name")} {t("common.for")} {t("accessCodes.title").toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("accessCodes.code")}</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("accessCodes.code")} {t("common.for")} {t("common.access")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate("/access-codes")}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? t("common.loading") 
                  : isEditMode 
                    ? t("common.save") 
                    : t("common.create")
                }
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
