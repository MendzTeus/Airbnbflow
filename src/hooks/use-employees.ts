// src/hooks/use-employees.ts
import { useMemo } from 'react';
import { useData } from './use-data';
import { Employee } from '@/types';

export const useEmployees = () => {
  const { employees, properties } = useData();
  
  // Convert to arrays for easier processing
  const employeesArray = useMemo(() => 
    employees ? Object.values(employees) : [], 
    [employees]
  );
  
  const propertiesArray = useMemo(() => 
    properties ? Object.values(properties) : [], 
    [properties]
  );

  const getEmployeesByRegion = (region: string): Employee[] => {
    if (!region) return employeesArray;
    
    return employeesArray.filter(employee => {
      // Assuming 'properties' array on employee contains IDs.
      // And properties in DataContext have a 'region' field.
      return employee.properties?.some(propertyId => {
        const property = propertiesArray.find(p => p.id === propertyId);
        return property && property.region === region;
      });
    });
  };

  return {
    employees: employeesArray,
    allEmployees: employeesArray, // Add this property for backward compatibility
    getEmployeesByRegion,
  };
};