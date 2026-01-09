
import { Property, Lead } from '../types';
import { INITIAL_PROPERTIES } from '../constants';

const PROPERTIES_KEY = 'prosper_properties';
const LEADS_KEY = 'prosper_leads';

const getAdminPass = () => typeof window !== 'undefined' ? localStorage.getItem('admin_pass') : null;

export const storageService = {
  // Properties
  async getProperties(): Promise<Property[]> {
    // If Supabase is available, use it
    const sup = await import('./supabaseService').then(m => m.supabaseService).catch(() => null);
    if (sup && sup.isEnabled()) return sup.getProperties();

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

  async saveProperty(property: Property) {
    const sup = await import('./supabaseService').then(m => m.supabaseService).catch(() => null);
    if (sup && sup.isEnabled()) return sup.saveProperty(property);

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

  async deleteProperty(id: string) {
    const sup = await import('./supabaseService').then(m => m.supabaseService).catch(() => null);
    if (sup && sup.isEnabled()) return sup.deleteProperty(id);

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

  // Leads
  async getLeads(): Promise<Lead[]> {
    const sup = await import('./supabaseService').then(m => m.supabaseService).catch(() => null);
    if (sup && sup.isEnabled()) return sup.getLeads();

    const data = localStorage.getItem(LEADS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async saveLead(lead: Lead) {
    const sup = await import('./supabaseService').then(m => m.supabaseService).catch(() => null);
    if (sup && sup.isEnabled()) return sup.saveLead(lead);

    const leads = await storageService.getLeads();
    leads.unshift(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  },

  async updateLeadStatus(id: string, status: Lead['status']) {
    const sup = await import('./supabaseService').then(m => m.supabaseService).catch(() => null);
    if (sup && sup.isEnabled()) return sup.updateLeadStatus(id, status);

    const leads = await storageService.getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index >= 0) {
      leads[index].status = status;
      localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    }
  }
};
