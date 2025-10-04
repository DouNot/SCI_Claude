import { LayoutGrid, Building2, Users2, FolderOpen, Settings } from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate }) {
  const Item = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
        ${currentPage === id
          ? 'bg-white/10 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="p-3">
      <div className="px-1 py-2 font-semibold">Je sais app</div>

      <div className="mt-2 space-y-1">
        <Item id="dashboard"   label="Synthèse"   icon={LayoutGrid} />
        <Item id="biens"       label="Biens"      icon={Building2} />
        <Item id="locataires"  label="Locataires" icon={Users2} />
        <Item id="documents"   label="Documents"  icon={FolderOpen} />
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <Item id="parametres" label="Paramètres" icon={Settings} />
      </div>
    </div>
  );
}
