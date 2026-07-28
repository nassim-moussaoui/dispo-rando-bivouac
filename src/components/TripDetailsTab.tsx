import React, { useState } from 'react';
import { TripDetails, Participant, BivouacSpot } from '../types';
import { Compass, ThumbsUp, MapPin, Plus, Sparkles, Car, Mountain, Gauge } from 'lucide-react';

interface TripDetailsTabProps {
  tripDetails: TripDetails | null;
  onSaveTripDetails: (details: TripDetails) => void;
  currentParticipant: Participant | null;
  onOpenUserModal: () => void;
}

const DEFAULT_SUGGESTED_LOCATIONS: BivouacSpot[] = [
  {
    id: 'spot-1',
    name: "Lac d'Oeschinen (Oeschinensee)",
    region: 'Suisse (Canton de Berne)',
    difficulty: 'Moyen',
    elevation: '+500m D+',
    driveTimeFromMontpellier: 'Temps trajet : 7h15',
    duration: '2 jours / 1 nuit',
    description: 'Lac glaciaire turquoise grandiose bordé par des falaises verticales de 500m.',
    imageUrl: 'https://hikesandtravels.com/wp-content/uploads/2023/08/accueil.jpg',
    votes: [],
  },
  {
    id: 'spot-2',
    name: 'Lac Blanc (Chamonix)',
    region: 'Haute-Savoie (Aiguilles Rouges)',
    difficulty: 'Moyen / Soutenu',
    elevation: '+900m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h45',
    duration: '2 jours / 1 nuit',
    description: 'Miroir d’eau légendaire reflétant toute la chaîne du Mont-Blanc au coucher du soleil.',
    imageUrl: 'https://www.chamonix.com/sites/default/files/styles/ogimage/public/media/images/Lac-Blanc-----OT-Vallee-de-Chamonix-Morgane-Raylat.jpg?itok=BVhhrQ7a',
    votes: [],
  },
  {
    id: 'spot-3',
    name: 'Lac du Montagnon',
    region: 'Pyrénées-Atlantiques (Aspe)',
    difficulty: 'Soutenu',
    elevation: '+1100m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h30',
    duration: '2 jours / 1 nuit',
    description: 'Le fameux lac alpin naturel en forme de cœur parfait à 2180m d’altitude.',
    imageUrl: 'https://www.guide-bearn-pyrenees.com/_bibli/annonces/3025/hd/lac-de-montagnon3.jpg',
    votes: [],
  },
  {
    id: 'spot-4',
    name: 'Gorges du Verdon',
    region: 'Var / Alpes-de-Haute-Provence',
    difficulty: 'Facile à Moyen',
    elevation: '+400m D+',
    driveTimeFromMontpellier: 'Temps trajet : 3h15',
    duration: '2 jours / 1 nuit',
    description: 'Le plus grand canyon d’Europe avec ses eaux turquoise et panoramas vertigineux.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Verdon_Gorge_1.jpg/1280px-Verdon_Gorge_1.jpg',
    votes: [],
  },
  {
    id: 'spot-5',
    name: 'Lacs des Chéserys',
    region: 'Haute-Savoie (Chamonix)',
    difficulty: 'Moyen',
    elevation: '+800m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h45',
    duration: '2 jours / 1 nuit',
    description: 'Série de lacs alpins calmes face au massif du Mont-Blanc, idéal pour le bivouac.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Danis-Torrenti-08-2024-Lac-Chezerys.jpg',
    votes: [],
  },
  {
    id: 'spot-6',
    name: 'Lac de Brienz (Brienzersee)',
    region: 'Suisse (Oberland Bernois)',
    difficulty: 'Facile',
    elevation: '+450m D+',
    driveTimeFromMontpellier: 'Temps trajet : 7h30',
    duration: '2 jours / 1 nuit',
    description: 'Lac suisse d’une couleur turquoise éclatante surplombé par des sommets alpins.',
    imageUrl: 'https://cdn.generationvoyage.fr/2026/02/media-lac-de-brienz-1.jpg',
    votes: [],
  },
  {
    id: 'spot-7',
    name: 'Le Grand Veymont',
    region: 'Isère / Drôme (Vercors)',
    difficulty: 'Soutenu',
    elevation: '+1050m D+',
    driveTimeFromMontpellier: 'Temps trajet : 3h00',
    duration: '2 jours / 1 nuit',
    description: 'Toit du Vercors (2341m) avec panorama 360°, bouquetins et vue sur le Mont Aiguille.',
    imageUrl: 'https://www.trace-ta-route.com/wp-content/uploads/2018/07/Randonnee-Vercors-Grand-Veymont-14-Pas-Bachassons-blog-Trace-Les-Cimes-1050x700.jpg',
    votes: [],
  },
  {
    id: 'spot-8',
    name: 'Limmernsee (Lac de Limmern)',
    region: 'Suisse (Canton de Glaris)',
    difficulty: 'Soutenu',
    elevation: '+1000m D+',
    driveTimeFromMontpellier: 'Temps trajet : 8h00',
    duration: '2 jours / 1 nuit',
    description: 'Lac de barrage spectaculaire coincé entre d’immenses murailles de roche brute.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Limmernsee_und_Muttsee_Mauer_fertig.JPG',
    votes: [],
  },
  {
    id: 'spot-9',
    name: "Lac d'Allos",
    region: 'Alpes-de-Haute-Provence (Mercantour)',
    difficulty: 'Facile / Moyen',
    elevation: '+400m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h00',
    duration: '2 jours / 1 nuit',
    description: 'Plus grand lac naturel d’altitude d’Europe (2228m) au cœur du Parc du Mercantour.',
    imageUrl: 'https://www.valdallos.com/medias/images/prestataires/138333-lacdallos_printemps.jpg',
    votes: [],
  },
  {
    id: 'spot-10',
    name: "Lac d'Aubert & Néouvielle",
    region: 'Hautes-Pyrénées (Néouvielle)',
    difficulty: 'Facile / Moyen',
    elevation: '+450m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h15',
    duration: '2 jours / 1 nuit',
    description: 'Décor féerique de granite, pins à crochets et lacs transparents de la réserve naturelle.',
    imageUrl: 'https://www.lacsdespyrenees.com/65/aure/images/125-Aumar-Aubert.jpg',
    votes: [],
  },
  {
    id: 'spot-11',
    name: 'Lac Fourchu',
    region: 'Isère (Massif du Taillefer)',
    difficulty: 'Moyen',
    elevation: '+700m D+',
    driveTimeFromMontpellier: 'Temps trajet : 3h15',
    duration: '2 jours / 1 nuit',
    description: 'Plateau des lacs rappelant la toundra arctique avec vue magique sur la Meije.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Lac_Fourchu.jpg',
    votes: [],
  },
  {
    id: 'spot-12',
    name: 'Lac Lauvitel',
    region: 'Isère (Écrins)',
    difficulty: 'Moyen',
    elevation: '+550m D+',
    driveTimeFromMontpellier: 'Temps trajet : 3h30',
    duration: '2 jours / 1 nuit',
    description: 'Le plus grand lac des Écrins, enchâssé dans un cirque montagneux impressionnant.',
    imageUrl: 'https://www.bourgdoisans.com/wp-content/uploads/wpetourisme/9594146-diaporama-1200x800.jpg',
    votes: [],
  },
  {
    id: 'spot-13',
    name: "Lac de l'Oule",
    region: 'Hautes-Pyrénées (Aure)',
    difficulty: 'Facile',
    elevation: '+300m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h15',
    duration: '2 jours / 1 nuit',
    description: 'Bivouac très accessible aux portes du massif du Néouvielle, entouré de forêts.',
    imageUrl: 'https://geotrek-admin.ecrins-parcnational.fr/media/paperclip/trekking_trek/996636/lac-de-loule-serre-chevalier-briancon-3-xtvsvl6hn9m6.jpg',
    votes: [],
  },
  {
    id: 'spot-14',
    name: "Lacs d'Ayous",
    region: 'Pyrénées-Atlantiques (Ossau)',
    difficulty: 'Moyen',
    elevation: '+800m D+',
    driveTimeFromMontpellier: 'Temps trajet : 4h30',
    duration: '2 jours / 1 nuit',
    description: 'Boucle mythique offrant le reflet parfait du Pic du Midi d’Ossau dans le lac au lever du jour.',
    imageUrl: 'https://www.valleedossau.com/medias/images/prestataires/LAC-GENTAU-AYOUS1-OTVO.jpg',
    votes: [],
  },
  {
    id: 'spot-15',
    name: 'Dolomites (Sorapis / Tre Cime)',
    region: 'Italie (Haut-Adige / Vénétie)',
    difficulty: 'Soutenu',
    elevation: '+850m D+',
    driveTimeFromMontpellier: 'Temps trajet : 9h00',
    duration: '3 jours / 2 nuits',
    description: 'Tours calcaires de légende mondiales et lacs turquoise nacré extraordinaires.',
    imageUrl: 'https://monsieurmadameexplore.com/wp-content/uploads/2021/03/panorama_lago_sorapis-1024x626.jpg',
    votes: [],
  },
  {
    id: 'spot-16',
    name: 'Lac du Pontet',
    region: 'Hautes-Alpes (La Grave / Meije)',
    difficulty: 'Très facile',
    elevation: '+150m D+',
    driveTimeFromMontpellier: 'Temps trajet : 3h45',
    duration: '2 jours / 1 nuit',
    description: 'Bivouac ultra contemplatif à effort minimal face aux glaciers majestueux de la Meije.',
    imageUrl: 'https://moimesgodassesetmonchien.com/wp-content/uploads/2023/08/IMG_8177-2.jpg',
    votes: [],
  },
];

