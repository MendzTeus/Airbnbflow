
import { useDataContext } from '@/contexts/DataContext';
import { useState, useMemo } from 'react';
import { Property, Employee, Checklist, AccessCode, MaintenanceRequest, CalendarEvent } from '@/types';
import { useToast } from "@/hooks/use-toast";

/**
 * Enhanced hook to access the data context with utility functions
 * for more convenient data access across the application
 */
export const useData = () => {
  const context = useDataContext();
  const { toast } = useToast();

  // Helper function to display toast notifications for data operations
  const notifyChange = (message: string, type: "success" | "error" = "success") => {
    toast({
      title: type === "success" ? "Success" : "Error",
      description: message,
      variant: type === "success" ? "default" : "destructive",
    });
  };

  // Properties helper methods
  const updateProperty = (property: Property) => {
    try {
      context.setProperties(prev => ({
        ...prev,
        [property.id]: property
      }));
      notifyChange(`Property "${property.name}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update property: ${error}`, "error");
      return false;
    }
  };

  const addProperty = (property: Property) => {
    try {
      context.setProperties(prev => ({
        ...prev,
        [property.id]: property
      }));
      notifyChange(`Property "${property.name}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add property: ${error}`, "error");
      return false;
    }
  };

  const removeProperty = (id: string) => {
    try {
      const property = context.getPropertyById(id);
      if (!property) throw new Error("Property not found");
      
      context.setProperties(prev => {
        const newProps = { ...prev };
        delete newProps[id];
        return newProps;
      });
      
      notifyChange(`Property "${property.name}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove property: ${error}`, "error");
      return false;
    }
  };

  // Employees helper methods
  const updateEmployee = (employee: Employee) => {
    try {
      context.setEmployees(prev => ({
        ...prev,
        [employee.id]: employee
      }));
      notifyChange(`Employee "${employee.name}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update employee: ${error}`, "error");
      return false;
    }
  };

  const addEmployee = (employee: Employee) => {
    try {
      context.setEmployees(prev => ({
        ...prev,
        [employee.id]: employee
      }));
      notifyChange(`Employee "${employee.name}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add employee: ${error}`, "error");
      return false;
    }
  };

  const removeEmployee = (id: string) => {
    try {
      const employee = context.getEmployeeById(id);
      if (!employee) throw new Error("Employee not found");
      
      context.setEmployees(prev => {
        const newEmployees = { ...prev };
        delete newEmployees[id];
        return newEmployees;
      });
      
      notifyChange(`Employee "${employee.name}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove employee: ${error}`, "error");
      return false;
    }
  };

  // Checklists helper methods
  const updateChecklist = (checklist: Checklist) => {
    try {
      context.setChecklists(prev => ({
        ...prev,
        [checklist.id]: checklist
      }));
      notifyChange(`Checklist "${checklist.title}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update checklist: ${error}`, "error");
      return false;
    }
  };

  const addChecklist = (checklist: Checklist) => {
    try {
      context.setChecklists(prev => ({
        ...prev,
        [checklist.id]: checklist
      }));
      notifyChange(`Checklist "${checklist.title}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add checklist: ${error}`, "error");
      return false;
    }
  };

  const removeChecklist = (id: string) => {
    try {
      const checklist = context.getChecklistById(id);
      if (!checklist) throw new Error("Checklist not found");
      
      context.setChecklists(prev => {
        const newChecklists = { ...prev };
        delete newChecklists[id];
        return newChecklists;
      });
      
      notifyChange(`Checklist "${checklist.title}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove checklist: ${error}`, "error");
      return false;
    }
  };

  // Calendar events helper methods
  const updateEvent = (event: CalendarEvent) => {
    try {
      context.setEvents(prev => ({
        ...prev,
        [event.id]: { ...event, updatedAt: new Date().toISOString() }
      }));
      notifyChange(`Event "${event.title}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update event: ${error}`, "error");
      return false;
    }
  };

  const addEvent = (event: CalendarEvent) => {
    try {
      const newEvent = { 
        ...event, 
        id: event.id || Math.random().toString(36).substring(2, 9),
        createdAt: event.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      context.setEvents(prev => ({
        ...prev,
        [newEvent.id]: newEvent
      }));
      
      notifyChange(`Event "${event.title}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add event: ${error}`, "error");
      return false;
    }
  };

  const removeEvent = (id: string) => {
    try {
      const event = context.getEventById(id);
      if (!event) throw new Error("Event not found");
      
      context.setEvents(prev => {
        const newEvents = { ...prev };
        delete newEvents[id];
        return newEvents;
      });
      
      notifyChange(`Event "${event.title}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove event: ${error}`, "error");
      return false;
    }
  };

  // Access Codes helper methods
  const updateAccessCode = (code: AccessCode) => {
    try {
      context.setAccessCodes(prev => ({
        ...prev,
        [code.id]: code
      }));
      notifyChange(`Access code "${code.name}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update access code: ${error}`, "error");
      return false;
    }
  };

  const addAccessCode = (code: AccessCode) => {
    try {
      context.setAccessCodes(prev => ({
        ...prev,
        [code.id]: code
      }));
      notifyChange(`Access code "${code.name}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add access code: ${error}`, "error");
      return false;
    }
  };

  const removeAccessCode = (id: string) => {
    try {
      const code = context.getAccessCodeById(id);
      if (!code) throw new Error("Access code not found");
      
      context.setAccessCodes(prev => {
        const newCodes = { ...prev };
        delete newCodes[id];
        return newCodes;
      });
      
      notifyChange(`Access code "${code.name}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove access code: ${error}`, "error");
      return false;
    }
  };

  // Maintenance Requests helper methods
  const updateMaintenanceRequest = (request: MaintenanceRequest) => {
    try {
      context.setMaintenanceRequests(prev => ({
        ...prev,
        [request.id]: request
      }));
      notifyChange(`Maintenance request "${request.title}" updated successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to update maintenance request: ${error}`, "error");
      return false;
    }
  };

  const addMaintenanceRequest = (request: MaintenanceRequest) => {
    try {
      context.setMaintenanceRequests(prev => ({
        ...prev,
        [request.id]: request
      }));
      notifyChange(`Maintenance request "${request.title}" added successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to add maintenance request: ${error}`, "error");
      return false;
    }
  };

  const removeMaintenanceRequest = (id: string) => {
    try {
      const request = context.getMaintenanceRequestById(id);
      if (!request) throw new Error("Maintenance request not found");
      
      context.setMaintenanceRequests(prev => {
        const newRequests = { ...prev };
        delete newRequests[id];
        return newRequests;
      });
      
      notifyChange(`Maintenance request "${request.title}" removed successfully`);
      return true;
    } catch (error) {
      notifyChange(`Failed to remove maintenance request: ${error}`, "error");
      return false;
    }
  };

  return {
    ...context,
    // Enhanced property methods
    updateProperty,
    addProperty,
    removeProperty,
    // Enhanced employee methods
    updateEmployee,
    addEmployee,
    removeEmployee,
    // Enhanced checklist methods
    updateChecklist,
    addChecklist,
    removeChecklist,
    // Enhanced calendar event methods
    updateEvent,
    addEvent,
    removeEvent,
    // Enhanced access code methods
    updateAccessCode,
    addAccessCode,
    removeAccessCode,
    // Enhanced maintenance request methods
    updateMaintenanceRequest,
    addMaintenanceRequest,
    removeMaintenanceRequest,
  };
};
