
import { Property, Lead } from '../types';
import { INITIAL_PROPERTIES } from '../constants';

const PROPERTIES_KEY = 'prosper_properties';
const LEADS_KEY = 'prosper_leads';

const getAdminPass = () => typeof window !== 'undefined' ? localStorage.getItem('admin_pass') : null;

export const storageService = {
  getProperties: async (): Promise<Property[]> => {
    try {
      const res = await fetch('/api/properties');
      if (!res.ok) throw new Error('Network');
      const data = await res.json();
      return data as Property[];
    } catch (err) {
      // fallback to localStorage
      const data = localStorage.getItem(PROPERTIES_KEY);
      if (!data) {
        localStorage.setItem(PROPERTIES_KEY, JSON.stringify(INITIAL_PROPERTIES));
        return INITIAL_PROPERTIES;
      }
      return JSON.parse(data);
    }
  },

  saveProperty: async (property: Property) => {
    const adminPass = getAdminPass();
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminPass ? { 'x-admin-pass': adminPass } : {})
        },
        body: JSON.stringify(property)
      });
      if (!res.ok) throw new Error('Network');
      const updated = await res.json();
      return updated as Property;
    } catch (err) {
      // fallback to localStorage
      const props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
      const index = props.findIndex((p: Property) => p.id === property.id);
      if (index >= 0) props[index] = property; else props.push(property);
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(props));
      return property;
    }
  },

  deleteProperty: async (id: string) => {
    const adminPass = getAdminPass();
    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          ...(adminPass ? { 'x-admin-pass': adminPass } : {})
        }
      });
      if (!res.ok) throw new Error('Network');
      return true;
    } catch (err) {
      const props = JSON.parse(localStorage.getItem(PROPERTIES_KEY) || '[]');
      const filtered = props.filter((p: Property) => p.id !== id);
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  // Leads remain local for now
  getLeads: (): Lead[] => {
    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveLead: (lead: Lead) => {
    const leads = storageService.getLeads();
    leads.unshift(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  },

  updateLeadStatus: (id: string, status: Lead['status']) => {
    const leads = storageService.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index >= 0) {
      leads[index].status = status;
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    }
  }
};
