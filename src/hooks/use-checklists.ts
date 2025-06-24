// src/hooks/use-checklists.ts
import { useMemo } from 'react';
import { useData } from './use-data';
import { Checklist } from '@/types';

export const useChecklists = () => {
  const { checklists, properties } = useData();
  
  const checklistsArray = useMemo(() => 
    checklists ? Object.values(checklists) : [], 
    [checklists]
  );
  
  const propertiesArray = useMemo(() => 
    properties ? Object.values(properties) : [], 
    [properties]
  );

  const getChecklistsByRegion = (region: string): Checklist[] => {
    if (!region) return checklistsArray;
    
    return checklistsArray.filter(checklist => {
      const property = propertiesArray.find(p => p.id === checklist.propertyId);
      return property && property.region === region;
    });
  };

  return {
    checklists: checklistsArray,
    getChecklistsByRegion,
  };
};