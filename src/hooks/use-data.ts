// src/hooks/use-data.ts
import { useDataContext } from '@/contexts/DataContext';
import { Property, Employee, Checklist, AccessCode, MaintenanceRequest, CalendarEvent } from '@/types';
import { useToast } from "@/hooks/use-toast";

export const useData = () => {
  const context = useDataContext();
  const { toast } = useToast();

  const notifyChange = (message: string, type: "success" | "error" = "success") => {
    toast({
      title: type === "success" ? "Success" : "Error",
      description: message,
      variant: type === "success" ? "default" : "destructive",
    });
  };

  // Propriedades
  const updateProperty = async (property: Property) => {
    try {
      await context.updateProperty(property);
      notifyChange(`Property "${property.name}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update property: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const addProperty = async (property: Partial<Property>) => {
    try {
      const addedProperty = await context.addProperty(property);
      notifyChange(`Property "${addedProperty.name}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add property: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const removeProperty = async (id: string) => {
    try {
      const property = context.getPropertyById(id);
      if (!property) throw new Error("Property not found");

      await context.removeProperty(id);
      notifyChange(`Property "${property.name}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove property: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  // Funcionários
  const updateEmployee = async (employee: Employee) => {
    try {
      await context.updateEmployee(employee);
      notifyChange(`Employee "${employee.name}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update employee: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const addEmployee = async (employee: Partial<Employee>) => {
    try {
      const addedEmployee = await context.addEmployee(employee);
      notifyChange(`Employee "${addedEmployee.name}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add employee: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const removeEmployee = async (id: string) => {
    try {
      const employee = context.getEmployeeById(id);
      if (!employee) throw new Error("Employee not found");

      await context.removeEmployee(id);
      notifyChange(`Employee "${employee.name}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove employee: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  // Checklists
  const updateChecklist = async (checklist: Checklist) => {
    try {
      await context.updateChecklist(checklist);
      notifyChange(`Checklist "${checklist.title}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update checklist: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const addChecklist = async (checklist: Partial<Checklist>) => {
    try {
      const addedChecklist = await context.addChecklist(checklist);
      notifyChange(`Checklist "${addedChecklist.title}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add checklist: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const removeChecklist = async (id: string) => {
    try {
      const checklist = context.getChecklistById(id);
      if (!checklist) throw new Error("Checklist not found");

      await context.removeChecklist(id);
      notifyChange(`Checklist "${checklist.title}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove checklist: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  // Calendar Events
  const updateEvent = async (event: CalendarEvent) => {
    try {
      await context.updateEvent(event);
      notifyChange(`Event "${event.title}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update event: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const addEvent = async (event: Partial<CalendarEvent>) => {
    try {
      const addedEvent = await context.addEvent(event);
      notifyChange(`Event "${addedEvent.title}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add event: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const removeEvent = async (id: string) => {
    try {
      const event = context.getEventById(id);
      if (!event) throw new Error("Event not found");

      await context.removeEvent(id);
      notifyChange(`Event "${event.title}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove event: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  // Access Codes
  const updateAccessCode = async (code: AccessCode) => {
    try {
      await context.updateAccessCode(code);
      notifyChange(`Access code "${code.name}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update access code: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const addAccessCode = async (code: Partial<AccessCode>) => {
    try {
      const addedCode = await context.addAccessCode(code);
      notifyChange(`Access code "${addedCode.name}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add access code: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const removeAccessCode = async (id: string) => {
    try {
      const code = context.getAccessCodeById(id);
      if (!code) throw new Error("Access code not found");

      await context.removeAccessCode(id);
      notifyChange(`Access code "${code.name}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove access code: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  // Maintenance Requests
  const updateMaintenanceRequest = async (request: MaintenanceRequest) => {
    try {
      await context.updateMaintenanceRequest(request);
      notifyChange(`Maintenance request "${request.title}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update maintenance request: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const addMaintenanceRequest = async (request: Partial<MaintenanceRequest>) => {
    try {
      const addedRequest = await context.addMaintenanceRequest(request);
      notifyChange(`Maintenance request "${addedRequest.title}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add maintenance request: ${(error as Error).message}`, "error");
      throw error;
    }
  };

  const removeMaintenanceRequest = async (id: string) => {
    try {
      const request = context.getMaintenanceRequestById(id);
      if (!request) throw new Error("Maintenance request not found");

      await context.removeMaintenanceRequest(id);
      notifyChange(`Maintenance request "${request.title}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove maintenance request: ${(error as Error).message}`, "error");
      throw error;
    }
  };


  return {
    ...context, // Continua expondo as propriedades de dados (properties, employees, etc.)
    updateProperty,
    addProperty,
    removeProperty,
    updateEmployee,
    addEmployee,
    removeEmployee,
    updateChecklist,
    addChecklist,
    removeChecklist,
    updateEvent,
    addEvent,
    removeEvent,
    updateAccessCode,
    addAccessCode,
    removeAccessCode,
    updateMaintenanceRequest,
    addMaintenanceRequest,
    removeMaintenanceRequest,
  };
};
