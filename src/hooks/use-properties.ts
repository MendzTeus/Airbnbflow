// src/hooks/use-properties.ts
import { useState, useMemo } from 'react';
import { useData } from './use-data';
// import { Property } from '@/types'; // Não precisa importar Property se for tipar via useData

/**
 * A hook for working with property data, including region filtering
 */
export const useProperties = (initialRegion: string = 'all') => {
  const {
    properties, // Propriedades vêm do useData, que as busca do Supabase
    getPropertyById,
    updateProperty, // Funções de CRUD também vêm do useData
    addProperty,
    removeProperty
  } = useData();

  const [selectedRegion, setSelectedRegion] = useState(initialRegion);

  // Filter properties based on selected region
  const filteredProperties = useMemo(() => {
    const propertiesArray = Object.values(properties); // Converter o objeto em array
    if (selectedRegion === 'all') {
      return propertiesArray;
    }
    return propertiesArray.filter(property => property.region === selectedRegion);
  }, [selectedRegion, properties]); // Dependência em 'properties' (o objeto do DataContext)

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
    allProperties: Object.values(properties), // Expor todas as propriedades sem filtro de região
    loadingProperties: Object.keys(properties).length === 0, // Um indicador de carregamento simples
    selectedRegion,
    setSelectedRegion,
    availableRegions,
    getPropertyById,
    updateProperty, // Expondo as funções de CRUD diretamente do useData
    addProperty,
    removeProperty
  };
};