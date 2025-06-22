
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Property, Employee, Checklist, AccessCode, MaintenanceRequest, CalendarEvent } from "@/types";

// Define the shape of our data context
interface DataContextType {
  properties: Record<string, Property>;
  employees: Record<string, Employee>;
  checklists: Record<string, Checklist>;
  accessCodes: Record<string, AccessCode>;
  maintenanceRequests: Record<string, MaintenanceRequest>;
  events: Record<string, CalendarEvent>;
  
  setProperties: (propertiesOrFunction: Record<string, Property> | ((prev: Record<string, Property>) => Record<string, Property>)) => void;
  setEmployees: (employeesOrFunction: Record<string, Employee> | ((prev: Record<string, Employee>) => Record<string, Employee>)) => void;
  setChecklists: (checklistsOrFunction: Record<string, Checklist> | ((prev: Record<string, Checklist>) => Record<string, Checklist>)) => void;
  setAccessCodes: (accessCodesOrFunction: Record<string, AccessCode> | ((prev: Record<string, AccessCode>) => Record<string, AccessCode>)) => void;
  setMaintenanceRequests: (maintenanceRequestsOrFunction: Record<string, MaintenanceRequest> | ((prev: Record<string, MaintenanceRequest>) => Record<string, MaintenanceRequest>)) => void;
  setEvents: (eventsOrFunction: Record<string, CalendarEvent> | ((prev: Record<string, CalendarEvent>) => Record<string, CalendarEvent>)) => void;
  
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
}

// Create the data context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provide access to the data context
export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

// Mock data for development
const mockProperties: Record<string, Property> = {
  "prop1": {
    id: "prop1",
    name: "Luxury Downtown Loft",
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    region: "Downtown",
    zipCode: "94105",
    bedrooms: 2,
    bathrooms: 2,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
    description: "Modern loft in the heart of downtown with amazing city views.",
    createdAt: "2023-01-15T00:00:00.000Z",
    updatedAt: "2023-01-15T00:00:00.000Z"
  },
  "prop2": {
    id: "prop2",
    name: "Beachfront Villa",
    address: "456 Ocean Dr",
    city: "Malibu",
    state: "CA",
    region: "Beach",
    zipCode: "90265",
    bedrooms: 4,
    bathrooms: 3,
    imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    description: "Stunning beachfront property with direct access to the sand.",
    createdAt: "2023-02-20T00:00:00.000Z",
    updatedAt: "2023-02-20T00:00:00.000Z"
  },
  // ... more property data
};

const mockEmployees: Record<string, Employee> = {
  "emp1": {
    id: "emp1",
    name: "John Doe",
    email: "john@example.com",
    phone: "555-123-4567",
    role: "cleaner",
    startDate: "2023-01-10T00:00:00.000Z",
    properties: ["prop1", "prop2"]
  },
  "emp2": {
    id: "emp2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-987-6543",
    role: "manager",
    startDate: "2022-11-15T00:00:00.000Z",
    properties: ["prop1"]
  },
  // ... more employee data
};

const mockChecklists: Record<string, Checklist> = {
  "check1": {
    id: "check1",
    title: "Standard Cleaning",
    propertyId: "prop1",
    assignedTo: "emp1",
    type: "checkout",
    items: [
      { id: "item1", text: "Clean bathrooms", completed: true },
      { id: "item2", text: "Vacuum floors", completed: false },
      { id: "item3", text: "Change linens", completed: true }
    ],
    createdAt: "2023-03-15T00:00:00.000Z",
    updatedAt: "2023-03-15T00:00:00.000Z"
  },
  // ... more checklist data
};

const mockAccessCodes: Record<string, AccessCode> = {
  "code1": {
    id: "code1",
    name: "Main Door",
    code: "1234",
    propertyId: "prop1",
    expiryDate: "2023-12-31T00:00:00.000Z",
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z"
  },
  "code2": {
    id: "code2",
    name: "Garden Gate",
    code: "5678",
    propertyId: "prop2",
    createdAt: "2023-02-01T00:00:00.000Z",
    updatedAt: "2023-02-01T00:00:00.000Z"
  },
  // ... more access code data
};

const mockMaintenanceRequests: Record<string, MaintenanceRequest> = {
  "maint1": {
    id: "maint1",
    title: "Leaking Faucet",
    description: "Kitchen sink faucet is leaking and needs repair.",
    propertyId: "prop1",
    assignedTo: "emp1",
    status: "open",
    priority: "medium",
    createdAt: "2023-04-05T00:00:00.000Z",
    updatedAt: "2023-04-05T00:00:00.000Z"
  },
  "maint2": {
    id: "maint2",
    title: "AC Not Working",
    description: "Air conditioning unit is not cooling properly.",
    propertyId: "prop2",
    status: "in-progress",
    priority: "high",
    createdAt: "2023-04-10T00:00:00.000Z",
    updatedAt: "2023-04-11T00:00:00.000Z"
  },
  // ... more maintenance request data
};

const mockEvents: Record<string, CalendarEvent> = {
  "event1": {
    id: "event1",
    title: "Regular Cleaning",
    propertyId: "prop1",
    assignedTo: "emp1",
    startDate: "2023-04-15T10:00:00.000Z",
    endDate: "2023-04-15T12:00:00.000Z",
    type: "cleaning",
    notes: "Focus on kitchen and bathrooms",
    createdAt: "2023-04-01T00:00:00.000Z",
    updatedAt: "2023-04-01T00:00:00.000Z"
  },
  "event2": {
    id: "event2",
    title: "Fix Shower",
    propertyId: "prop2",
    assignedTo: "emp1",
    startDate: "2023-04-16T15:00:00.000Z",
    endDate: "2023-04-16T16:30:00.000Z",
    type: "maintenance",
    notes: "Replace shower head and check for leaks",
    createdAt: "2023-04-02T00:00:00.000Z",
    updatedAt: "2023-04-02T00:00:00.000Z"
  },
  // ... more calendar event data
};

// Data provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Record<string, Property>>(mockProperties);
  const [employees, setEmployees] = useState<Record<string, Employee>>(mockEmployees);
  const [checklists, setChecklists] = useState<Record<string, Checklist>>(mockChecklists);
  const [accessCodes, setAccessCodes] = useState<Record<string, AccessCode>>(mockAccessCodes);
  const [maintenanceRequests, setMaintenanceRequests] = useState<Record<string, MaintenanceRequest>>(mockMaintenanceRequests);
  const [events, setEvents] = useState<Record<string, CalendarEvent>>(mockEvents);

  // Helper functions to get items by ID
  const getPropertyById = (id: string) => properties[id];
  const getEmployeeById = (id: string) => employees[id];
  const getChecklistById = (id: string) => checklists[id];
  const getAccessCodeById = (id: string) => accessCodes[id];
  const getMaintenanceRequestById = (id: string) => maintenanceRequests[id];
  const getEventById = (id: string) => events[id];

  // Helper functions to get filtered items
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

  return (
    <DataContext.Provider
      value={{
        properties,
        employees,
        checklists,
        accessCodes,
        maintenanceRequests,
        events,
        setProperties,
        setEmployees,
        setChecklists,
        setAccessCodes,
        setMaintenanceRequests,
        setEvents,
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
        getEventsByAssignee
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
