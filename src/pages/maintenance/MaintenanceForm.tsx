// src/pages/maintenance/MaintenanceForm.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "@/hooks/use-translation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import type { MaintenanceRequest } from "@/types";
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
import { ArrowLeft } from "lucide-react";
import { useData } from "@/hooks/use-data";


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
  const { properties, employees, getMaintenanceRequestById, addMaintenanceRequest, updateMaintenanceRequest } = useData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!id;
  const location = useLocation();

  const allProperties = Object.values(properties);
  const allEmployees = Object.values(employees);
  const UNASSIGNED_OPTION = "__unassigned__";

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
    if (isEditMode && id) {
      const maintenanceRequest = getMaintenanceRequestById(id);
      if (maintenanceRequest) {
        form.reset({
          propertyId: maintenanceRequest.propertyId,
          title: maintenanceRequest.title,
          description: maintenanceRequest.description,
          priority: maintenanceRequest.priority,
          status: maintenanceRequest.status,
          assignedTo: maintenanceRequest.assignedTo ?? undefined,
        });
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Maintenance request not found.",
        });
        navigate("/maintenance"); // Redirecionar se não encontrar
      }
    } else {
        // Pre-fill propertyId if passed in URL
        const queryParams = new URLSearchParams(location.search);
        const propertyIdFromUrl = queryParams.get("propertyId");
        if (propertyIdFromUrl) {
            form.setValue("propertyId", propertyIdFromUrl);
        }
    }
  }, [isEditMode, id, getMaintenanceRequestById, form, navigate, location.search, toast]);


  const onSubmit = async (values: z.infer<typeof maintenanceSchema>) => {
    setIsSubmitting(true);

    try {
      const maintenanceData = {
        propertyId: values.propertyId,
        title: values.title,
        description: values.description,
        priority: values.priority,
        status: values.status,
        assignedTo: values.assignedTo === "" ? undefined : values.assignedTo,
        // id, createdAt, updatedAt, completedAt serão gerenciados pelo DataContext
      };

      if (isEditMode && id) {
        await updateMaintenanceRequest({ ...maintenanceData as MaintenanceRequest, id: id });
      } else {
        await addMaintenanceRequest(maintenanceData);
      }

      toast({
        title: isEditMode
          ? "Maintenance request updated"
          : "Maintenance request created",
        description: isEditMode
          ? "The maintenance request has been updated successfully."
          : "A new maintenance request has been created.",
      });

      navigate("/maintenance");
    } catch (err) {
      console.error("Error saving maintenance request:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save maintenance request. ${(err instanceof Error ? err.message : '')}`,
      });
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allProperties.map((property) => (
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
                      onValueChange={(value) =>
                        field.onChange(value === UNASSIGNED_OPTION ? undefined : value)
                      }
                      value={field.value ?? UNASSIGNED_OPTION}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to employee (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UNASSIGNED_OPTION}>Unassigned</SelectItem>
                        {allEmployees.map((employee) => (
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
