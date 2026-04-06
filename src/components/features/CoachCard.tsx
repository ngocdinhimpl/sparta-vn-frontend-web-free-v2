import React from 'react';
import { Icons } from '@/constants';

interface CoachCardProps {
  name: string;
  avatarImage?: string;
}

const CoachCard: React.FC<CoachCardProps> = ({ name, avatarImage }) => {
  return (
    <div className="relative rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[2.5/1] shadow-2xl group cursor-pointer bg-white">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50"></div>
      
      {/* Abstract Shapes */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-200/20 rounded-full blur-3xl"></div>
      <div className="absolute left-1/4 bottom-0 w-32 h-32 bg-red-200/20 rounded-full blur-3xl"></div>

      <div className="absolute inset-0 flex items-center justify-end px-12 md:px-20 overflow-hidden">
        <img 
          src={avatarImage || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"} 
          alt="Coach Avatar" 
          className="h-[120%] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 translate-y-10"
        />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="space-y-2 max-w-xs">
          <span className="inline-block bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-red-200">
            Your Avatar
          </span>
          {/* <h2 className="text-3xl font-extrabold text-slate-800 drop-shadow-sm">{name}</h2> */}
        </div>
      </div>
    </div>
  );
};

export default CoachCard;
