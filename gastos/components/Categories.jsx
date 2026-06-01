'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useToast } from '@/components/UI';
import { Modal } from '@/components/UI';
import Icon from './Icons';

const EMOJI_OPTIONS = [
  '🍽️','🏠','🚌','💡','🛍️','🐷','✨','✈️','🎉','👗',
  '💊','🎮','📚','🏋️','🐾','🎸','🍺','☕','🚗','💇',
  '🐶','🏥','🎓','🛒','🎁','🏖️','🍕','🎬','⚽','🧴',
];
const COLOR_OPTIONS = [
  '#e0792b','#0f766e','#2563eb','#b56a09','#9333ea',
  '#4d7c0f','#64748b','#dc2626','#db2777','#0891b2',
  '#7c3aed','#059669','#b45309','#0369a1','#be185d',
];

function CategoryModal({ cat, onClose }) {
  const { addCategory, updateCategory } = useApp();
  const pushToast = useToast();
  const isEdit = !!cat;

  const [name,  setName]  = useState(cat?.name  || '');
  const [icon,  setIcon]  = useState(cat?.icon  || '✨');
  const [color, setColor] = useState(cat?.color || '#64748b');
  const [busy,  setBusy]  = useState(false);

  const save = async () => {
    if (!name.trim()) {
      pushToast({ emoji: '⚠️', title: 'Escribe un nombre' });
      return;
    }
    setBusy(true);
    try {
      if (isEdit) {
        await updateCategory(cat.id, { name: name.trim(), icon, color });
        pushToast({ emoji: '✓', type: 'good', title: 'Categoría actualizada' });
      } else {
        await addCategory({ name: name.trim(), icon, color });
        pushToast({ emoji: '✓', type: 'good', title: `"${name.trim()}" creada` });
      }
      onClose();
    } catch (e) {
      pushToast({ emoji: '✕', title: 'Error', msg: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Editar categoría' : 'Nueva categoría'} width={440}>
      <div className="col" style={{ gap: 16 }}>
        <div className="field">
          <label className="label">Nombre</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)}
            placeholder="Ej. Viajes, Salud, Entretenimiento…" autoFocus
            onKeyDown={e => e.key === 'Enter' && save()} />
        </div>

        <div className="field">
          <label className="label">Ícono</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setIcon(e)} className="btn"
                style={{ fontSize: 19, padding: 6, borderRadius: 10,
                  background: icon === e ? 'var(--primary-tint)' : 'var(--surface-2)',
                  border: `1.5px solid ${icon === e ? 'var(--primary)' : 'var(--border)'}` }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label">Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLOR_OPTIONS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width: 30, height: 30, borderRadius: 8, background: c, cursor: 'pointer',
                  border: color === c ? '3px solid var(--text)' : '3px solid transparent',
                  boxShadow: color === c ? `0 0 0 2px var(--bg), 0 0 0 3px ${c}` : 'none' }} />
            ))}
          </div>
        </div>

        {/* preview */}
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)',
          display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, fontSize: 20,
            background: `color-mix(in srgb,${color} 14%, transparent)`,
            display: 'grid', placeItems: 'center' }}>{icon}</span>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontWeight: 700 }}>{name || 'Vista previa'}</span>
            <span className="tiny muted">Tu categoría personalizada</span>
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost grow" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary grow" onClick={save} disabled={busy}>
            {busy ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DeleteConfirm({ cat, onConfirm, onClose }) {
  return (
    <Modal open onClose={onClose} title="Eliminar categoría" width={400}>
      <div className="col" style={{ gap: 16 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 14px',
          borderRadius: 12, background: 'var(--danger-tint)' }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, fontSize: 20,
            background: `color-mix(in srgb,${cat.color} 14%, transparent)`,
            display: 'grid', placeItems: 'center', flex: 'none' }}>{cat.icon}</span>
          <div>
            <div style={{ fontWeight: 700 }}>{cat.name}</div>
            <div className="tiny muted">Los gastos en esta categoría quedarán sin categoría</div>
          </div>
        </div>
        <p style={{ fontSize: 14, margin: 0 }}>
          ¿Seguro que quieres eliminar <strong>{cat.name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn btn-ghost grow" onClick={onClose}>Cancelar</button>
          <button className="btn grow" style={{ background: 'var(--danger)', color: '#fff' }}
            onClick={onConfirm}>Sí, eliminar</button>
        </div>
      </div>
    </Modal>
  );
}

export default function Categories() {
  const { categories, deleteCategory } = useApp();
  const pushToast = useToast();

  const [modal,   setModal]   = useState(null); // null | 'new' | category-object
  const [delCat,  setDelCat]  = useState(null);
  const [search,  setSearch]  = useState('');

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    try {
      await deleteCategory(delCat.id);
      pushToast({ emoji: '🗑️', title: `"${delCat.name}" eliminada` });
    } catch (e) {
      pushToast({ emoji: '✕', title: 'Error', msg: e.message });
    } finally {
      setDelCat(null);
    }
  };

  return (
    <div className="view-in col" style={{ gap: 24 }}>
      {/* header */}
      <div className="row between wrap" style={{ gap: 12 }}>
        <div>
          <h1 className="h-page">Mis categorías</h1>
          <p className="muted" style={{ fontSize: 14.5, marginTop: 4 }}>
            {categories.length} categorías personales · solo tú las ves y editas
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Icon name="plus" size={17} />Nueva categoría
        </button>
      </div>

      {/* search */}
      <div style={{ position: 'relative' }}>
        <Icon name="search" size={17} color="var(--muted)"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input className="input" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar categoría…"
          style={{ paddingLeft: 42 }} />
      </div>

      {/* list */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="col" style={{ alignItems: 'center', padding: '48px 20px', gap: 10 }}>
            <span style={{ fontSize: 36 }}>🗂️</span>
            <span style={{ fontWeight: 700 }}>No hay categorías{search ? ' con ese nombre' : ''}</span>
            {!search && <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>Crear primera categoría</button>}
          </div>
        ) : (
          filtered.map((c, i) => (
            <div key={c.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {/* icon */}
              <span style={{ width: 46, height: 46, borderRadius: 14, fontSize: 22, flex: 'none',
                background: `color-mix(in srgb,${c.color} 15%, transparent)`,
                display: 'grid', placeItems: 'center' }}>{c.icon}</span>

              {/* info */}
              <div className="col grow" style={{ gap: 3, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flex: 'none' }} />
                  <span className="tiny muted">{c.color}</span>
                </div>
              </div>

              {/* actions */}
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-icon btn-ghost" title="Editar" onClick={() => setModal(c)}>
                  <Icon name="edit" size={16} />
                </button>
                <button className="btn btn-icon btn-ghost" title="Eliminar" onClick={() => setDelCat(c)}>
                  <Icon name="trash" size={16} color="var(--danger)" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* info footer */}
      <p className="tiny muted" style={{ display: 'flex', gap: 6, alignItems: 'center', margin: 0 }}>
        <Icon name="info" size={15} />
        Puedes editar o eliminar cualquier categoría, incluso las que vienen por defecto.
        Los gastos existentes no se borran.
      </p>

      {/* modals */}
      {modal === 'new'  && <CategoryModal onClose={() => setModal(null)} />}
      {modal && modal !== 'new' && <CategoryModal cat={modal} onClose={() => setModal(null)} />}
      {delCat && <DeleteConfirm cat={delCat} onConfirm={handleDelete} onClose={() => setDelCat(null)} />}
    </div>
  );
}
