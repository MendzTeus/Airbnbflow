// src/lib/supabase-helpers.ts
// =============================================
// HELPER PARA CONVERSÃO camelCase ↔ snake_case
// =============================================

/**
 * Converte objeto do Supabase (snake_case) para TypeScript (camelCase)
 */
export function fromSnakeToCamel<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => fromSnakeToCamel(item)) as any;
  }

  const converted: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = obj[key];
    }
  }
  
  return converted;
}

/**
 * Converte objeto TypeScript (camelCase) para Supabase (snake_case)
 */
export function fromCamelToSnake<T = any>(obj: any): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => fromCamelToSnake(item)) as any;
  }

  const converted: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      converted[snakeKey] = obj[key];
    }
  }
  
  return converted;
}