export const TripDetailsTab: React.FC<TripDetailsTabProps> = ({
  tripDetails,
  onSaveTripDetails,
  currentParticipant,
  onOpenUserModal,
}) => {
  const details = tripDetails || {
    title: 'Rando Bivouac entre potes',
    organizerName: 'Nassim',
    description: 'Un super week-end en bivouac.',
    suggestedLocations: DEFAULT_SUGGESTED_LOCATIONS,
    updatedAt: new Date().toISOString(),
  };

  const handleVoteLocation = (locationId: string) => {
    if (!currentParticipant) {
      onOpenUserModal();
      return;
    }

    const updatedLocations = details.suggestedLocations.map((loc) => {
      if (loc.id === locationId) {
        const hasVoted = loc.votes.includes(currentParticipant.id);
        const newVotes = hasVoted
          ? loc.votes.filter((id) => id !== currentParticipant.id)
          : [...loc.votes, currentParticipant.id];
        return { ...loc, votes: newVotes };
      }
      return loc;
    });

    onSaveTripDetails({
      ...details,
      suggestedLocations: updatedLocations,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Destinations & Itineraries Section */}
      <div className="bg-white border-4 border-emerald-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Spots de Bivouac & Temps de Trajet depuis Montpellier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
            Où est-ce qu’on part bivouaquer ?
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Vote pour tes spots préférés pour choisir la destination finale du groupe !
          </p>
        </div>

        {/* Spots grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {details.suggestedLocations.map((loc) => {
            const hasVoted = currentParticipant && loc.votes.includes(currentParticipant.id);

            return (
              <div
                key={loc.id}
                className="bg-white rounded-2xl border-2 border-emerald-100 flex flex-col justify-between overflow-hidden hover:border-emerald-300 transition shadow-sm"
              >
                {loc.imageUrl && (
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={loc.imageUrl}
                      alt={loc.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] uppercase font-black text-emerald-950 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm truncate">
                        {loc.region}
                      </span>
                      <span className="text-[11px] font-black text-amber-950 bg-amber-200/90 backdrop-blur-md border border-amber-300 px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                        {loc.difficulty}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {!loc.imageUrl && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] uppercase font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 truncate">
                          {loc.region}
                        </span>
                        <span className="text-[11px] font-black text-amber-950 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0">
                          {loc.difficulty}
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className="text-base font-black text-emerald-950 flex items-start gap-1.5 leading-snug">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{loc.name}</span>
                      </h3>
                    </div>

                    {/* Badges for Drive Time, Difficulty, Elevation */}
                    <div className="space-y-1.5 pt-1">
                      {loc.driveTimeFromMontpellier && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                          <Car className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{loc.driveTimeFromMontpellier}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {loc.elevation && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Mountain className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span>Dénivelé : {loc.elevation}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Gauge className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>Difficulte : {loc.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{loc.description}</p>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleVoteLocation(loc.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        hasVoted
                          ? 'bg-emerald-500 text-white shadow-[0_3px_0_rgb(5,150,105)]'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{hasVoted ? 'J’aime ce spot !' : 'Voter'}</span>
                    </button>

                    <span className="text-xs font-black text-emerald-900 font-mono">
                      {loc.votes.length} vote(s)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

