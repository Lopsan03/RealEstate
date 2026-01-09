
import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Lead } from '../types';
import { AGENT_NAME } from '../constants';

interface ContactFormProps {
  propertyId?: string;
  propertyName?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ propertyId, propertyName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      propertyId,
      propertyName,
      ...formData,
      createdAt: Date.now(),
      status: 'New'
    };

    // Simulate network delay
    setTimeout(() => {
      storageService.saveLead(newLead);
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center animate-in fade-in duration-500">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-900 mb-2">¡Mensaje Enviado!</h3>
        <p className="text-green-700">{AGENT_NAME} se pondrá en contacto contigo muy pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
            placeholder="Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp / Teléfono</label>
            <input
              required
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              placeholder="81XXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              required
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
            placeholder={propertyName ? `Estoy interesado en ${propertyName}...` : "Hola, me gustaría recibir más información..."}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          />
        </div>
      </div>

      <button
        disabled={isSubmitting}
        type="submit"
        className="w-full bg-amber-600 text-white font-bold py-4 rounded-xl hover:bg-amber-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg shadow-amber-600/20"
      >
        {isSubmitting ? (
          <span>Enviando...</span>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Enviar Información</span>
          </>
        )}
      </button>
      <p className="text-xs text-center text-gray-400 mt-4">
        Al hacer clic en enviar, aceptas nuestra política de privacidad.
      </p>
    </form>
  );
};

export default ContactForm;
