import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  Search,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { COHORTE_BASE_FICTICIA, RegistroCohorte } from '../data/cohorteFicticia';

const registrosPorRiesgo = ['Alto', 'Moderado', 'Bajo'];
const nivelesAdherencia = ['Baja', 'Media', 'Alta'];
const pageSize = 10;

const contarPor = (registros: RegistroCohorte[], campo: keyof RegistroCohorte) =>
  registros.reduce<Record<string, number>>((conteo, registro) => {
    const valor = String(registro[campo]);
    conteo[valor] = (conteo[valor] ?? 0) + 1;
    return conteo;
  }, {});

const porcentaje = (cantidad: number, total: number) =>
  total ? Math.round((cantidad / total) * 100) : 0;

const estiloRiesgo = (riesgo: string) => {
  if (riesgo === 'Alto') return 'cohort-chip cohort-chip-high';
  if (riesgo === 'Moderado') return 'cohort-chip cohort-chip-medium';
  return 'cohort-chip cohort-chip-low';
};

const estiloAdherencia = (adherencia: string) => {
  if (adherencia === 'Baja') return 'cohort-chip cohort-chip-high';
  if (adherencia === 'Media') return 'cohort-chip cohort-chip-medium';
  return 'cohort-chip cohort-chip-low';
};

interface BarRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  selected?: boolean;
  scaleTotal?: number;
  onClick?: () => void;
}

const BarRow: React.FC<BarRowProps> = ({
  label,
  value,
  total,
  color,
  selected = false,
  scaleTotal,
  onClick,
}) => {
  const contents = (
    <>
      <div className="cohort-bar-label">
        <span>{label}</span>
        <strong>{value} <small>· {porcentaje(value, total)}%</small></strong>
      </div>
      <div className="cohort-bar-track">
        <span style={{ width: (scaleTotal ? porcentaje(value, scaleTotal) : porcentaje(value, total)) + '%', background: color }} />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={`cohort-bar-row cohort-bar-button${selected ? ' is-selected' : ''}`} onClick={onClick} aria-pressed={selected} title={`Filtrar por ${label}`}>
        {contents}
      </button>
    );
  }

  return <div className="cohort-bar-row">{contents}</div>;
};

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

const DonutChart: React.FC<{ segments: DonutSegment[]; total: number; centerLabel: string }> = ({
  segments,
  total,
  centerLabel,
}) => {
  let cumulative = 0;
  const gradientStops = segments.map((segment) => {
    const start = cumulative;
    cumulative += total ? (segment.value / total) * 100 : 0;
    return segment.color + ' ' + start + '% ' + cumulative + '%';
  }).join(', ');

  return (
    <div className="cohort-donut-visual" role="img" aria-label={segments.map((segment) => segment.label + ': ' + segment.value).join(', ')}>
      <div className="cohort-donut-ring" style={{ background: 'conic-gradient(from -90deg, ' + gradientStops + ')' }}>
        <div className="cohort-donut-center"><strong>{total}</strong><span>{centerLabel}</span></div>
      </div>
      <div className="cohort-donut-shadow" />
    </div>
  );
};

const DonutLegendRow: React.FC<{
  label: string;
  value: number;
  total: number;
  color: string;
  selected: boolean;
  onClick: () => void;
}> = ({ label, value, total, color, selected, onClick }) => (
  <button type="button" className={'cohort-donut-legend-row' + (selected ? ' is-selected' : '')} onClick={onClick} aria-pressed={selected}>
    <span className="cohort-donut-legend-dot" style={{ background: color }} />
    <span className="cohort-donut-legend-label">{label}</span>
    <strong>{value}</strong>
    <small>{porcentaje(value, total)}%</small>
  </button>
);

const Field: React.FC<{ label: string; value: string | number; wide?: boolean }> = ({
  label,
  value,
  wide = false,
}) => (
  <div className={`cohort-detail-field${wide ? ' cohort-detail-field-wide' : ''}`}>
    <span>{label}</span>
    <strong>{value || 'Sin dato'}</strong>
  </div>
);

