import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Users, AlertCircle, Building2, Activity } from 'lucide-react';
import { CentroExcelencia, CategoriaCentro } from '../types/clinical';
import { getIconComponent, getColorClasses } from './Header';
import { COHORTE_BASE_FICTICIA } from '../data/cohorteFicticia';

interface CentrosGridProps {
  centros: CentroExcelencia[];
  onSelectCentro: (centro: CentroExcelencia) => void;
  onOpenCohorte: () => void;
}

export const CentrosGrid: React.FC<CentrosGridProps> = ({ centros, onSelectCentro, onOpenCohorte }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');

  const categories: { key: string; label: string }[] = [
    { key: 'todas', label: 'Todos los centros' },
    { key: 'cardiovascular', label: 'Cardiovascular' },
    { key: 'oncologico', label: 'Oncología' },
    { key: 'pediatrico', label: 'Pediatría' },
    { key: 'quirurgico', label: 'Quirúrgico & Ortopedia' },
    { key: 'neurologico', label: 'Neuro & Salud Mental' },
    { key: 'respiratorio', label: 'Respiratorio' },
    { key: 'cronico', label: 'Crónico & Metabólico' },
  ];

  const filteredCentros = useMemo(() => {
    return centros.filter((centro) => {
      const matchesSearch =
        centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat =
        selectedCategory === 'todas' || centro.categoria === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [centros, searchTerm, selectedCategory]);

  const totalPacientesActivos = useMemo(() => {
    return centros.reduce((acc, c) => acc + c.pacientesActivos, 0);
  }, [centros]);

  const totalAlertas = useMemo(() => {
    return centros.reduce((acc, c) => acc + c.alertasActivas, 0);
  }, [centros]);

  const centrosConSeguimiento = useMemo(() => {
    return centros.filter((centro) => centro.pacientesActivos > 0).length;
  }, [centros]);
  const riesgoAlto = COHORTE_BASE_FICTICIA.filter((registro) => registro.riesgo === 'Alto').length;
  const adherenciaBaja = COHORTE_BASE_FICTICIA.filter((registro) => registro.adherencia === 'Baja').length;

  return (
    <div className="overview-page page-enter space-y-6">
      {/* Top Banner & Search Header */}
      <div className="overview-heading relative flex flex-col md:flex-row md:items-end justify-between gap-5 pb-2 border-b border-[#ececf1]">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="overview-kicker">RED DE ATENCIÓN FCV</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Centros de excelencia
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-2 max-w-xl leading-relaxed">
            Una vista clara del seguimiento especializado. Elige un centro para explorar sus indicadores y pacientes.
          </p>
        </div>

        {/* Buscador */}
        <div className="relative z-10 w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar centro o código..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#ececf1] rounded-xl text-xs md:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overview-metrics grid grid-cols-1 sm:grid-cols-3 gap-3">
        <article className="overview-metric flex items-center gap-3.5 bg-white border rounded-2xl p-4">
          <div className="overview-metric-icon bg-violet-50 text-violet-700"><Building2 className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Centros en la red</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-0.5">{centros.length}</p>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">FCV</span>
        </article>
        <article className="overview-metric flex items-center gap-3.5 bg-white border rounded-2xl p-4">
          <div className="overview-metric-icon bg-blue-50 text-blue-700"><Users className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Pacientes activos</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-0.5">{totalPacientesActivos.toLocaleString()}</p>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />En seguimiento</span>
        </article>
        <article className="overview-metric flex items-center gap-3.5 bg-white border rounded-2xl p-4">
          <div className="overview-metric-icon bg-amber-50 text-amber-700"><AlertCircle className="w-5 h-5" /></div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Alertas registradas</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-0.5">{totalAlertas.toLocaleString()}</p>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><Activity className="h-3.5 w-3.5" />Vista general</span>
        </article>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Directorio clínico</h2>
          <p className="mt-0.5 text-xs text-slate-500">{centrosConSeguimiento} centros con pacientes en seguimiento</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-[11px] font-medium text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Datos sintéticos de demostración
        </span>
      </div>

      <section className="cohort-shortcut" aria-label="Base de demostración para el centro de infarto agudo de miocardio">
        <div className="cohort-shortcut-mark"><Activity className="w-5 h-5" /></div>
        <div className="cohort-shortcut-copy">
          <span>BASE DE EMPALME · SICA-12</span>
          <h2>Infarto agudo de miocardio</h2>
          <p>Cohorte ficticia con riesgo, adherencia y determinantes sociales.</p>
        </div>
        <div className="cohort-shortcut-stats">
          <span><strong>{COHORTE_BASE_FICTICIA.length}</strong> registros</span>
          <span><strong>{riesgoAlto}</strong> riesgo alto</span>
          <span><strong>{adherenciaBaja}</strong> adherencia baja</span>
        </div>
        <button onClick={onOpenCohorte} className="cohort-shortcut-button">
          Abrir cohorte <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Categorías filtro rápido */}
      <div className="category-filter flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-violet-700 border border-[#e6e8f0]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid de 37 Tarjetas de Centros */}
      {filteredCentros.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCentros.map((centro) => {
            const colors = getColorClasses(centro.colorIcono);

            return (
              <button
                key={centro.id}
                onClick={() => onSelectCentro(centro)}
                className="center-card group text-left bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-3.5 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {/* Fila superior: Ícono de categoría 40x40 + Flecha */}
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-transform group-hover:scale-105`}
                  >
                    {getIconComponent(centro.iconoNombre, 'w-5 h-5')}
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-50 transition-colors">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Nombre del centro y descripción */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-violet-700 transition-colors line-clamp-1">
                    {centro.nombre}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {centro.descripcion}
                  </p>
                </div>

                {/* Fila inferior: Pacientes activos badge + ID monospace */}
                <div className="pt-2 border-t border-[#f1f1f4] flex items-center justify-between w-full text-xs">
                  {centro.pacientesActivos > 0 ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="tabular-nums font-semibold text-slate-900">
                        {centro.pacientesActivos}
                      </span>{' '}
                      activos
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Sin pacientes</span>
                  )}

                  <div className="flex items-center gap-2">
                    {centro.alertasActivas > 0 && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium"
                        title={`${centro.alertasActivas} alertas pendientes`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span className="tabular-nums">{centro.alertasActivas}</span>
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-slate-400">
                      ID {centro.id}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#ececf1] rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No se encontraron centros
          </h3>
          <p className="text-xs text-slate-500">
            No hay ningún centro que coincida con "{searchTerm}" en la categoría seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('todas');
            }}
            className="text-xs font-medium text-violet-700 hover:text-violet-800 underline underline-offset-2"
          >
            Limpiar filtros de búsqueda
          </button>
        </div>
      )}
    </div>
  );
};
