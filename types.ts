
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  beds: number;
  baths: number;
  sqftConstruction: number;
  sqftLand: number;
  parking: number;
  images: string[];
  videoUrl?: string;
  status: 'Available' | 'Sold' | 'Reserved';
  isActive: boolean;
  createdAt: number;
}

export interface Lead {
  id: string;
  propertyId?: string;
  propertyName?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: number;
  status: 'New' | 'Contacted' | 'Closed';
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
