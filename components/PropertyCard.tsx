
import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <Link to={`/propiedad/${property.id}`} className="relative h-64 overflow-hidden block">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-amber-700 uppercase tracking-wider">
          {property.status === 'Available' ? 'Disponible' : property.status}
        </div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-2xl font-bold drop-shadow-md">{formattedPrice}</p>
        </div>
      </Link>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-gray-500 text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="truncate">{property.location}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full uppercase">
              {property.listingType}
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-full uppercase">
              {property.propertyType}
            </span>
          </div>
        </div>
        <Link to={`/propiedad/${property.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
          {property.description}
        </p>
        
        <div className="mt-auto pt-6 border-t border-gray-50 grid grid-cols-2 gap-y-3 text-gray-600">
          <div className="flex items-center space-x-1">
            <Bed className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">{property.beds} Hab.</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium">{property.baths} Baños</span>
          </div>
          <div className="flex items-center space-x-1 col-span-2">
            <Square className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium">
              {property.sqftConstruction} m² Const. / {property.sqftLand} m² Terr.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
