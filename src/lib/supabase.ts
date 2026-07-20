import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Safe client creation or mock fallback
let supabaseClient: any;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn("Supabase credentials missing. Falling back to local storage mock client.");
  
  // Minimal mock client for the custom_users authentication
  supabaseClient = {
    from: (table: string) => {
      if (table === 'custom_users') {
        return {
          insert: async (rows: any[]) => {
            const users = JSON.parse(localStorage.getItem('mock_custom_users') || '[]');
            const newRow = { 
              id: Math.random().toString(36).substring(2, 9), 
              created_at: new Date().toISOString(),
              ...rows[0] 
            };
            
            // Check for unique email
            if (users.some((u: any) => u.email === newRow.email)) {
              return { 
                data: null, 
                error: { code: '23505', message: 'User already exists' } 
              };
            }
            
            users.push(newRow);
            localStorage.setItem('mock_custom_users', JSON.stringify(users));
            
            return {
              select: () => ({
                single: async () => ({ data: newRow, error: null })
              })
            };
          },
          select: (fields: string) => {
            return {
              eq: (field1: string, val1: any) => {
                return {
                  eq: (field2: string, val2: any) => {
                    return {
                      single: async () => {
                        const users = JSON.parse(localStorage.getItem('mock_custom_users') || '[]');
                        const user = users.find((u: any) => u[field1] === val1 && u[field2] === val2);
                        if (!user) {
                          return { data: null, error: { message: 'Invalid email or password.' } };
                        }
                        return { data: user, error: null };
                      }
                    };
                  }
                };
              }
            };
          }
        };
      }
      
      // Fallback empty operations for other tables
      return {
        insert: async () => ({ data: null, error: new Error('Supabase URL/Key missing. Mock table not fully implemented.') }),
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: new Error('Supabase URL/Key missing.') })
            })
          })
        })
      };
    }
  };
}

export const supabase = supabaseClient;