export const CohorteDashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('Todos');
  const [adherenceFilter, setAdherenceFilter] = useState('Todas');
  const [epsFilter, setEpsFilter] = useState('Todas');
  const [epsIssueOnly, setEpsIssueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<RegistroCohorte | null>(null);

  const total = COHORTE_BASE_FICTICIA.length;
  const riskCounts = useMemo(() => contarPor(COHORTE_BASE_FICTICIA, 'riesgo'), []);
  const adherenceCounts = useMemo(() => contarPor(COHORTE_BASE_FICTICIA, 'adherencia'), []);
  const epsCounts = useMemo(() => contarPor(COHORTE_BASE_FICTICIA, 'eps'), []);
  const highRisk = riskCounts.Alto ?? 0;
  const lowAdherence = adherenceCounts.Baja ?? 0;
  const epsBarriers = COHORTE_BASE_FICTICIA.filter((registro) => registro.problemasEPS !== 'No reporta').length;
  const averageAge = Math.round(COHORTE_BASE_FICTICIA.reduce((sum, registro) => sum + registro.edad, 0) / (total || 1));

  const topEps = Object.entries(epsCounts).sort((left, right) => right[1] - left[1]);
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es');
    return COHORTE_BASE_FICTICIA.filter((registro) => {
      const matchesSearch = !query || [
        registro.nombre,
        registro.documento,
        registro.eps,
        registro.determinantesSociales,
        registro.problemasEPS,
      ].some((value) => value.toLocaleLowerCase('es').includes(query));
      const matchesRisk = riskFilter === 'Todos' || registro.riesgo === riskFilter;
      const matchesAdherence = adherenceFilter === 'Todas' || registro.adherencia === adherenceFilter;
      const matchesEps = epsFilter === 'Todas' || registro.eps === epsFilter;
      const matchesEpsIssue = !epsIssueOnly || registro.problemasEPS !== 'No reporta';
      return matchesSearch && matchesRisk && matchesAdherence && matchesEps && matchesEpsIssue;
    });
  }, [search, riskFilter, adherenceFilter, epsFilter, epsIssueOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const visibleRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);
  const resetFilters = () => {
    setSearch('');
    setRiskFilter('Todos');
    setAdherenceFilter('Todas');
    setEpsFilter('Todas');
    setEpsIssueOnly(false);
    setPage(1);
  };

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--hero-rotate-x', `${(-y * 2.2).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--hero-rotate-y', `${(x * 2.8).toFixed(2)}deg`);
  };

  const resetHeroTilt = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--hero-rotate-x', '0deg');
    event.currentTarget.style.setProperty('--hero-rotate-y', '0deg');
  };

  const toggleRiskFilter = (nivel: string) => {
    setRiskFilter((current) => current === nivel ? 'Todos' : nivel);
    setPage(1);
  };

  const toggleAdherenceFilter = (nivel: string) => {
    setAdherenceFilter((current) => current === nivel ? 'Todas' : nivel);
    setPage(1);
  };

  const toggleEpsFilter = (eps: string) => {
    setEpsFilter((current) => current === eps ? 'Todas' : eps);
    setPage(1);
  };

  const toggleEpsIssueFilter = () => {
    setEpsIssueOnly((current) => !current);
    setPage(1);
  };

  return (
    <div className="cohort-page page-enter space-y-5">
      <section className="cohort-hero" onPointerMove={handleHeroPointerMove} onPointerLeave={resetHeroTilt}>
        <div className="cohort-hero-glow" />
        <div className="cohort-hero-copy">
          <div className="cohort-source-pill"><ClipboardList className="w-3.5 h-3.5" /> Base ficticia importada · SICA-12</div>
          <h1>Seguimiento de infarto agudo de miocardio</h1>
          <p>Cohorte de práctica para revisar riesgo, adherencia y determinantes sociales del Centro de Excelencia.</p>
          <span className="cohort-source-note">Vista limitada a los campos presentes en la base fuente.</span>
        </div>
        <div className="cohort-hero-scene" aria-label={total + ' pacientes ficticios en la cohorte'}>
          <div className="cohort-scene-orbit cohort-scene-orbit-one" />
          <div className="cohort-scene-orbit cohort-scene-orbit-two" />
          <div className="cohort-scene-platform"><span /></div>
          <div className="cohort-scene-heart"><HeartPulse className="w-10 h-10" /><span>IAM</span></div>
          <div className="cohort-scene-card cohort-scene-card-main"><span>Pacientes</span><strong>{total}</strong><small>cohorte ficticia</small></div>
          <div className="cohort-scene-card cohort-scene-card-risk"><i /> <span>Riesgo alto</span><strong>{porcentaje(highRisk, total)}%</strong></div>
          <div className="cohort-scene-card cohort-scene-card-adherence"><i /> <span>Adherencia baja</span><strong>{porcentaje(lowAdherence, total)}%</strong></div>
        </div>
      </section>

      <section className="cohort-metrics" aria-label="Resumen de la cohorte">
        <article className="cohort-metric">
          <div className="cohort-metric-icon cohort-icon-blue"><Users className="w-5 h-5" /></div>
          <div><span>Edad promedio</span><strong>{averageAge} <small>años</small></strong><em>rango 20–82 años</em></div>
        </article>
        <button type="button" className="cohort-metric cohort-metric-button" onClick={() => toggleRiskFilter('Alto')} aria-pressed={riskFilter === 'Alto'}>
          <div className="cohort-metric-icon cohort-icon-rose"><ShieldAlert className="w-5 h-5" /></div>
          <div><span>Riesgo alto</span><strong>{highRisk} <small>({porcentaje(highRisk, total)}%)</small></strong><em>Requiere priorización</em></div>
        </button>
        <button type="button" className="cohort-metric cohort-metric-button" onClick={() => toggleAdherenceFilter('Baja')} aria-pressed={adherenceFilter === 'Baja'}>
          <div className="cohort-metric-icon cohort-icon-amber"><AlertTriangle className="w-5 h-5" /></div>
          <div><span>Adherencia baja</span><strong>{lowAdherence} <small>({porcentaje(lowAdherence, total)}%)</small></strong><em>Según la clasificación fuente</em></div>
        </button>
        <button type="button" className="cohort-metric cohort-metric-button" onClick={toggleEpsIssueFilter} aria-pressed={epsIssueOnly}>
          <div className="cohort-metric-icon cohort-icon-teal"><Check className="w-5 h-5" /></div>
          <div><span>Problema con EPS</span><strong>{epsBarriers} <small>({porcentaje(epsBarriers, total)}%)</small></strong><em>Excluye “No reporta”</em></div>
        </button>
      </section>

      <section className="cohort-analytics-grid">
        <article className="cohort-panel">
          <div className="cohort-panel-heading">
            <div><span className="cohort-panel-kicker">PERFIL DE LA COHORTE</span><h2>Nivel de riesgo</h2></div>
            <span className="cohort-panel-total cohort-chart-hint">Selecciona un nivel · {total} pacientes</span>
          </div>
          <div className="cohort-donut-layout">
            <DonutChart total={total} centerLabel="pacientes" segments={[
              { label: 'Alto', value: riskCounts.Alto ?? 0, color: '#df6670' },
              { label: 'Moderado', value: riskCounts.Moderado ?? 0, color: '#e8ad4f' },
              { label: 'Bajo', value: riskCounts.Bajo ?? 0, color: '#36a995' },
            ]} />
            <div className="cohort-donut-legend">
              {registrosPorRiesgo.map((nivel) => (
                <DonutLegendRow key={nivel} label={nivel} value={riskCounts[nivel] ?? 0} total={total} color={nivel === 'Alto' ? '#df6670' : nivel === 'Moderado' ? '#e8ad4f' : '#36a995'} selected={riskFilter === nivel} onClick={() => toggleRiskFilter(nivel)} />
              ))}
            </div>
          </div>
        </article>

        <article className="cohort-panel">
          <div className="cohort-panel-heading">
            <div><span className="cohort-panel-kicker">CONTINUIDAD DEL CUIDADO</span><h2>Adherencia</h2></div>
            <span className="cohort-panel-total">{total} registros</span>
          </div>
          <div className="cohort-donut-layout">
            <DonutChart total={total} centerLabel="pacientes" segments={[
              { label: 'Baja', value: adherenceCounts.Baja ?? 0, color: '#e8ad4f' },
              { label: 'Media', value: adherenceCounts.Media ?? 0, color: '#7185de' },
              { label: 'Alta', value: adherenceCounts.Alta ?? 0, color: '#36a995' },
            ]} />
            <div className="cohort-donut-legend">
              {nivelesAdherencia.map((nivel) => (
                <DonutLegendRow key={nivel} label={nivel} value={adherenceCounts[nivel] ?? 0} total={total} color={nivel === 'Baja' ? '#e8ad4f' : nivel === 'Media' ? '#7185de' : '#36a995'} selected={adherenceFilter === nivel} onClick={() => toggleAdherenceFilter(nivel)} />
              ))}
            </div>
          </div>
        </article>

        <article className="cohort-panel cohort-eps-panel">
          <div className="cohort-panel-heading">
            <div><span className="cohort-panel-kicker">ASEGURAMIENTO</span><h2>Distribución por EPS</h2></div>
            <span className="cohort-panel-total">{topEps.length} entidades</span>
          </div>
          <div className="cohort-eps-chart-note">Comparación visual con la EPS de mayor volumen</div>
          <div className="cohort-eps-bars">
            {topEps.map(([eps, value]) => (
              <BarRow key={eps} label={eps} value={value} total={total} scaleTotal={topEps[0]?.[1] ?? total} color="#6476d9" selected={epsFilter === eps} onClick={() => toggleEpsFilter(eps)} />
            ))}
          </div>
        </article>
      </section>

      <section className="cohort-table-panel">
        <div className="cohort-table-heading">
          <div>
            <span className="cohort-panel-kicker">DETALLE DE REGISTROS</span>
            <h2>Pacientes de la cohorte <span>{filteredRecords.length}</span></h2>
            <p>Selecciona un registro para consultar los campos completos del archivo.</p>
          </div>
          <div className="cohort-filters">
            <label className="cohort-search">
              <Search className="w-4 h-4" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar paciente, EPS o barrera" />
            </label>
            <select aria-label="Filtrar por riesgo" value={riskFilter} onChange={(event) => { setRiskFilter(event.target.value); setPage(1); }}>
              <option>Todos</option><option>Alto</option><option>Moderado</option><option>Bajo</option>
            </select>
            <select aria-label="Filtrar por adherencia" value={adherenceFilter} onChange={(event) => { setAdherenceFilter(event.target.value); setPage(1); }}>
              <option>Todas</option><option>Baja</option><option>Media</option><option>Alta</option>
            </select>
            <select aria-label="Filtrar por EPS" value={epsFilter} onChange={(event) => { setEpsFilter(event.target.value); setPage(1); }}>
              <option value="Todas">Todas las EPS</option>{topEps.map(([eps]) => <option key={eps} value={eps}>{eps}</option>)}
            </select>
            {(search || riskFilter !== 'Todos' || adherenceFilter !== 'Todas' || epsFilter !== 'Todas' || epsIssueOnly) && (
              <button className="cohort-reset" onClick={resetFilters}>Limpiar</button>
            )}
          </div>
        </div>

        <div className="cohort-table-scroll custom-scrollbar">
          <table className="cohort-table">
            <thead><tr>
              <th>Paciente</th><th>Edad</th><th>EPS</th><th>Riesgo</th><th>Adherencia</th><th>Determinante social</th><th>Problema con EPS</th>
            </tr></thead>
            <tbody>
              {visibleRecords.map((registro) => (
                <tr key={registro.id} tabIndex={0} onClick={() => setSelectedRecord(registro)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedRecord(registro); }}>
                  <td><div className="cohort-patient-name">{registro.nombre}<small>{registro.id} · {registro.documento}</small></div></td>
                  <td className="cohort-age">{registro.edad} años</td>
                  <td>{registro.eps}</td>
                  <td><span className={estiloRiesgo(registro.riesgo)}>{registro.riesgo}</span></td>
                  <td><span className={estiloAdherencia(registro.adherencia)}>{registro.adherencia}</span></td>
                  <td className="cohort-truncate">{registro.determinantesSociales}</td>
                  <td className="cohort-truncate">{registro.problemasEPS}</td>
                </tr>
              ))}
              {visibleRecords.length === 0 && <tr><td colSpan={7} className="cohort-empty">No hay registros que coincidan con esos filtros.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="cohort-table-footer">
          <span>Mostrando {filteredRecords.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredRecords.length)} de {filteredRecords.length} registros</span>
          <div className="cohort-pagination">
            <button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="w-4 h-4" /></button>
            <span>{page} / {totalPages}</span>
            <button aria-label="Página siguiente" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      {selectedRecord && (
        <div className="cohort-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}>
          <aside className="cohort-drawer" role="dialog" aria-modal="true" aria-label={`Detalle del registro ${selectedRecord.id}`}>
            <div className="cohort-drawer-head">
              <div className="cohort-drawer-avatar"><Users className="w-5 h-5" /></div>
              <div className="min-w-0"><span>{selectedRecord.id} · {selectedRecord.documento}</span><h2>{selectedRecord.nombre}</h2></div>
              <button aria-label="Cerrar detalle" onClick={() => setSelectedRecord(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="cohort-drawer-scroll">
              <section className="cohort-detail-section"><h3>Identificación y aseguramiento</h3><div className="cohort-detail-grid">
                <Field label="Edad" value={`${selectedRecord.edad} años`} /><Field label="EPS" value={selectedRecord.eps} />
              </div></section>
              <section className="cohort-detail-section"><h3>Riesgo y seguimiento</h3><div className="cohort-detail-grid">
                <Field label="Nivel de riesgo" value={selectedRecord.riesgo} /><Field label="Adherencia" value={selectedRecord.adherencia} /><Field label="Introspección" value={selectedRecord.introspeccion} />
              </div></section>
              <section className="cohort-detail-section"><h3>Contexto social y hábitos</h3><div className="cohort-detail-grid">
                <Field label="Determinantes sociales" value={selectedRecord.determinantesSociales} wide /><Field label="Escolaridad" value={selectedRecord.escolaridad} />
                <Field label="Consumo de tabaco" value={selectedRecord.consumoTabaco} /><Field label="Consumo de alcohol" value={selectedRecord.consumoAlcohol} /><Field label="Consumo de sustancias psicoactivas" value={selectedRecord.consumoSustancias} wide />
              </div></section>
              <section className="cohort-detail-section cohort-detail-eps"><h3>Problemas reportados con la EPS</h3><p>{selectedRecord.problemasEPS}</p></section>
            </div>
            <div className="cohort-drawer-footer">Registro de demostración · Datos ficticios</div>
          </aside>
        </div>
      )}
    </div>
  );
};
