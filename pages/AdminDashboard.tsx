
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Users, Plus, 
  Trash2, Edit, ExternalLink, Mail, Phone, 
  CheckCircle, LogOut, X, Save, Image as ImageIcon, Upload, 
  Ruler, LayoutDashboard, ArrowRight, Eye, EyeOff, TrendingUp, Home
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { Property, Lead } from '../types';
import { BRAND_NAME, AGENT_NAME } from '../constants';

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'leads'>('dashboard');
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setProperties(await storageService.getProperties());
    setLeads(storageService.getLeads());
  };

  // Delete confirmation modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const promptDeleteProperty = (id: string) => {
    setPendingDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (pendingDeleteId) {
      await storageService.deleteProperty(pendingDeleteId);
      setPendingDeleteId(null);
      setDeleteConfirmOpen(false);
      await refreshData();
    }
  };

  const cancelDeleteProperty = () => {
    setPendingDeleteId(null);
    setDeleteConfirmOpen(false);
  };

  const handleUpdateLeadStatus = (id: string, status: Lead['status']) => {
    storageService.updateLeadStatus(id, status);
    refreshData();
  };

  const openModal = (property?: Property) => {
    if (property) {
      setEditingProperty({ ...property });
    } else {
      setEditingProperty({
        id: `prop-${Date.now()}`,
        title: '',
        // price intentionally omitted so the input can start blank for new properties
        location: '',
        description: '',
        beds: undefined,
        baths: undefined,
        sqftConstruction: undefined,
        sqftLand: undefined,
        parking: undefined,
        images: [],
        status: 'Available',
        isActive: true, // Default to active for new properties
        createdAt: Date.now()
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure title exists and price has been provided (allow 0 as a valid price)
    if (editingProperty && editingProperty.title && editingProperty.price !== undefined) {
      const propertyToSave: Property = {
        id: editingProperty.id!,
        title: editingProperty.title,
        price: editingProperty.price ?? 0,
        location: editingProperty.location ?? '',
        description: editingProperty.description ?? '',
        beds: editingProperty.beds ?? 0,
        baths: editingProperty.baths ?? 0,
        sqftConstruction: editingProperty.sqftConstruction ?? 0,
        sqftLand: editingProperty.sqftLand ?? 0,
        parking: editingProperty.parking ?? 0,
        images: editingProperty.images ?? [],
        status: editingProperty.status ?? 'Available',
        isActive: editingProperty.isActive ?? true,
        createdAt: editingProperty.createdAt ?? Date.now()
      };
      await storageService.saveProperty(propertyToSave);
      setIsModalOpen(false);
      setEditingProperty(null);
      await refreshData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Images => {
      setEditingProperty(prev => ({
        ...prev!,
        images: [...(prev?.images || []), ...base64Images]
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  const removeImage = (index: number) => {
    setEditingProperty(prev => ({
      ...prev!,
      images: (prev?.images || []).filter((_, i) => i !== index)
    }));
  };

  // Dashboard Stats
  const activePropsCount = properties.filter(p => p.status === 'Available' && p.isActive).length;
  const totalLeadsCount = leads.length;
  const totalPropsCount = properties.length;
  const recentLeads = leads.slice(0, 4);
  const recentProps = properties.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="bg-amber-600 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-amber-600/20">P</div>
          <span className="text-xl font-bold tracking-tight text-gray-800">{BRAND_NAME.split(' ')[0]} <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-500 ml-1 font-mono align-middle uppercase">Admin</span></span>          </div>        <nav className="hidden md:flex items-center space-x-1 bg-amber-50/50 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'dashboard' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('properties')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'properties' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Home className="h-4 w-4" />
            <span>Propiedades</span>
          </button>
          <button 
            onClick={() => setActiveTab('leads')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'leads' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Users className="h-4 w-4" />
            <span>Leads</span>
          </button>
        </nav>

        <div className="flex items-center space-x-6 text-sm font-bold text-gray-500">
          <a href="#" target="_blank" className="flex items-center space-x-1 hover:text-amber-600 transition">
            <ExternalLink className="h-4 w-4" />
            <span>Ver Sitio</span>
          </a>
          <button onClick={onLogout} className="flex items-center space-x-1 hover:text-red-600 transition">
            <LogOut className="h-4 w-4" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <main className="flex-grow p-8 max-w-[1400px] mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Welcome Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {AGENT_NAME}</h1>
              <p className="text-gray-500 mt-1">Panel de administración de {BRAND_NAME}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Propiedades Activas</p>
                  <p className="text-4xl font-bold text-gray-900">{activePropsCount}</p>
                </div>
                <div className="bg-amber-100 h-14 w-14 rounded-2xl flex items-center justify-center text-amber-600">
                  <Home className="h-8 w-8" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Leads</p>
                  <p className="text-4xl font-bold text-gray-900">{totalLeadsCount}</p>
                </div>
                <div className="bg-blue-100 h-14 w-14 rounded-2xl flex items-center justify-center text-blue-600">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Propiedades</p>
                  <p className="text-4xl font-bold text-gray-900">{totalPropsCount}</p>
                </div>
                <div className="bg-green-100 h-14 w-14 rounded-2xl flex items-center justify-center text-green-600">
                  <TrendingUp className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Leads Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-bold text-gray-900">Leads Recientes</h2>
                  <button onClick={() => setActiveTab('leads')} className="text-gray-500 text-sm font-bold flex items-center hover:text-amber-600 transition">
                    Ver todos <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 space-y-3">
                  {recentLeads.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 italic">No hay leads registrados aún.</div>
                  ) : (
                    recentLeads.map(l => (
                      <div key={l.id} className="bg-gray-50/80 p-6 rounded-[28px] border border-gray-100 group hover:bg-white hover:border-amber-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-gray-900">{l.name}</h3>
                          <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center">
                            <ImageIcon className="h-3 w-3 mr-1" /> {new Date(l.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                          <span className="flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-100">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> {l.phone}
                          </span>
                          <span className="flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-100">
                            <Mail className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> {l.email}
                          </span>
                        </div>
                        {l.propertyName && (
                          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-tight bg-amber-50 px-3 py-1 rounded-lg inline-block">
                            Interesado en: {l.propertyName}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Actions & Recent Properties */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 px-2">Acciones Rápidas</h2>
                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 space-y-3">
                    <button 
                      onClick={() => openModal()}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-5 rounded-[24px] flex items-center justify-center space-x-3 transition shadow-lg shadow-amber-500/20"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Agregar Nueva Propiedad</span>
                    </button>
                    <button 
                      onClick={async () => {
                        if (!confirm('¿Deseas migrar los datos locales al servidor (supabase)? Esta acción puede sobrescribir datos en la base de datos.')) return;
                        const props = JSON.parse(localStorage.getItem('prosper_properties') || '[]');
                        const adminPass = typeof window !== 'undefined' ? localStorage.getItem('admin_pass') : null;
                        try {
                          const res = await fetch('/api/migrate', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(adminPass ? { 'x-admin-pass': adminPass } : {}) }, body: JSON.stringify(props) });
                          if (!res.ok) throw new Error('Migration failed');
                          const data = await res.json();
                          alert(`Migración completada: ${data.inserted || 'ok'}`);
                          refreshData();
                        } catch (err) {
                          alert('Migración fallida. Revisa la consola para más detalles.');
                          console.error(err);
                        }
                      }}
                      className="w-full bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 font-bold py-5 rounded-[24px] flex items-center justify-center space-x-3 transition shadow-sm"
                    >
                      <Users className="h-5 w-5" />
                      <span>Migrar Datos</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('leads')}
                      className="w-full hidden md:inline bg-white border border-gray-100 hover:bg-gray-50 text-gray-700 font-bold py-5 rounded-[24px] flex items-center justify-center space-x-3 transition shadow-sm"
                    >
                      <Users className="h-5 w-5" />
                      <span>Ver Todos los Leads</span>
                    </button>
                  </div>
                </div>

                {/* Recent Properties */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-xl font-bold text-gray-900">Propiedades Recientes</h2>
                    <button onClick={() => setActiveTab('properties')} className="text-gray-500 text-sm font-bold flex items-center hover:text-amber-600 transition">
                      Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                  <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 space-y-3">
                    {recentProps.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-[24px] hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                        <div className="flex items-center space-x-3">
                          <img src={p.images[0]} className="h-14 w-14 rounded-2xl object-cover" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</p>
                            <p className="text-amber-600 font-bold text-xs">${p.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
                          p.isActive 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                          {p.isActive ? 'Activa' : 'Oculta'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Gestión de Propiedades</h2>
              <button 
                onClick={() => openModal()}
                className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-amber-700 transition shadow-lg shadow-amber-600/10"
              >
                <Plus className="h-5 w-5" />
                <span>Nueva Propiedad</span>
              </button>
            </div>
            
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Propiedad</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Visibilidad</th>
                    <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <img src={p.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                          <div>
                            <p className="font-bold text-gray-900">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-900">${p.price.toLocaleString()}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.isActive 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}>
                          {p.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          <span>{p.isActive ? 'Pública' : 'Oculta'}</span>
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => openModal(p)} className="p-3 text-gray-400 hover:bg-white hover:text-amber-600 hover:shadow-sm rounded-xl transition">
                            <Edit className="h-5 w-5" />
                          </button>
                          <button onClick={() => promptDeleteProperty(p.id)} className="p-3 text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-xl transition">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Prospectos & Leads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {leads.map(l => (
                <div key={l.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{l.name}</h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{l.status}</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p className="flex items-center font-medium"><Mail className="h-4 w-4 mr-2 text-amber-500" /> {l.email}</p>
                      <p className="flex items-center font-medium"><Phone className="h-4 w-4 mr-2 text-amber-500" /> {l.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-[28px] text-gray-700 text-sm leading-relaxed border border-gray-100">
                      "{l.message}"
                    </div>
                    {l.propertyName && (
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-widest pt-2">Interés en: {l.propertyName}</p>
                    )}
                  </div>
                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleString()}</span>
                    <button 
                      onClick={() => handleUpdateLeadStatus(l.id, 'Contacted')}
                      className="bg-gray-100 hover:bg-amber-600 hover:text-white px-6 py-2.5 rounded-xl font-bold text-xs transition"
                    >
                      Marcar Contactado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Property Modal */}
      {isModalOpen && editingProperty && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-100">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-bold font-serif text-gray-900">
                {editingProperty.id && properties.some(p => p.id === editingProperty.id) ? 'Editar Propiedad' : 'Nueva Propiedad'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-50 rounded-2xl transition">
                <X className="h-7 w-7 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProperty} className="p-10 overflow-y-auto space-y-8 bg-white no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visibility Toggle */}
                <div className="md:col-span-2 flex items-center justify-between bg-amber-50 p-6 rounded-3xl border border-amber-100">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-gray-900">Publicar Propiedad</p>
                    <p className="text-xs text-gray-500">Define si la propiedad es visible para el público.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProperty({...editingProperty, isActive: !editingProperty.isActive})}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-amber-500/0 focus:ring-amber-500/40 ${
                      editingProperty.isActive ? 'bg-amber-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        editingProperty.isActive ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Título de la Propiedad</label>
                  <input
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all font-bold text-lg"
                    placeholder="Ej: Residencia Moderna en Las Misiones"
                    value={editingProperty.title}
                    onChange={e => setEditingProperty({...editingProperty, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Precio (MXN)</label>
                  <input
                    required
                    type="number"
                    placeholder="Ej: 3,500,000"
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all font-bold"
                    value={
                      // Show an empty field while creating a new property (price undefined).
                      editingProperty.price === undefined ? '' : editingProperty.price
                    }
                    onChange={e => setEditingProperty({...editingProperty, price: e.target.value === '' ? undefined : Number(e.target.value) as number})} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ubicación</label>
                  <input
                    required
                    className="w-full px-6 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all font-bold"
                    placeholder="Ciudad, Estado"
                    value={editingProperty.location}
                    onChange={e => setEditingProperty({...editingProperty, location: e.target.value})}
                  />
                </div>
                
                {/* Specs Section */}
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 gap-4 bg-[#F8F9FA] p-8 rounded-[32px] border border-gray-100">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Hab.</label>
                    <input
                      type="number"
                      className="w-full px-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 text-center font-bold"
                      value={editingProperty.beds === undefined ? '' : editingProperty.beds}
                      onChange={e => setEditingProperty({...editingProperty, beds: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Baños</label>
                    <input
                      type="number"
                      className="w-full px-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 text-center font-bold"
                      value={editingProperty.baths === undefined ? '' : editingProperty.baths}
                      onChange={e => setEditingProperty({...editingProperty, baths: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Const. M2</label>
                    <input
                      type="number"
                      className="w-full px-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 text-center font-bold"
                      value={editingProperty.sqftConstruction === undefined ? '' : editingProperty.sqftConstruction}
                      onChange={e => setEditingProperty({...editingProperty, sqftConstruction: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Terr. M2</label>
                    <input
                      type="number"
                      className="w-full px-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 text-center font-bold"
                      value={editingProperty.sqftLand === undefined ? '' : editingProperty.sqftLand}
                      onChange={e => setEditingProperty({...editingProperty, sqftLand: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Estac.</label>
                    <input
                      type="number"
                      className="w-full px-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 text-center font-bold"
                      value={editingProperty.parking === undefined ? '' : editingProperty.parking}
                      onChange={e => setEditingProperty({...editingProperty, parking: e.target.value === '' ? undefined : Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Descripción Detallada</label>
                  <textarea
                    rows={5}
                    className="w-full px-6 py-5 rounded-2xl border border-gray-200 bg-white text-gray-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all resize-none font-medium leading-relaxed"
                    placeholder="Describe los acabados, amenidades y detalles de la propiedad..."
                    value={editingProperty.description}
                    onChange={e => setEditingProperty({...editingProperty, description: e.target.value})}
                  />
                </div>

                {/* Image Upload Area */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-amber-500" />
                    Galería de Imágenes
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 p-6 border border-gray-100 rounded-[32px] bg-[#F8F9FA]">
                    {editingProperty.images?.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-[20px] overflow-hidden border border-white shadow-sm ring-1 ring-gray-100 bg-white">
                        <img src={img} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-[20px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-all bg-white hover:bg-amber-50 group"
                    >
                      <Upload className="h-7 w-7 mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Subir Foto</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="pt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-5 rounded-2xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 text-white px-8 py-5 rounded-2xl font-bold hover:bg-amber-700 transition flex items-center justify-center space-x-2 shadow-2xl shadow-amber-600/30"
                >
                  <Save className="h-6 w-6" />
                  <span>Guardar Propiedad</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirmOpen && pendingDeleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 flex items-start space-x-4">
              <div className="bg-amber-50 p-3 rounded-md">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Confirmar eliminación</h3>
                <p className="text-sm text-gray-500 mt-2">¿Estás seguro que deseas eliminar esta propiedad? Esta acción no se puede deshacer.</p>
              </div>
            </div>
            <div className="p-4 pt-0 flex justify-end space-x-3 border-t border-gray-100">
              <button onClick={cancelDeleteProperty} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Cancelar</button>
              <button onClick={confirmDeleteProperty} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Eliminar</button>
            </div>
          </div>
        </div>
      )}    </div>
  );
};

export default AdminDashboard;
