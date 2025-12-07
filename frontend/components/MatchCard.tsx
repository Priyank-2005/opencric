// filepath: frontend/components/MatchCard.tsx
import Link from 'next/link';
import { format } from 'date-fns';

export default function MatchCard({ match }: { match: any }) {
  const { info } = match;
  const title = `${info.teams[0]} vs ${info.teams[1]}`;
  const date = info.dates && info.dates[0] ? new Date(info.dates[0]) : new Date();

  return (
    <Link href={`/match/${match._id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-red-600 uppercase">{info.match_type} • {info.event?.name || 'International'}</span>
          <span className="text-xs text-gray-500">{format(date, 'MMM d, yyyy')}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{info.venue}</p>
        
        <div className="flex justify-between items-center text-sm font-medium">
          <div className="flex flex-col">
            <span>{info.teams[0]}</span>
            {/* Simple score display logic would go here */}
          </div>
          <span className="text-gray-400">vs</span>
          <div className="flex flex-col text-right">
            <span>{info.teams[1]}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
           <p className="text-xs text-blue-600 font-medium">
             {info.outcome?.winner ? `${info.outcome.winner} won` : 'Live'}
           </p>
        </div>
      </div>
    </Link>
  );
}