
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Building2, Phone, ShieldCheck } from 'lucide-react';
import { BRAND_NAME, AGENT_WHATSAPP } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Propiedades', path: '/propiedades', icon: Building2 },
    { name: 'Admin', path: '/admin', icon: ShieldCheck },
  ];

  const isActive = (path: string) => location.pathname === path;

  const nameParts = BRAND_NAME.split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
                {firstName} <span className="text-amber-600">{restName}</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-gray-600 hover:text-amber-600'
                } transition-all duration-200 px-1 py-2 text-sm font-medium`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={`https://wa.me/${AGENT_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20"
            >
              Contactar
            </a>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t py-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${
                  isActive(link.path)
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium`}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            ))}
            <a
              href={`https://wa.me/${AGENT_WHATSAPP}`}
              className="w-full flex justify-center items-center bg-amber-600 text-white px-3 py-3 rounded-lg text-base font-medium mt-4"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
