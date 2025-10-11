// =============================================
// src/contexts/DataContext.tsx (VERSÃO CORRIGIDA)
// =============================================
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Property, Employee, Checklist, AccessCode, MaintenanceRequest, CalendarEvent } from "@/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { fromSnakeToCamel, fromCamelToSnake } from "@/lib/supabase-helpers";

interface DataContextType {
  properties: Record<string, Property>;
  employees: Record<string, Employee>;
  checklists: Record<string, Checklist>;
  accessCodes: Record<string, AccessCode>;
  maintenanceRequests: Record<string, MaintenanceRequest>;
  events: Record<string, CalendarEvent>;
  
  getPropertyById: (id: string) => Property | undefined;
  getEmployeeById: (id: string) => Employee | undefined;
  getChecklistById: (id: string) => Checklist | undefined;
  getAccessCodeById: (id: string) => AccessCode | undefined;
  getMaintenanceRequestById: (id: string) => MaintenanceRequest | undefined;
  getEventById: (id: string) => CalendarEvent | undefined;
  
  getPropertiesByRegion: (region: string) => Property[];
  getChecklistsByPropertyId: (propertyId: string) => Checklist[];
  getEmployeesByRole: (role: string) => Employee[];
  getAccessCodesByPropertyId: (propertyId: string) => AccessCode[];
  getMaintenanceRequestsByPropertyId: (propertyId: string) => MaintenanceRequest[];
  getMaintenanceRequestsByRegion: (region: string) => MaintenanceRequest[];
  getEventsByPropertyId: (propertyId: string) => CalendarEvent[];
  getEventsByAssignee: (assigneeId: string) => CalendarEvent[];

  addProperty: (property: Partial<Property>) => Promise<Property>;
  updateProperty: (property: Property) => Promise<Property>;
  removeProperty: (id: string) => Promise<void>;

  addEmployee: (employee: Partial<Employee>) => Promise<Employee>;
  updateEmployee: (employee: Employee) => Promise<Employee>;
  removeEmployee: (id: string) => Promise<void>;

  addChecklist: (checklist: Partial<Checklist>) => Promise<Checklist>;
  updateChecklist: (checklist: Checklist) => Promise<Checklist>;
  removeChecklist: (id: string) => Promise<void>;

  addAccessCode: (accessCode: Partial<AccessCode>) => Promise<AccessCode>;
  updateAccessCode: (accessCode: AccessCode) => Promise<AccessCode>;
  removeAccessCode: (id: string) => Promise<void>;

  addMaintenanceRequest: (request: Partial<MaintenanceRequest>) => Promise<MaintenanceRequest>;
  updateMaintenanceRequest: (request: MaintenanceRequest) => Promise<MaintenanceRequest>;
  removeMaintenanceRequest: (id: string) => Promise<void>;

