
export type UserRole = "manager" | "cleaner";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  region?: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  startDate: string;
  properties: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  propertyId: string;
  assignedTo?: string;
  type: "checkin" | "checkout" | "maintenance";
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  propertyId: string;
  assignedTo?: string;
  startDate: string;
  endDate: string;
  type: "cleaning" | "maintenance";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessCode {
  id: string;
  name: string;
  code: string;
  propertyId: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  propertyId: string;
  assignedTo?: string;
  status: "open" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type Language = "en" | "es" | "fr" | "pt-br";
export type Theme = "light" | "dark";

// Common checklist items for reuse
export const COMMON_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "1", text: "Check all lights", completed: false },
  { id: "2", text: "Ensure all doors lock properly", completed: false },
  { id: "3", text: "Clean bathrooms", completed: false },
  { id: "4", text: "Vacuum floors", completed: false },
  { id: "5", text: "Check kitchen appliances", completed: false },
  { id: "6", text: "Empty trash bins", completed: false },
  { id: "7", text: "Sanitize surfaces", completed: false },
  { id: "8", text: "Replace towels and linens", completed: false },
  { id: "9", text: "Restock toiletries", completed: false },
  { id: "10", text: "Check heating/cooling systems", completed: false }
];
