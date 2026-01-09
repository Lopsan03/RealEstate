
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bed, Bath, Square, Car, MapPin, 
  Share2, FileText, MessageCircle, Check, Ruler,
  ChevronLeft, ChevronRight, Download, Qrcode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { storageService } from '../services/storageService';
import { Property } from '../types';
import ContactForm from '../components/ContactForm';
import { AGENT_NAME, AGENT_PHONE, AGENT_WHATSAPP, AGENT_EMAIL, BRAND_NAME } from '../constants';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const qrWrapperRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (id) {
      const p = storageService.getProperties().find(item => item.id === id);
      if (p) setProperty(p);
    }
  }, [id]);

  // Generate QR via public QR API (fallback to serializing rendered SVG)
  const fetchQrDataUrl = async (url: string) => {
    setQrLoading(true);
    try {
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('QR API failed');
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      setQrDataUrl(dataUrl);
      return dataUrl;
    } catch (err) {
      // fallback: try to serialize the existing SVG in the DOM
      try {
        const el = qrWrapperRef.current?.querySelector('svg');
        if (el) {
          const svgStr = new XMLSerializer().serializeToString(el);
          // convert to PNG via canvas
          const img = new Image();
          const svgData = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr);
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = svgData;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 300;
          canvas.height = img.height || 300;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
          const png = canvas.toDataURL('image/png');
          setQrDataUrl(png);
          return png;
        }
      } catch (err) {
        // ignore
      }
    } finally {
      setQrLoading(false);
    }
    return null;
  };

  useEffect(() => {
    // create QR for current property page
    fetchQrDataUrl(window.location.href).catch(() => {});
  }, [id]);

  const downloadQr = async () => {
    let dataUrl = qrDataUrl;
    if (!dataUrl) dataUrl = await fetchQrDataUrl(window.location.href);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${property?.id || 'property'}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Propiedad no encontrada</h2>
          <Link to="/propiedades" className="text-amber-600 hover:underline">Volver al catálogo</Link>
        </div>
      </div>
    );
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const generateFicha = () => {
    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) return;

    const images = property?.images?.length > 0 ? property.images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80'];
    const formatPrice = (price: number | undefined) => {
      if (price === undefined) return '';
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    };

    const propertyUrl = window.location.href;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(propertyUrl)}`;

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Ficha Técnica - ${property?.title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#333; background:#fff}
  .container{max-width:860px;margin:0 auto;padding:36px}
  .header{text-align:center;padding-bottom:20px;border-bottom:3px solid #f59e0b;margin-bottom:26px}
  .logo{width:56px;height:56px;background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px}
  .logo-text{color:#fff;font-weight:700;font-size:22px}
  .brand{font-size:22px;font-weight:700;color:#111;margin-bottom:6px}
  .brand-sub{font-size:12px;color:#6b6b6b;letter-spacing:2px;text-transform:uppercase}
  .property-title{font-size:22px;font-weight:700;color:#111;margin-bottom:4px}
  .property-price{font-size:28px;font-weight:700;color:#f59e0b;margin-bottom:8px}
  .property-location{color:#6b6b6b;font-size:14px;margin-bottom:18px}
  .images{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:20px 0}
  .images img{width:100%;height:220px;object-fit:cover;border-radius:8px}
  .images img:first-child{grid-column:1/-1;height:320px}
  .section{margin:20px 0}
  .section-title{font-size:16px;font-weight:700;color:#111;border-bottom:2px solid #f59e0b;padding-bottom:8px;margin-bottom:12px}
  .features{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px}
  .feature{background:#fafafa;padding:12px;border-radius:8px;text-align:center}
  .feature .value{font-weight:700;font-size:20px;color:#111}
  .feature .label{font-size:12px;color:#6b6b6b;text-transform:uppercase;margin-top:6px}
  .description{color:#555;line-height:1.7;white-space:pre-line}
  .agent{background:linear-gradient(135deg,#111 0%,#333 100%);color:#fff;padding:18px;border-radius:12px;margin-top:22px}
  .agent .title{font-size:12px;color:#f59e0b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
  .agent .name{font-size:18px;font-weight:700;margin-bottom:12px}
  .agent .contacts{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .contact-item{display:flex;gap:10px;align-items:center}
  .contact-icon{width:38px;height:38px;border-radius:8px;background:rgba(245,158,11,0.12);display:inline-flex;align-items:center;justify-content:center}
  .footer{margin-top:28px;border-top:1px solid #eee;padding-top:16px;color:#777;font-size:12px;text-align:center}
  .print-btn{position:fixed;right:28px;bottom:28px;background:#f59e0b;color:white;padding:12px 18px;border:none;border-radius:999px;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(245,158,11,0.18)}
  .no-print{display:inline-block}
  @media print{.no-print{display:none}.container{padding:20px}}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">📄 Imprimir / Guardar PDF</button>
<div class="container">
  <div class="header">
    <div class="logo"><span class="logo-text">${BRAND_NAME.split(' ')[0].charAt(0)}</span></div>
    <div class="brand">${BRAND_NAME}</div>
    <div class="brand-sub">Ficha Técnica</div>
  </div>

  <div class="section">
    <div class="property-title">${property?.title || ''}</div>
    <div class="property-price">${formatPrice(property?.price)}</div>
    <div class="property-location">📍 ${property?.location || ''}</div>
  </div>

  ${images.length > 0 ? `
  <div class="images">
    ${images.slice(0,5).map(img => `<img src="${img}" alt="${property?.title || ''}"/>`).join('')}
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Características Principales</div>
    <div class="features">
      <div class="feature"><div class="value">${property?.beds ?? 0}</div><div class="label">Habitaciones</div></div>
      <div class="feature"><div class="value">${property?.baths ?? 0}</div><div class="label">Baños</div></div>
      <div class="feature"><div class="value">${property?.sqftConstruction ?? 0} m²</div><div class="label">Construcción</div></div>
      <div class="feature"><div class="value">${property?.sqftLand ?? 0} m²</div><div class="label">Terreno</div></div>
    </div>
  </div>

  ${property?.description ? `
  <div class="section">
    <div class="section-title">Descripción</div>
    <div class="description">${property?.description}</div>
  </div>
  ` : ''}

  <div class="agent">
    <div class="title">Tu Asesora Inmobiliaria</div>
    <div class="name">${AGENT_NAME}</div>
    <div class="contacts">
      <div class="contact-item"><div class="contact-icon">📞</div><div><div style="font-size:12px;opacity:0.8">Teléfono</div><div style="font-weight:700">${AGENT_PHONE}</div></div></div>
      <div class="contact-item"><div class="contact-icon">💬</div><div><div style="font-size:12px;opacity:0.8">WhatsApp</div><div style="font-weight:700">${AGENT_PHONE}</div></div></div>
    </div>
  </div>

  <div class="section" style="margin-top:18px;display:flex;align-items:center;justify-content:space-between">
    <div style="font-size:12px;color:#777">${BRAND_NAME} • Experiencia, Profesionalismo y Dedicación</div>
    <div style="text-align:right;font-size:12px;color:#777">Generado: ${new Date().toLocaleDateString('es-MX')}</div>
  </div>

  <div style="margin-top:10px;display:flex;justify-content:center">
    <img src="${qrCodeUrl}" alt="QR" style="width:90px;height:90px;border-radius:8px" />
  </div>

  <div class="footer">© ${new Date().getFullYear()} ${BRAND_NAME}. Todos los derechos reservados.</div>