  addEvent: (event: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  updateEvent: (event: CalendarEvent) => Promise<CalendarEvent>;
  removeEvent: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useDataContext(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [employees, setEmployees] = useState<Record<string, Employee>>({});
  const [checklists, setChecklists] = useState<Record<string, Checklist>>({});
  const [accessCodes, setAccessCodes] = useState<Record<string, AccessCode>>({});
  const [maintenanceRequests, setMaintenanceRequests] = useState<Record<string, MaintenanceRequest>>({});
  const [events, setEvents] = useState<Record<string, CalendarEvent>>({});
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    let isActive = true;

    const resetData = () => {
      if (!isActive) return;
      setProperties({});
      setEmployees({});
      setChecklists({});
      setAccessCodes({});
      setMaintenanceRequests({});
      setEvents({});
    };

    const fetchTable = async <T extends { id: string }>(
      tableName: string,
      setter: (data: Record<string, T>) => void
    ) => {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) {
        console.error(`Erro ao buscar dados de ${tableName}:`, error);
        return;
      }

      if (!isActive) return;

      // 🔥 CONVERSÃO: snake_case (DB) → camelCase (TypeScript)
      const dataMap = (data || []).reduce((acc, item) => {
        const converted = fromSnakeToCamel<T>(item);
        acc[converted.id] = converted;
        return acc;
      }, {} as Record<string, T>);
      
      setter(dataMap);
    };

    const fetchAll = async () => {
      await Promise.all([
        fetchTable<Property>("properties", setProperties),
        fetchTable<Employee>("employees", setEmployees),
        fetchTable<Checklist>("checklists", setChecklists),
        fetchTable<AccessCode>("access_codes", setAccessCodes),
        fetchTable<MaintenanceRequest>("maintenance_requests", setMaintenanceRequests),
        fetchTable<CalendarEvent>("calendar_events", setEvents),
      ]);
    };

    if (authLoading) {
      return () => {
        isActive = false;
      };
    }

    if (!user) {
      resetData();
      return () => {
        isActive = false;
      };
    }

    resetData();
    fetchAll();

    return () => {
      isActive = false;
    };
  }, [user, authLoading]);

  // --- Helper Functions ---
  const getPropertyById = (id: string) => properties[id];
  const getEmployeeById = (id: string) => employees[id];
  const getChecklistById = (id: string) => checklists[id];
  const getAccessCodeById = (id: string) => accessCodes[id];
  const getMaintenanceRequestById = (id: string) => maintenanceRequests[id];
  const getEventById = (id: string) => events[id];

  const getPropertiesByRegion = (region: string) =>
    Object.values(properties).filter(p => p.region === region);
  
  const getChecklistsByPropertyId = (propertyId: string) =>
    Object.values(checklists).filter(c => c.propertyId === propertyId);
  
  const getEmployeesByRole = (role: string) =>
    Object.values(employees).filter(e => e.role === role);
  
  const getAccessCodesByPropertyId = (propertyId: string) =>
    Object.values(accessCodes).filter(a => a.propertyId === propertyId);
  
  const getMaintenanceRequestsByPropertyId = (propertyId: string) =>
    Object.values(maintenanceRequests).filter(m => m.propertyId === propertyId);
  
  const getMaintenanceRequestsByRegion = (region: string) => {
    const regionProperties = getPropertiesByRegion(region);
    const propertyIds = regionProperties.map(p => p.id);
    return Object.values(maintenanceRequests).filter(m => propertyIds.includes(m.propertyId));
  };

  const getEventsByPropertyId = (propertyId: string) =>
    Object.values(events).filter(e => e.propertyId === propertyId);
  
  const getEventsByAssignee = (assigneeId: string) =>
    Object.values(events).filter(e => e.assignedTo === assigneeId);

  // --- CRUD Operations with Conversion ---

  // Properties
  const addProperty = async (property: Partial<Property>): Promise<Property> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");
    
    // 🔥 CONVERSÃO: camelCase (TypeScript) → snake_case (DB)
    const propertyToInsert = fromCamelToSnake({ ...property, userId: user.id });
    
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyToInsert])
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      // 🔥 CONVERSÃO: snake_case (DB) → camelCase (TypeScript)
      const converted = fromSnakeToCamel<Property>(data);
      setProperties(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to add property, no data returned.");
  };

  const updateProperty = async (property: Property): Promise<Property> => {
    // 🔥 CONVERSÃO: camelCase → snake_case
    const propertyToUpdate = fromCamelToSnake({ 
      ...property, 
      updatedAt: new Date().toISOString() 
    });
    
    const { data, error } = await supabase
      .from('properties')
      .update(propertyToUpdate)
      .eq('id', property.id)
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<Property>(data);
      setProperties(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to update property, no data returned.");
  };

  const removeProperty = async (id: string): Promise<void> => {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    setProperties(prev => {
      const newProps = { ...prev };
      delete newProps[id];
      return newProps;
    });
  };

  // Employees
  const addEmployee = async (employee: Partial<Employee>): Promise<Employee> => {
    const employeeToInsert = fromCamelToSnake({ 
      ...employee, 
      properties: employee.properties || [] 
    });
    
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeToInsert])
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<Employee>(data);
      setEmployees(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to add employee, no data returned.");
  };

  const updateEmployee = async (employee: Employee): Promise<Employee> => {
    const employeeToUpdate = fromCamelToSnake({ 
      ...employee, 
      updatedAt: new Date().toISOString() 
    });
    
    const { data, error } = await supabase
      .from('employees')
      .update(employeeToUpdate)
      .eq('id', employee.id)
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<Employee>(data);
      setEmployees(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to update employee, no data returned.");
  };

  const removeEmployee = async (id: string): Promise<void> => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    setEmployees(prev => {
      const newEmployees = { ...prev };
      delete newEmployees[id];
      return newEmployees;
    });
  };

  // Checklists
  const addChecklist = async (checklist: Partial<Checklist>): Promise<Checklist> => {
    const checklistToInsert = fromCamelToSnake({ 
      ...checklist, 
      items: checklist.items || [] 
    });
    
    const { data, error } = await supabase
      .from('checklists')
      .insert([checklistToInsert])
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<Checklist>(data);
      setChecklists(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to add checklist, no data returned.");
  };

  const updateChecklist = async (checklist: Checklist): Promise<Checklist> => {
    const checklistToUpdate = fromCamelToSnake({ 
      ...checklist, 
      updatedAt: new Date().toISOString() 
    });
    
    const { data, error } = await supabase
      .from('checklists')
      .update(checklistToUpdate)
      .eq('id', checklist.id)
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<Checklist>(data);
      setChecklists(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to update checklist, no data returned.");
  };

  const removeChecklist = async (id: string): Promise<void> => {
    const { error } = await supabase.from('checklists').delete().eq('id', id);
    if (error) throw error;
    setChecklists(prev => {
      const newChecklists = { ...prev };
      delete newChecklists[id];
      return newChecklists;
    });
  };

  // Access Codes
  const addAccessCode = async (accessCode: Partial<AccessCode>): Promise<AccessCode> => {
    const codeToInsert = fromCamelToSnake(accessCode);
    
    const { data, error } = await supabase
      .from('access_codes')
      .insert([codeToInsert])
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<AccessCode>(data);
      setAccessCodes(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to add access code, no data returned.");
  };

  const updateAccessCode = async (accessCode: AccessCode): Promise<AccessCode> => {
    const codeToUpdate = fromCamelToSnake({ 
      ...accessCode, 
      updatedAt: new Date().toISOString() 
    });
    
    const { data, error } = await supabase
      .from('access_codes')
      .update(codeToUpdate)
      .eq('id', accessCode.id)
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<AccessCode>(data);
      setAccessCodes(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to update access code, no data returned.");
  };

  const removeAccessCode = async (id: string): Promise<void> => {
    const { error } = await supabase.from('access_codes').delete().eq('id', id);
    if (error) throw error;
    setAccessCodes(prev => {
      const newCodes = { ...prev };
      delete newCodes[id];
      return newCodes;
    });
  };

  // Maintenance Requests
  const addMaintenanceRequest = async (request: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    const requestToInsert = fromCamelToSnake(request);
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([requestToInsert])
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<MaintenanceRequest>(data);
      setMaintenanceRequests(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to add maintenance request, no data returned.");
  };

  const updateMaintenanceRequest = async (request: MaintenanceRequest): Promise<MaintenanceRequest> => {
    const requestToUpdate = fromCamelToSnake({ 
      ...request, 
      updatedAt: new Date().toISOString() 
    });
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(requestToUpdate)
      .eq('id', request.id)
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<MaintenanceRequest>(data);
      setMaintenanceRequests(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to update maintenance request, no data returned.");
  };

  const removeMaintenanceRequest = async (id: string): Promise<void> => {
    const { error } = await supabase.from('maintenance_requests').delete().eq('id', id);
    if (error) throw error;
    setMaintenanceRequests(prev => {
      const newRequests = { ...prev };
      delete newRequests[id];
      return newRequests;
    });
  };

  // Calendar Events
  const addEvent = async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const eventToInsert = fromCamelToSnake(event);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([eventToInsert])
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<CalendarEvent>(data);
      setEvents(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to add event, no data returned.");
  };

  const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
    const eventToUpdate = fromCamelToSnake({ 
      ...event, 
      updatedAt: new Date().toISOString() 
    });
    
    const { data, error } = await supabase
      .from('calendar_events')
      .update(eventToUpdate)
      .eq('id', event.id)
      .select()
      .single();
      
    if (error) throw error;
    if (data) {
      const converted = fromSnakeToCamel<CalendarEvent>(data);
      setEvents(prev => ({ ...prev, [converted.id]: converted }));
      return converted;
    }
    throw new Error("Failed to update event, no data returned.");
  };

  const removeEvent = async (id: string): Promise<void> => {
    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
    setEvents(prev => {
      const newEvents = { ...prev };
      delete newEvents[id];
      return newEvents;
    });
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        employees,
        checklists,
        accessCodes,
        maintenanceRequests,
        events,
        getPropertyById,
        getEmployeeById,
        getChecklistById,
        getAccessCodeById,
        getMaintenanceRequestById,
        getEventById,
        getPropertiesByRegion,
        getChecklistsByPropertyId,
        getEmployeesByRole,
        getAccessCodesByPropertyId,
        getMaintenanceRequestsByPropertyId,
        getMaintenanceRequestsByRegion,
        getEventsByPropertyId,
        getEventsByAssignee,
        addProperty,
        updateProperty,
        removeProperty,
        addEmployee,
        updateEmployee,
        removeEmployee,
        addChecklist,
        updateChecklist,
        removeChecklist,
        addAccessCode,
        updateAccessCode,
        removeAccessCode,
        addMaintenanceRequest,
        updateMaintenanceRequest,
        removeMaintenanceRequest,
        addEvent,
        updateEvent,
        removeEvent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
