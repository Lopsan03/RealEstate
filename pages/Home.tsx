
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin, Award, Heart } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import ContactForm from '../components/ContactForm';
import { storageService } from '../services/storageService';
import { Property } from '../types';
import { AGENT_NAME, AGENT_WHATSAPP, BRAND_NAME } from '../constants';

const Home: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const props = await storageService.getProperties();
      setFeaturedProperties(props.filter(p => p.isActive).slice(0, 3));
    };
    fetchProperties();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img
            src="/hero-background.jpg"
            alt="Real Estate Luxury"
            className="w-full h-full object-cover brightness-[0.4]"
            onLoad={(e) => (e.currentTarget.parentElement?.classList.add('opacity-100'))}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block bg-amber-600/20 backdrop-blur-sm border border-amber-500/30 text-amber-500 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-widest animate-pulse">
              Experiencia & Confianza
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Encuentra el <span className="text-amber-500 italic">Hogar</span> de tus Sueños.
            </h1>
            <p className="text-xl text-gray-200 max-w-xl leading-relaxed">
              En {BRAND_NAME}, acompañamos tu camino hacia la propiedad ideal en México con un servicio personalizado y exclusivo de {AGENT_NAME}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/propiedades"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-500 hover:text-white transition flex items-center justify-center group shadow-xl"
              >
                Ver Propiedades
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`https://wa.me/${AGENT_WHATSAPP}`}
                className="bg-amber-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-amber-700 transition flex items-center justify-center shadow-xl shadow-amber-600/20"
              >
                WhatsApp Directo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-amber-600 font-serif">10+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Años de Exp.</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-600 font-serif">150M+</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Ventas Totales</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-amber-600 font-serif">24/7</p>
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Soporte Local</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Propiedades Destacadas</h2>
              <p className="text-gray-500 max-w-xl">
                Selección exclusiva de residencias que destacan por su diseño, ubicación y plusvalía.
              </p>
            </div>
            <Link to="/propiedades" className="text-amber-600 font-bold flex items-center hover:text-amber-700 transition">
              Ver todo el catálogo <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
              alt={AGENT_NAME}
              className="rounded-3xl shadow-2xl z-10 relative"
            />
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-amber-500 rounded-3xl -z-0 opacity-10"></div>
          </div>
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
              Asesoría Inmobiliaria de <span className="text-amber-600">Alto Nivel</span> en México
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Hola, soy <strong>{AGENT_NAME}</strong>. Mi misión es facilitar el proceso de compra y venta de propiedades, asegurando transparencia, ética y los mejores resultados financieros para mis clientes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Atención personalizada 1 a 1",
                "Experta en mercado de lujo",
                "Red de contactos nacional",
                "Gestión de trámites legales",
                "Marketing digital avanzado",
                "Valuación comercial real"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-amber-500" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
               <a
                href={`https://wa.me/${AGENT_WHATSAPP}`}
                className="inline-flex bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-amber-600 transition shadow-lg"
              >
                Agenda una Cita
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Form */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">¿Interesado en Vender o Comprar?</h2>
          <p className="text-gray-400 mb-12 text-lg">
            Déjanos tus datos y nos pondremos en contacto contigo en menos de 24 horas para platicar sobre tus objetivos.
          </p>
          <div className="bg-white rounded-3xl p-8 md:p-12 text-left text-gray-900 shadow-2xl">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
