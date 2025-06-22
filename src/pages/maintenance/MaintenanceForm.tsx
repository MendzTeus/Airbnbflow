import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Property, Employee } from "@/types";
import { ArrowLeft } from "lucide-react";

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

// Mock data for employees
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "1",
    name: "John Manager",
    email: "manager@airbnbflow.com",
    phone: "555-123-4567",
    role: "manager",
    startDate: new Date().toISOString(),
    properties: ["1", "2"],
  },
  {
    id: "2",
    name: "Sarah Cleaner",
    email: "cleaner@airbnbflow.com",
    phone: "555-987-6543",
    role: "cleaner",
    startDate: new Date().toISOString(),
    properties: ["1"],
  },
];

// Maintenance request form schema
const maintenanceSchema = z.object({
  propertyId: z.string({
    required_error: "Please select a property",
  }),
  title: z.string({
    required_error: "Please enter a title for this request",
  })
  .min(3, {
    message: "Title must be at least 3 characters",
  }),
  description: z.string({
    required_error: "Please provide a description",
  })
  .min(10, {
    message: "Description must be at least 10 characters",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority level",
  }),
  status: z.enum(["open", "in-progress", "completed"], {
    required_error: "Please select a status",
  }),
  assignedTo: z.string().optional(),
});

export default function MaintenanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!id;

  // Simulated fetch of maintenance request for edit mode
  const [maintenanceRequest, setMaintenanceRequest] = useState<{
    id: string;
    propertyId: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in-progress" | "completed";
    assignedTo?: string;
  } | null>(null);

  useEffect(() => {
    if (isEditMode) {
      // In a real app, this would be an API call to fetch the maintenance request
      // For now, simulate a delay
      const timer = setTimeout(() => {
        setMaintenanceRequest({
          id: "1",
          propertyId: "1",
          title: "Leaking Faucet",
          description: "The bathroom faucet is leaking constantly.",
          priority: "medium",
          status: "open",
          assignedTo: undefined,
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isEditMode, id]);

  const form = useForm<z.infer<typeof maintenanceSchema>>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      propertyId: "",
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      assignedTo: undefined,
    },
  });

  // Update form when maintenance request is loaded
  useEffect(() => {
    if (maintenanceRequest) {
      form.reset({
        propertyId: maintenanceRequest.propertyId,
        title: maintenanceRequest.title,
        description: maintenanceRequest.description,
        priority: maintenanceRequest.priority,
        status: maintenanceRequest.status,
        assignedTo: maintenanceRequest.assignedTo,
      });
    }
  }, [maintenanceRequest, form]);

  const onSubmit = async (values: z.infer<typeof maintenanceSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would be an actual API call to create/update the maintenance request
    toast({
      title: isEditMode 
        ? "Maintenance request updated" 
        : "Maintenance request created",
      description: isEditMode 
        ? "The maintenance request has been updated successfully." 
        : "A new maintenance request has been created.",
    });
    
    setIsSubmitting(false);
    navigate("/maintenance");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/maintenance")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? t("common.edit") : t("maintenance.newRequest")}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? t("common.edit") : t("maintenance.newRequest")}
          </CardTitle>
          <CardDescription>
            {isEditMode 
              ? t("common.edit") + " " + t("maintenance.title").toLowerCase()
              : t("common.create") + " " + t("maintenance.title").toLowerCase()
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
                        {MOCK_PROPERTIES.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("accessCodes.property")} {t("common.for")} {t("maintenance.title").toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("maintenance.requestTitle")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Leaking faucet, broken window, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.description")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide details about the maintenance issue..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.priority")}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">{t("maintenance.priority.low")}</SelectItem>
                          <SelectItem value="medium">{t("maintenance.priority.medium")}</SelectItem>
                          <SelectItem value="high">{t("maintenance.priority.high")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.status")}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">{t("maintenance.status.open")}</SelectItem>
                          <SelectItem value="in-progress">{t("maintenance.status.inProgress")}</SelectItem>
                          <SelectItem value="completed">{t("maintenance.status.completed")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("maintenance.assignedTo")}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || ""}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to employee (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {MOCK_EMPLOYEES.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("maintenance.assignedTo")} {t("common.for")} {t("maintenance.title").toLowerCase()}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate("/maintenance")}
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
