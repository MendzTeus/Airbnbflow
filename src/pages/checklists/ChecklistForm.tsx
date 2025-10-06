// src/pages/checklists/ChecklistForm.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/hooks/use-data";
import type { Checklist } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const checklistItemSchema = z.object({
  itemId: z.string().optional(),
  text: z
    .string({ required_error: "Checklist item text is required" })
    .min(1, { message: "Checklist item text is required" }),
  completed: z.boolean().optional(),
});

const checklistSchema = z.object({
  propertyId: z
    .string({ required_error: "Please select a property" })
    .min(1, { message: "Please select a property" }),
  items: z
    .array(checklistItemSchema)
    .min(1, { message: "Add at least one checklist item" }),
});

type ChecklistFormValues = z.infer<typeof checklistSchema>;

const generateItemId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);

const DEFAULT_CLEANING_TASKS = [
  "Dust and wipe all surfaces",
  "Vacuum or mop floors",
  "Clean mirrors and windows",
  "Refresh linens and towels",
  "Empty trash bins",
  "Sanitize kitchen counters",
  "Check appliances are off",
  "Restock toiletries",
];

export default function ChecklistForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    checklists,
    properties,
    getChecklistById,
    addChecklist,
    updateChecklist,
  } = useData();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(isEditMode);
  const [currentChecklist, setCurrentChecklist] = useState<Checklist | null>(
    null,
  );

  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      propertyId: "",
      items: [
        ...DEFAULT_CLEANING_TASKS.map((task) => ({
          itemId: generateItemId(),
          text: task,
          completed: false,
        })),
      ],
    },
  });

  const { control, reset, handleSubmit } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });
  const watchedItems = useWatch({ control, name: "items" });

  const completedCount = useMemo(
    () => watchedItems?.filter((item) => item?.completed).length ?? 0,
    [watchedItems],
  );
  const totalCount = watchedItems?.length ?? 0;
  const progressValue = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    if (!isEditMode || !id) {
      setIsLoadingChecklist(false);
      return;
    }

    const existing = getChecklistById(id);
    if (existing) {
      setCurrentChecklist(existing);
      reset({
        propertyId: existing.propertyId,
        items:
          existing.items.length > 0
            ? existing.items.map((item) => ({
                itemId: item.id,
                text: item.text,
                completed: Boolean(item.completed),
              }))
            : [
                {
                  itemId: generateItemId(),
                  text: "",
                  completed: false,
                },
              ],
      });
      setIsLoadingChecklist(false);
    } else if (Object.keys(checklists).length > 0) {
      toast({
        variant: "destructive",
        title: "Checklist not found",
        description: "The checklist you are trying to edit could not be found.",
      });
      navigate("/checklists");
    }
  }, [
    isEditMode,
    id,
    getChecklistById,
    reset,
    checklists,
    toast,
    navigate,
  ]);

  const onSubmit = async (values: ChecklistFormValues) => {
    setIsSubmitting(true);

    const preparedItems = values.items.map((item) => ({
      id: item.itemId && item.itemId.length > 0 ? item.itemId : generateItemId(),
      text: item.text,
      completed: Boolean(item.completed),
    }));

    const propertyName = properties[values.propertyId]?.name ?? "Property";
    const payload = {
      propertyId: values.propertyId,
      title: `${propertyName} – Cleaning Checklist (${format(new Date(), "PP")})`,
      type: "checkin" as Checklist["type"],
      assignedTo: user?.id,
      items: preparedItems,
    };

    try {
      if (isEditMode && id && currentChecklist) {
        await updateChecklist({ ...currentChecklist, ...payload });
        toast({
          title: "Checklist updated",
          description: "The checklist has been updated successfully.",
        });
      } else {
        await addChecklist(payload);
        toast({
          title: "Checklist created",
          description: "A new checklist has been created successfully.",
        });
      }

      navigate("/checklists");
    } catch (error) {
      console.error("Error saving checklist", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save the checklist. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyOptions = useMemo(() => Object.values(properties), [properties]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/checklists")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isEditMode ? t("common.edit") : t("checklists.newChecklist")}
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Update cleaning checklist" : "New cleaning checklist"}</CardTitle>
          <CardDescription>
            {"Select the property you are cleaning and mark each task as you finish."}
          </CardDescription>
        </CardHeader>

        {isLoadingChecklist ? (
          <CardContent className="flex items-center justify-center py-16">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("checklists.property")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              {"No properties available"}
                            </div>
                          ) : (
                            propertyOptions.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t("checklists.propertyDescription") ||
                          "Choose which property this checklist belongs to."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Cleaning tasks</h3>
                      <p className="text-sm text-muted-foreground">
                        Check each task as you finish it.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-medium">{completedCount}/{totalCount} done</span>
                      <Progress value={progressValue} className="h-2 w-40" />
                    </div>
                  </div>

                  {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {"Add at least one item to the checklist."}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="rounded-md border p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Task {index + 1}</span>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => remove(index)}
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <FormField
                            control={control}
                            name={`items.${index}.text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="sr-only">
                                  {t("checklists.itemText") || "Item text"}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={2}
                                    placeholder="Describe the task"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={control}
                            name={`items.${index}.completed`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(field.value)}
                                    onCheckedChange={(checked) =>
                                      field.onChange(checked === true)
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Mark as already complete
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        itemId: generateItemId(),
                        text: "",
                        completed: false,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add custom task
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/checklists")}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("common.loading")
                    : isEditMode
                    ? t("common.save")
                    : t("common.create")}
                </Button>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
}
