import { Property } from '../types';
import { BRAND_NAME, AGENT_NAME } from '../constants';

export const updatePropertyMetaTags = (property: Property) => {
  const baseUrl = window.location.origin + window.location.pathname.split('#')[0];
  const propertyUrl = `${baseUrl}#/propiedad/${property.id}`;
  
  const formattedPrice = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price);

  const description = `${property.title} - ${formattedPrice} | ${property.location} | ${property.beds} Hab. ${property.baths} Baños | ${BRAND_NAME}`;
  const imageUrl = property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200';

  // Update or create Open Graph meta tags
  updateMetaTag('og:title', property.title);
  updateMetaTag('og:description', description);
  updateMetaTag('og:image', imageUrl);
  updateMetaTag('og:url', propertyUrl);
  updateMetaTag('og:type', 'property');

  // Update Twitter Card meta tags
  updateMetaTag('twitter:title', property.title);
  updateMetaTag('twitter:description', description);
  updateMetaTag('twitter:image', imageUrl);

  // Update standard meta tags
  updateMetaTag('description', description, 'name');

  // Update page title
  document.title = `${property.title} | ${BRAND_NAME}`;
};

export const resetMetaTags = () => {
  const defaultDescription = `Descubre propiedades exclusivas en México con ${BRAND_NAME}. Asesoría inmobiliaria personalizada por ${AGENT_NAME}`;
  const defaultImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200';

  updateMetaTag('og:title', `${BRAND_NAME} | Encuentra tu Propiedad Ideal`);
  updateMetaTag('og:description', defaultDescription);
  updateMetaTag('og:image', defaultImage);
  updateMetaTag('og:url', window.location.href);
  updateMetaTag('og:type', 'website');

  updateMetaTag('twitter:title', `${BRAND_NAME} | Encuentra tu Propiedad Ideal`);
  updateMetaTag('twitter:description', defaultDescription);
  updateMetaTag('twitter:image', defaultImage);

  updateMetaTag('description', defaultDescription, 'name');

  document.title = `${BRAND_NAME} | Agente Ejemplo`;
};

const updateMetaTag = (
  property: string,
  content: string,
  attr: 'property' | 'name' = 'property'
) => {
  let element = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, property);
    document.head.appendChild(element);
  }

  element.content = content;
};
