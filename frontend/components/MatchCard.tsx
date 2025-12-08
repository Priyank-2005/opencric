// === File: frontend/components/MatchCard.tsx ===
import Link from 'next/link';
import { format } from 'date-fns';

function getLatestScore(match: any) {
  // Returns a summary like "120/3 (18.4)" or null
  if (!match?.innings || match.innings.length === 0) return null;
  const last = match.innings[match.innings.length - 1];
  let runs = 0;
  let wickets = 0;
  let balls = 0;
  if (Array.isArray(last.overs)) {
    last.overs.forEach((o: any) => {
      if (Array.isArray(o.deliveries)) {
        balls += o.deliveries.length;
        o.deliveries.forEach((d: any) => {
          runs += (d?.runs?.total) || 0;
          if (Array.isArray(d?.wickets) && d.wickets.length) wickets += d.wickets.length;
        });
      }
    });
  }
  const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
  return `${runs}/${wickets} (${overs})`;
}

export default function MatchCard({ match }: { match: any }) {
  const { info } = match;
  const title = `${info.teams[0]} vs ${info.teams[1]}`;
  // parse date safely (accepts 'YYYY-MM-DD' strings)
  const rawDate = info.dates && info.dates[0] ? info.dates[0] : new Date().toISOString();
  const date = new Date(typeof rawDate === 'string' && rawDate.length === 10 ? rawDate + 'T00:00:00Z' : rawDate);

  const score = getLatestScore(match);
  const outcomeText = info.outcome?.winner ? `${info.outcome.winner} won` : (score ? `Live • ${score}` : 'Upcoming');

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
          </div>
          <span className="text-gray-400">vs</span>
          <div className="flex flex-col text-right">
            <span>{info.teams[1]}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
           <p className={`text-xs ${info.outcome?.winner ? 'text-green-600' : 'text-blue-600'} font-medium`}>
             {outcomeText}
           </p>
        </div>
      </div>
    </Link>
  );
}
