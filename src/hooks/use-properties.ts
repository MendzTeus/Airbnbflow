
import { useState, useMemo } from 'react';
import { Property } from '@/types';
import { useData } from './use-data';

/**
 * A hook for working with property data, including region filtering
 */
export const useProperties = (initialRegion: string = 'all') => {
  const { 
    properties, 
    setProperties, 
    getPropertyById
  } = useData();
  
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  
  // Filter properties based on selected region
  const filteredProperties = useMemo(() => {
    if (selectedRegion === 'all') {
      return Object.values(properties);
    }
    return Object.values(properties).filter(property => property.region === selectedRegion);
  }, [selectedRegion, properties]);
  
  // Get all unique regions from properties
  const availableRegions = useMemo(() => {
    const regions = new Set<string>();
    
    Object.values(properties).forEach(property => {
      if (property.region) {
        regions.add(property.region);
      }
    });
    
    return ['all', ...Array.from(regions)];
  }, [properties]);
  
  return {
    properties: filteredProperties,
    allProperties: Object.values(properties),
    loadingProperties: false,
    selectedRegion,
    setSelectedRegion,
    availableRegions,
    getPropertyById,
    updateProperty: (property: Property) => {
      setProperties((prev: Record<string, Property>) => ({
        ...prev,
        [property.id]: property
      }));
    },
    addProperty: (property: Property) => {
      setProperties((prev: Record<string, Property>) => ({
        ...prev,
        [property.id]: property
      }));
    },
    removeProperty: (id: string) => {
      setProperties((prev: Record<string, Property>) => {
        const newProperties = { ...prev };
        delete newProperties[id];
        return newProperties;
      });
    }
  };
};
