import React from 'react';
import { Compass, Home, MapPinOff, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top bar branding */}
      <header className="bg-white border-b-4 border-emerald-500 py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-emerald-950 font-black text-lg tracking-tight hover:opacity-80 transition cursor-pointer"
          >
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <span>DISPO RANDO BIVOUAC</span>
          </button>
        </div>
      </header>

      {/* Main 404 Hero Section */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-lg w-full bg-white border-4 border-emerald-100 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in duration-300">
          
          {/* Icon Badge */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200 shadow-inner">
            <MapPinOff className="w-10 h-10 stroke-[2.5]" />
          </div>

          {/* Error Title & Message */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              Erreur 404 • Hors Sentier
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 leading-tight">
              Oups ! On dirait qu'il n'y a rien par ici.
            </h1>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              Vous vous êtes un peu éloigné du tracé du bivouac. La page que vous cherchez n'existe pas ou a été déplacée.
            </p>
          </div>

          {/* CTA Action Button */}
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Retourner à l'accueil</span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-emerald-100 py-6 text-xs font-bold border-t-4 border-emerald-950 text-center">
        <p>Dispo Rando Bivouac • Organise ton week-end facilement</p>
      </footer>

    </div>
  );
};
