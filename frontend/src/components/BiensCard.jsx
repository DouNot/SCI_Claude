import { MapPin, Home, Building2, Warehouse, Car, TreePine } from 'lucide-react';

function BiensCard({ bien, onClick }) {
  const typeIcons = {
    APPARTEMENT: Home,
    MAISON: Home,
    LOCAL_COMMERCIAL: Building2,
    BUREAUX: Building2,
    HANGAR: Warehouse,
    PARKING: Car,
    TERRAIN: TreePine
  };

  const Icon = typeIcons[bien.type] || Home;
  const photoUrl = bien.photos?.find(p => p.estPrincipale)?.url || bien.photos?.[0]?.url;
  const isLoue = bien.loyerHC > 0;

  return (
    <div
      onClick={onClick}
      className="group bg-dark-900 rounded-2xl shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden border border-dark-600/30"
    >
      {/* Image ou Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-dark-800 to-dark-700 overflow-hidden">
        {photoUrl ? (
          <>
            <img
              src={`http://localhost:3000${photoUrl}`}
              alt={bien.adresse}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="h-20 w-20 text-accent-blue/30" />
          </div>
        )}
        
        {/* Badge Statut avec couleur d'accent */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
          isLoue 
            ? 'bg-accent-green/80 text-white shadow-glow-green' 
            : 'bg-accent-orange/80 text-white shadow-glow-blue'
        }`}>
          {isLoue ? '● Loué' : '○ Vacant'}
        </div>
      </div>

      {/* Contenu avec plus d'espacement */}
      <div className="p-5">
        {/* Adresse */}
        <h3 className="text-white font-semibold text-base truncate mb-1.5 group-hover:text-accent-blue transition-colors">
          {bien.adresse}
        </h3>
        <p className="text-sm text-light-400 mb-5 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {bien.codePostal} {bien.ville}
        </p>

        {/* Infos principales avec accent coloré */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-700">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-accent-blue">
              {Math.round((bien.valeurActuelle || bien.prixAchat) / 1000)}k
            </span>
            <span className="text-xs text-light-500">€</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-light-500 block mb-1">Surface</span>
            <span className="text-sm text-white font-semibold">
              {bien.surface || '-'} m²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiensCard;