</div>
</body>
</html>`;

    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
  };

  const shareText = `Hola, me interesa la propiedad: ${property.title} en ${property.location}. Ref: ${property.id}`;
  const whatsappUrl = `https://wa.me/${AGENT_WHATSAPP}?text=${encodeURIComponent(shareText)}`;

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `Mira esta propiedad en ${BRAND_NAME}: ${property.title}`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyFallback();
        }
      }
    } else {
      copyFallback();
    }
  };

  const copyFallback = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Gallery Section */}
      <div className="relative h-[65vh] md:h-[80vh] bg-black group overflow-hidden">
        {/* Main Image Container */}
        <div className="absolute inset-0 transition-all duration-700 ease-in-out">
          <img
            src={property.images[activeImage] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200'}
            alt={`${property.title} - Vista ${activeImage + 1}`}
            className="w-full h-full object-cover opacity-90 transition-opacity duration-500"
          />
        </div>
        
        {/* Navigation Arrows */}
        {property.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-md hover:bg-amber-600 text-white p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100 shadow-xl"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-black/20 backdrop-blur-md hover:bg-amber-600 text-white p-3 md:p-4 rounded-full transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100 shadow-xl"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </button>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>
        
        {/* Thumbnails Overlay */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex space-x-3 overflow-x-auto max-w-full px-8 no-scrollbar py-2">
          {property.images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                setActiveImage(idx);
              }}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 transform ${
                activeImage === idx 
                  ? 'border-amber-500 scale-110 shadow-2xl z-10' 
                  : 'border-white/20 opacity-50 hover:opacity-100 hover:scale-105'
              }`}
            >
              <img src={img} className="w-full h-full object-cover pointer-events-none" alt={`Miniatura ${idx + 1}`} />
            </button>
          ))}
        </div>

        {/* Property Header Overlay */}
        <div className="absolute bottom-8 left-4 md:left-12 right-4 md:right-12 text-white flex flex-col md:flex-row justify-between items-end gap-4 z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-2 font-serif drop-shadow-lg">{property.title}</h1>
            <div className="flex items-center space-x-4 text-gray-200">
              <span className="flex items-center bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                <MapPin className="h-4 w-4 mr-1 text-amber-500" /> {property.location}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                {activeImage + 1} / {property.images.length}
              </span>
            </div>
          </div>
          <div className="bg-amber-600 px-8 py-4 rounded-[28px] shadow-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100 mb-1">Inversión</p>
            <p className="text-2xl md:text-3xl font-bold">${property.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Quick Specs - Modern Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="bg-gray-50/50 p-6 rounded-[32px] text-center border border-gray-100 hover:shadow-md transition-shadow">
                <Bed className="h-7 w-7 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">Habitaciones</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-[32px] text-center border border-gray-100 hover:shadow-md transition-shadow">
                <Bath className="h-7 w-7 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">Baños</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-[32px] text-center border border-gray-100 hover:shadow-md transition-shadow">
                <Square className="h-7 w-7 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.sqftConstruction}</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">M² Const.</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-[32px] text-center border border-gray-100 hover:shadow-md transition-shadow">
                <Ruler className="h-7 w-7 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.sqftLand}</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">M² Terreno</p>
              </div>
              <div className="bg-gray-50/50 p-6 rounded-[32px] text-center border border-gray-100 hover:shadow-md transition-shadow">
                <Car className="h-7 w-7 text-amber-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{property.parking}</p>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.15em]">Estac.</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="h-px bg-amber-600 flex-grow max-w-[60px]"></div>
                <h2 className="text-3xl font-bold font-serif text-gray-900">Resumen de la Propiedad</h2>
              </div>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
                <p>{property.description}</p>
                <p>Ubicada en una de las zonas con mayor crecimiento y plusvalía, esta propiedad ofrece no solo un hogar, sino una inversión segura para el futuro de tu familia. Los espacios han sido diseñados pensando en el confort y la funcionalidad.</p>
              </div>
            </div>

            {/* Tech Buttons */}
            <div className="flex flex-wrap gap-4 pt-12 border-t border-gray-100">
              <button 
                onClick={generateFicha}
                className="flex items-center space-x-3 bg-slate-900 text-white px-8 py-5 rounded-[22px] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
              >
                <FileText className="h-5 w-5" />
                <span>Descargar Ficha Técnica</span>
              </button>
              <button 
                className={`relative flex items-center space-x-3 border-2 px-8 py-5 rounded-[22px] font-bold transition-all active:scale-95 ${
                  copied ? 'bg-green-50 border-green-500 text-green-600' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                }`}
                onClick={handleShare}
              >
                {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                <span>{copied ? '¡Copiado!' : 'Compartir Propiedad'}</span>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Contact Card */}
            <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-gray-200 border border-gray-100 sticky top-28">
              <div className="flex items-center space-x-5 mb-10">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                    className="w-20 h-20 rounded-[28px] object-cover border-2 border-amber-500 p-1 bg-white shadow-lg"
                    alt={AGENT_NAME}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 h-5 w-5 rounded-full border-4 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 leading-tight">{AGENT_NAME}</h3>
                  <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mt-1">Directora Comercial</p>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Agenda una visita</h4>
                <ContactForm propertyId={property.id} propertyName={property.title} />
              </div>

              <div className="pt-8 border-t border-gray-100 flex items-center justify-between gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Código QR</p>
                  <p className="text-[11px] text-gray-500 leading-tight">Acceso rápido desde tu celular</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-[22px] border border-gray-100 flex items-center space-x-3">
                  <div ref={qrWrapperRef}><QRCodeSVG value={window.location.href} size={70} /></div>
                  <div className="flex flex-col">
                    <button onClick={downloadQr} className="text-sm font-bold text-gray-700 hover:text-gray-900 flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>{qrLoading ? 'Generando...' : 'Descargar QR'}</span>
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Copiar enlace</button>
                  </div>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 flex items-center justify-center space-x-3 w-full bg-[#25D366] text-white py-5 rounded-[22px] font-bold hover:bg-[#128C7E] transition-all shadow-xl shadow-green-600/20 active:scale-[0.98]"
              >
                <MessageCircle className="h-6 w-6" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
