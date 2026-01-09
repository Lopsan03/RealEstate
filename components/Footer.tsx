
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { BRAND_NAME, AGENT_NAME, AGENT_PHONE, AGENT_EMAIL } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-serif tracking-tight">
               {BRAND_NAME.split(' ')[0]} <span className="text-amber-500">{BRAND_NAME.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Tu aliado estratégico en el mercado inmobiliario mexicano. Expertos en propiedades residenciales y de lujo.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-600 transition"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-600 transition"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-600 transition"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-white/10 pb-2 inline-block">Enlaces Rápidos</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/" className="hover:text-amber-500 transition">Inicio</Link></li>
              <li><Link to="/propiedades" className="hover:text-amber-500 transition">Ver Propiedades</Link></li>
              <li><a href="#" className="hover:text-amber-500 transition">Servicios</a></li>
              <li><a href="#" className="hover:text-amber-500 transition">Sobre Nosotros</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-white/10 pb-2 inline-block">Contacto Directo</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-amber-500" />
                <span>+52 {AGENT_PHONE}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-amber-500" />
                <span className="break-all">{AGENT_EMAIL}</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-amber-500 mt-1" />
                <span>Monterrey, NL / San Pedro Garza García</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition">Aviso de Privacidad</a>
            <a href="#" className="hover:text-white transition">Términos y Condiciones</a>
          </div>
          <p>By {AGENT_NAME}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
