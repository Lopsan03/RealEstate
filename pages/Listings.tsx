
import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { storageService } from '../services/storageService';
import { Property } from '../types';

const Listings: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('All');

  useEffect(() => {
    setProperties(storageService.getProperties());
  }, []);

  const filteredProperties = properties.filter(p => {
    // Only show active properties on the public listings page
    if (!p.isActive) return false;

    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMinPrice = minPrice === '' || p.price >= Number(minPrice);
    const matchesMaxPrice = maxPrice === '' || p.price <= Number(maxPrice);
    const matchesBeds = minBeds === 'All' || p.beds >= Number(minBeds);

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesBeds;
  });

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinBeds('All');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">Nuestras Propiedades</h1>
          <p className="text-gray-500 text-lg">Encuentra la ubicación perfecta para tu próxima inversión.</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="Busca por título o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl transition font-bold border ${
                showFilters ? 'bg-amber-600 text-white border-amber-600' : 'bg-gray-100 text-gray-700 border-gray-100 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>{showFilters ? 'Ocultar Filtros' : 'Filtros'}</span>
            </button>
          </div>

          {/* Expanded Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Precio Mínimo (MXN)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-sm"
                    placeholder="Eje: 5,000,000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Precio Máximo (MXN)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-sm"
                    placeholder="Eje: 15,000,000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Recámaras</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-amber-500 outline-none text-sm bg-white"
                    value={minBeds}
                    onChange={(e) => setMinBeds(e.target.value)}
                  >
                    <option value="All">Cualquiera</option>
                    <option value="1">1+ Habitaciones</option>
                    <option value="2">2+ Habitaciones</option>
                    <option value="3">3+ Habitaciones</option>
                    <option value="4">4+ Habitaciones</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center space-x-2 text-red-500 font-bold hover:bg-red-50 px-4 py-2.5 rounded-xl transition"
                  >
                    <X className="h-4 w-4" />
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="mb-8">
          <p className="text-gray-500 font-medium">Mostrando {filteredProperties.length} propiedades</p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No encontramos resultados</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda o filtros.</p>
              <button 
                onClick={clearFilters}
                className="mt-4 text-amber-600 font-bold hover:underline"
              >
                Ver todas las propiedades
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Listings;
