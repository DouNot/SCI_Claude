import { MapPin, FileText } from 'lucide-react';

function BiensTable({ biens, onBienClick }) {
  const isLoue = (bien) => bien.statut === 'LOUE' || (bien.bailActif && bien.bailActif.statut === 'ACTIF');

  return (
    <div className="space-y-4">
      {biens.map((bien) => (
        <div
          key={bien.id}
          onClick={() => onBienClick(bien)}
          className="group bg-dark-900 rounded-2xl p-6 hover:shadow-card-hover hover:scale-[1.01] transition-all cursor-pointer border border-dark-600/30 shadow-card"
        >
          <div className="flex items-center justify-between">
            {/* Partie gauche - Adresse avec icône colorée */}
            <div className="flex items-start gap-4 flex-1">
              <div className="mt-1 p-3 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
                <MapPin className="h-5 w-5 text-accent-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base mb-1.5 truncate group-hover:text-accent-blue transition-colors">
                  {bien.adresse}
                </h3>
                <p className="text-sm text-light-400">
                  {bien.codePostal} {bien.ville}
                </p>
              </div>
            </div>

            {/* Partie droite - Infos avec plus d'espace */}
            <div className="flex items-center gap-12 ml-8">
              {/* Valeur avec accent */}
              <div>
                <p className="text-xs text-light-500 mb-1.5">Valeur</p>
                <p className="text-lg font-bold text-accent-blue whitespace-nowrap">
                  {(bien.valeurActuelle || bien.prixAchat).toLocaleString('fr-FR')} €
                </p>
              </div>

              {/* Loyer HC avec badge coloré */}
              <div className="text-right min-w-[120px]">
                <p className="text-xs text-light-500 mb-1.5">Loyer HC</p>
                {isLoue(bien) && bien.loyerActuel ? (
                  <p className="text-base font-semibold text-accent-green whitespace-nowrap">
                    {bien.loyerActuel.toLocaleString('fr-FR')} €/mois
                  </p>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-orange/20 text-accent-orange text-sm font-medium border border-accent-orange/30">
                    ○ Vacant
                  </span>
                )}
              </div>

              {/* Surface avec bordure colorée */}
              <div className="text-right min-w-[80px] pl-6 border-l border-dark-700">
                <p className="text-xs text-light-500 mb-1.5">Surface</p>
                <p className="text-base font-semibold text-white">
                  {bien.surface || '-'} m²
                </p>
              </div>

              {/* Icône avec effet */}
              <div className="p-2 rounded-lg bg-dark-800/50 opacity-60 group-hover:opacity-100 group-hover:bg-accent-blue/10 transition-all">
                <FileText className="h-5 w-5 text-light-400 group-hover:text-accent-blue transition-colors" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {biens.length === 0 && (
        <div className="bg-dark-900 rounded-2xl py-20 text-center border border-dark-600/30 shadow-card">
          <MapPin className="h-16 w-16 text-accent-blue/40 mx-auto mb-4" />
          <p className="text-light-300 text-lg">Aucun bien pour le moment</p>
        </div>
      )}
    </div>
  );
}

export default BiensTable;
