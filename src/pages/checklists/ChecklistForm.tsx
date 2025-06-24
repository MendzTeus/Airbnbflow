// src/pages/checklists/ChecklistForm.tsx
import { useState, useEffect, useMemo } from "react"; // Adicionado useMemo
import { useNavigate, useParams, useLocation } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
// Removidas as importações diretas de useProperties e useEmployees, pois os dados vêm de useData
// import { useProperties } from "@/hooks/use-properties";
// import { useEmployees } from "@/hooks/use-employees";
import { useData } from "@/hooks/use-data"; // Importar useData
import { Checklist, ChecklistItem, COMMON_CHECKLIST_ITEMS } from "@/types";
import { v4 as uuidv4 } from "uuid"; // Para gerar UUID se o DB não gerar

// Removidos os mock data de Checklist, Properties, Employees.

// Form validation schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  propertyId: z.string({
    required_error: "Please select a property.",
  }),
  assignedTo: z.string().optional(),
  type: z.enum(["checkin", "checkout", "maintenance"], {
    required_error: "Please select a checklist type.",
  }),
});

// Template options for standard checklists (mantido, pois é uma lógica do frontend)
const checklistTemplates = [
  {
    id: "checkin-standard",
    name: "Standard Check-in",
    items: [
      { id: "ci1", text: "Verify all lights are working", completed: false },
      { id: "ci2", text: "Check heating/cooling systems", completed: false },
      { id: "ci3", text: "Ensure kitchen appliances are clean and working", completed: false },
      { id: "ci4", text: "Check water pressure in all bathrooms", completed: false },
      { id: "ci5", text: "Verify WiFi is working", completed: false },
      { id: "ci6", text: "Ensure door locks function properly", completed: false },
    ]
  },
  {
    id: "checkout-standard",
    name: "Standard Check-out",
    items: [
      { id: "co1", text: "Clean all rooms thoroughly", completed: false },
      { id: "co2", text: "Sanitize bathrooms", completed: false },
      { id: "co3", text: "Wash all linens and towels", completed: false },
      { id: "co4", text: "Ensure no personal items left behind", completed: false },
      { id: "co5", text: "Take out all trash", completed: false },
      { id: "co6", text: "Check for any damages", completed: false },
      { id: "co7", text: "Lock all doors and windows", completed: false },
    ]
  },
  {
    id: "maintenance-standard",
    name: "Standard Maintenance",
    items: [
      { id: "mt1", text: "Check for plumbing issues", completed: false },
      { id: "mt2", text: "Inspect HVAC system", completed: false },
      { id: "mt3", text: "Test all electrical outlets", completed: false },
      { id: "mt4", text: "Check smoke and CO detectors", completed: false },
      { id: "mt5", text: "Inspect roof and gutters", completed: false },
      { id: "mt6", text: "Check for pest issues", completed: false },
      { id: "mt7", text: "Test appliances", completed: false },
      { id: "mt8", text: "Inspect windows and doors", completed: false },
    ]
  }
];

