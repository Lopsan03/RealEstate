
import { Property, Lead } from '../types';
import { INITIAL_PROPERTIES } from '../constants';

const PROPERTIES_KEY = 'prosper_properties';
const LEADS_KEY = 'prosper_leads';

export const storageService = {
  getProperties: (): Property[] => {
    const data = localStorage.getItem(PROPERTIES_KEY);
    if (!data) {
      localStorage.setItem(PROPERTIES_KEY, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    return JSON.parse(data);
  },

  saveProperty: (property: Property) => {
    const props = storageService.getProperties();
    const index = props.findIndex(p => p.id === property.id);
    if (index >= 0) {
      props[index] = property;
    } else {
      props.push(property);
    }
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(props));
  },

  deleteProperty: (id: string) => {
    const props = storageService.getProperties();
    const filtered = props.filter(p => p.id !== id);
    localStorage.setItem(PROPERTIES_KEY, JSON.stringify(filtered));
  },

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
