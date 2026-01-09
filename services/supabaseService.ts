import { supabase, hasSupabase } from './supabaseClient';
import { Property, Lead } from '../types';

const BUCKET = 'property-images';

export const supabaseService = {
  isEnabled: () => hasSupabase,

  async getProperties(): Promise<Property[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) {
      console.error('supabase getProperties error', error);
      return [];
    }
    return (data || []) as Property[];
  },

  async getLeads(): Promise<Lead[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('leads').select('*').order('createdAt', { ascending: false });
    if (error) {
      console.error('supabase getLeads error', error);
      return [];
    }
    return (data || []) as Lead[];
  },

  async saveProperty(property: Property): Promise<void> {
    if (!supabase) return;

    // upload any data URLs in images to storage and replace with public URLs
    const uploadedImages: string[] = [];

  // Check if this is a new property (has "prop-" prefix) - let Supabase generate UUID
  const isNewProperty = property.id.startsWith('prop-');
  const propertyId = isNewProperty ? undefined : property.id;

    for (let i = 0; i < (property.images || []).length; i++) {
      const img = property.images[i];
      if (img && img.startsWith('data:')) {
        try {
          const blob = await (await fetch(img)).blob();
          const ext = blob.type.split('/')[1] || 'jpg';
          const filename = `${property.id}/${Date.now()}-${i}.${ext}`;
          const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filename, blob, { upsert: true });
          if (uploadError) {
            console.error('upload error', uploadError);
            continue;
          }
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
          uploadedImages.push(urlData.publicUrl);
        } catch (err) {
          console.error('image upload failed', err);
        }
      } else if (img) {
        uploadedImages.push(img);
      }
    }

    const toSave = { ...property, id: propertyId, images: uploadedImages };

    const { error } = await supabase.from('properties').upsert(toSave as any);
    if (error) {
      console.error('supabase saveProperty error', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      console.error('Data being saved:', toSave);
    }
  },

  async deleteProperty(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) console.error('supabase deleteProperty error', error);
  },

  async saveLead(lead: Lead): Promise<void> {
    if (!supabase) return;
    const isNewLead = typeof lead.id === 'string' && lead.id.startsWith('lead-');
    const toInsert = { ...lead } as any;
    if (isNewLead || toInsert.id === undefined) {
      delete toInsert.id; // let Supabase default generate UUID
    }
    const { error } = await supabase.from('leads').insert([toInsert]);
    if (error) {
      console.error('supabase saveLead error', error);
      console.error('Full error details (lead):', JSON.stringify(error, null, 2));
      console.error('Lead payload:', toInsert);
    }
  },

  async updateLeadStatus(id: string, status: Lead['status']): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('leads').update({ status }).eq('id', id);
    if (error) console.error('supabase updateLeadStatus error', error);
  },

  // Subscribe to realtime events for properties and leads
  subscribeToProperties(cb: (payload: any) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const channel = supabase.channel('public:properties').on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, (payload) => cb(payload)).subscribe();
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  subscribeToLeads(cb: (payload: any) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const channel = supabase.channel('public:leads').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => cb(payload)).subscribe();
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  }
};