export default function ChecklistForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // ID do checklist, se estiver em modo de edição

  // Obter dados e funções de manipulação do useData
  const {
    properties,
    employees,
    checklists,
    getChecklistById,
    updateChecklist,
    addChecklist
  } = useData();

  // Converter objetos de dados para arrays
  const allProperties = useMemo(() => Object.values(properties), [properties]);
  const allEmployees = useMemo(() => Object.values(employees), [employees]);

  // Carregar o checklist existente em modo de edição
  const existingChecklist = useMemo(() => {
    return id ? getChecklistById(id) : null;
  }, [id, checklists, getChecklistById]); // Depende de 'checklists' do contexto

  // Form state
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [newItemText, setNewItemText] = useState("");
  // Removido selectedRegion, pois não é usado diretamente neste formulário
  // const [selectedRegion, setSelectedRegion] = useState<string>("all");

  // Inicializar formulário com react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      propertyId: "",
      assignedTo: "", // Certifique-se de que o valor padrão para optional seja compatível com Select (string vazia)
      type: "checkout",
    },
    values: useMemo(() => { // Usar useMemo para evitar re-renderizações desnecessárias do formulário
      if (id && existingChecklist) {
        return {
          title: existingChecklist.title,
          propertyId: existingChecklist.propertyId,
          assignedTo: existingChecklist.assignedTo || "",
          type: existingChecklist.type,
        };
      }
      return {
        title: "",
        propertyId: "",
        assignedTo: "",
        type: "checkout",
      };
    }, [id, existingChecklist])
  });

  // Efeito para carregar os itens do checklist quando o `existingChecklist` é carregado
  useEffect(() => {
    if (id && existingChecklist) {
      setItems(existingChecklist.items || []); // Inicializa os items do checklist
    } else if (!id) {
      setItems([]); // Limpa os items quando não está em modo de edição
    }
  }, [id, existingChecklist]);


  // Load template items
  const loadTemplate = (templateId: string) => {
    const template = checklistTemplates.find(t => t.id === templateId);
    if (template) {
      // Create new items with unique IDs
      const newItems = template.items.map(item => ({
        id: uuidv4(),
        text: item.text,
        completed: false
      }));
      setItems(newItems);
      toast({
        title: "Template Loaded",
        description: `Loaded ${template.name} template with ${template.items.length} items.`,
      });
    }
  };

  // Add a new item to the checklist
  const addItem = () => {
    if (newItemText.trim() === "") return;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newItemText,
      completed: false
    };

    setItems([...items, newItem]);
    setNewItemText("");
  };

  // Remove an item from the checklist
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Toggle item completion (mantido, pois é um estado interno da UI do formulário)
  const toggleItem = (id: string) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one item to the checklist.",
      });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const checklistData: Checklist = {
        id: id || uuidv4(), // Usar ID existente ou gerar novo se o Supabase não gerar automaticamente
        title: values.title,
        propertyId: values.propertyId,
        assignedTo: values.assignedTo || undefined,
        type: values.type,
        items: items,
        createdAt: id && existingChecklist ? existingChecklist.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: undefined // Opcional: definir como undefined na criação/edição e atualizar apenas na conclusão
      };

      if (id) {
        // Update existing checklist
        await updateChecklist(checklistData); // Usar updateChecklist do useData
        toast({
          title: "Success",
          description: "Checklist updated successfully.",
        });
      } else {
        // Create new checklist
        await addChecklist(checklistData); // Usar addChecklist do useData
        toast({
          title: "Success",
          description: "Checklist created successfully.",
        });
      }

      navigate("/checklists");
    } catch (error: any) {
      console.error("Error saving checklist:", error);
      setError(error.message || "Failed to save checklist. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save checklist. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Adicionado estado de carregamento inicial, útil se o hook useData ainda estiver buscando os dados
  const isLoadingData = Object.keys(properties).length === 0 || Object.keys(employees).length === 0 || Object.keys(checklists).length === 0;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se estiver em modo de edição e o checklist não for encontrado após o carregamento dos dados
  if (id && !existingChecklist && !isLoadingData) {
    return (
      <div className="text-center py-10">
        <h3 className="mt-2 text-lg font-semibold">Checklist Not Found</h3>
        <p className="text-muted-foreground">The checklist you are trying to edit does not exist.</p>
        <Button onClick={() => navigate("/checklists")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Checklists
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {id ? "Edit Checklist" : "New Checklist"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {id ? "Update an existing checklist" : "Create a new checklist"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Details</CardTitle>
          <CardDescription>Basic information about the checklist</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter checklist title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isLoadingData} // Desabilitar enquanto carrega as propriedades
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isLoadingData} // Desabilitar enquanto carrega os funcionários
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            Unassigned
                          </SelectItem>
                          {allEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Person responsible for completing this checklist
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isLoadingData} // Desabilitar enquanto carrega os dados
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="checkin">Check-in</SelectItem>
                        <SelectItem value="checkout">Check-out</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Checklist Items</h3>
                  <div className="flex space-x-2">
                    <Select onValueChange={loadTemplate}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Load Template" />
                      </SelectTrigger>
                      <SelectContent>
                        {checklistTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <p className="text-muted-foreground">
                      No items added yet. Add some items to your checklist.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-card border rounded-md">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={item.completed}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <Label
                            htmlFor={`item-${item.id}`}
                            className={`${item.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {item.text}
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a new item"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                  <Button type="button" onClick={addItem} disabled={!newItemText.trim()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 p-3 rounded-md flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/checklists")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : (id ? "Update" : "Create")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}