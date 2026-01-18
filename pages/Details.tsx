
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, Episode, ContentItem } from '../types';
import TvButton from '../components/TvButton';
import Row from '../components/Row';
import { Play, Plus, Check, Star, Calendar, Clock, Layers, Tv, List, ChevronDown } from 'lucide-react';
import { DetailsSkeleton } from '../components/Skeletons';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(null);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // TV Specific State
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  const mediaType = (type as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await api.getDetails(id, mediaType);
        if (typeof data.id === 'string') data.id = parseInt(data.id);
        (data as any).media_type = mediaType;
        
        setContent(data);
        
        // Async watchlist check
        const inList = await watchlistService.isInWatchlist(data.id);
        setInWatchlist(inList);

        // Fetch Recommendations
        const recs = await api.getRecommendations(parseInt(id), mediaType);
        setRecommendations(recs);

        // If it's a TV show, try to set initial season
        if (mediaType === 'tv' && 'seasons' in data && data.seasons && data.seasons.length > 0) {
            // Find the first season that isn't season 0 (specials), unless that's all there is
            const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
            setSelectedSeasonNumber(firstSeason.season_number);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
    // Reset scroll when navigating between details
    window.scrollTo(0, 0);
  }, [id, mediaType, user]); // Refetch status if user changes

  // Fetch Season Details when selected season changes
  useEffect(() => {
    const fetchSeason = async () => {
      if (mediaType !== 'tv' || !content || !id) return;
      
      setLoadingSeason(true);
      try {
        const data = await api.getSeasonDetails(parseInt(id), selectedSeasonNumber);
        setSeasonDetails(data);
      } catch (e) {
        console.error("Failed to load season", e);
      } finally {
        setLoadingSeason(false);
      }
    };

    fetchSeason();
  }, [selectedSeasonNumber, content?.id, mediaType]);

  useEffect(() => {
    const handleUpdate = async () => {
      if (content) {
        const inList = await watchlistService.isInWatchlist(content.id);
        setInWatchlist(inList);
      }
    };
    window.addEventListener('watchlist-updated', handleUpdate);
    return () => window.removeEventListener('watchlist-updated', handleUpdate);
  }, [content, user]);

  useEffect(() => {
    if (!loading && content) {
        const playBtn = document.getElementById('details-play-btn');
        if (playBtn) playBtn.focus();
    }
  }, [loading, content]);

  const toggleWatchlist = async () => {
    if (content) {
      setInWatchlist(prev => !prev); // Optimistic
      await watchlistService.toggleWatchlist(content as any);
    }
  };

  const playEpisode = (season: number, episode: number) => {
    if (!content) return;
    navigate(`/watch/${content.id}?type=tv&s=${season}&e=${episode}`);
  };

  if (loading || !content) return <DetailsSkeleton />;

  // Normalize fields
  const title = 'title' in content ? content.title : content.name;
  const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;
  const runtime = 'runtime' in content ? content.runtime : (content.episode_run_time?.[0] || 0);
  
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden">
      {/* Full screen backdrop with heavy gradient overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src={getImageUrl(content.backdrop_path)} 
          alt={title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 min-h-screen px-4 md:px-20 pt-20 md:pt-24 pb-24 md:pb-20">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Left Column: Poster & Actions */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6 md:gap-8">
            <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 aspect-[2/3] max-w-sm mx-auto lg:max-w-none w-2/3 lg:w-full">
              <img 
                src={getPosterUrl(content.poster_path)} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col gap-3 md:gap-4">
               <TvButton 
                id="details-play-btn"
                variant="primary" 
                icon={<Play fill="currentColor" />}
                className="w-full justify-center"
                onClick={() => {
                  if (mediaType === 'tv') {
                      playEpisode(selectedSeasonNumber, 1);
                  } else {
                      navigate(`/watch/${content.id}?type=movie`);
                  }
                }}
              >
                {mediaType === 'movie' ? 'Watch Movie' : `Start Season ${selectedSeasonNumber}`}
              </TvButton>
              
              <TvButton 
                variant={inWatchlist ? "secondary" : "glass"}
                icon={inWatchlist ? <Check /> : <Plus />}
                className={`w-full justify-center ${inWatchlist ? 'border-red-500/50 bg-red-900/20 text-white' : ''}`}
                onClick={toggleWatchlist}
              >
                {inWatchlist ? "In List" : "Add to List"}
              </TvButton>
            </div>
          </div>

          {/* Right Column: Info & Content */}
          <div className="w-full lg:w-3/4 flex flex-col">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 leading-tight text-center lg:text-left drop-shadow-xl">
                {title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-gray-300 text-sm md:text-lg mb-6 md:mb-8">
                <div className="flex items-center gap-1 md:gap-2">
                  <Star className="text-yellow-500 w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                  <span className="font-bold text-white">{content.vote_average.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{releaseDate ? releaseDate.split('-')[0] : 'N/A'}</span>
                </div>
                
                {mediaType === 'movie' ? (
                  <div className="flex items-center gap-1 md:gap-2">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{runtime}m</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1 md:gap-2">
                      <Layers className="w-4 h-4 md:w-5 md:h-5" />
                      <span>{(content as TvDetails).number_of_seasons} Seasons</span>
                    </div>
                     <div className="flex items-center gap-1 md:gap-2">
                      <List className="w-4 h-4 md:w-5 md:h-5" />
                      <span>{(content as TvDetails).number_of_episodes} Episodes</span>
                    </div>
                  </>
                )}

                {content.genres.map(g => (
                  <span key={g.id} className="px-2 py-0.5 md:px-3 md:py-1 bg-white/10 rounded-full text-xs md:text-sm backdrop-blur-md">
                    {g.name}
                  </span>
                ))}
              </div>

              {content.tagline && (
                <p className="text-lg md:text-xl text-gray-400 italic mb-4 md:mb-6 text-center lg:text-left">"{content.tagline}"</p>
              )}

              <p className="text-base md:text-lg md:text-xl leading-relaxed text-gray-200 mb-8 md:mb-10 max-w-4xl text-center lg:text-left font-light">
                {content.overview}
              </p>

              {/* Cast Row */}
              <div className="mb-8 md:mb-12">
                <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-white/90">Top Cast</h3>
                <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4">
                  {content.credits.cast.slice(0, 8).map(person => (
                    <div key={person.id} className="flex flex-col items-center w-20 md:w-24 text-center flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 md:mb-3 border border-white/20 shadow-lg">
                        {person.profile_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} 
                            alt={person.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                      </div>
                      <p className="text-xs md:text-sm font-medium text-gray-200 line-clamp-1">{person.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* TV Show Seasons & Episodes Section */}
              {mediaType === 'tv' && (content as TvDetails).seasons && (
                <div className="mt-8 border-t border-white/10 pt-8">
                  <div className="flex flex-row items-center justify-between mb-6">
                     <h3 className="text-2xl md:text-3xl font-bold text-white">Episodes</h3>
                     
                     {/* Season Dropdown */}
                     <div className="relative group">
                        <select
                          value={selectedSeasonNumber}
                          onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                          className="appearance-none bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-lg py-2.5 pl-4 pr-10 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer focusable tv-focus min-w-[160px] md:min-w-[200px]"
                        >
                          {(content as TvDetails).seasons.map((season) => (
                            <option key={season.id} value={season.season_number} className="bg-slate-900 text-white">
                              {season.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/70 group-hover:text-white">
                          <ChevronDown size={18} />
                        </div>
                     </div>
                  </div>

                  {/* Episodes List */}
                  <div className="flex flex-col gap-3 md:gap-4">
                    {loadingSeason ? (
                       <div className="flex flex-col gap-4">
                          {[...Array(5)].map((_, i) => (
                             <div key={i} className="w-full h-32 md:h-40 bg-white/5 rounded-xl animate-pulse" />
                          ))}
                       </div>
                    ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                      seasonDetails.episodes.map((episode) => (
                        <div 
                          key={episode.id}
                          className="focusable tv-focus group flex flex-col md:flex-row gap-4 p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-transparent focus:border-white/30 focus:shadow-lg focus:scale-[1.01]"
                          onClick={() => playEpisode(episode.season_number, episode.episode_number)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') playEpisode(episode.season_number, episode.episode_number);
                          }}
                        >
                          {/* Episode Thumbnail */}
                          <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden flex-shrink-0 relative shadow-md bg-black/20">
                             {episode.still_path ? (
                               <img 
                                 src={getStillUrl(episode.still_path)} 
                                 alt={episode.name}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                 loading="lazy"
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center">
                                 <Tv size={32} className="text-white/20" />
                               </div>
                             )}
                             {/* Play Overlay */}
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-md transform scale-75 group-hover:scale-100 transition-transform">
                                  <Play fill="white" size={24} className="text-white ml-1" />
                                </div>
                             </div>
                             {/* Duration Badge */}
                             <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-bold text-white/90">
                               {episode.runtime ? `${episode.runtime}m` : ''}
                             </div>
                          </div>

                          {/* Episode Info */}
                          <div className="flex flex-col justify-center flex-grow min-w-0">
                             <div className="flex items-center gap-3 mb-1">
                               <span className="text-red-500 font-bold text-sm md:text-base whitespace-nowrap">E{episode.episode_number}</span>
                               <h4 className="text-base md:text-lg font-semibold text-white group-focus:text-red-400 transition-colors truncate">{episode.name}</h4>
                             </div>
                             
                             <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                               <span>{episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'Unknown Date'}</span>
                               {episode.vote_average > 0 && (
                                   <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                      <Star size={10} className="text-yellow-500" fill="currentColor" />
                                      <span>{episode.vote_average.toFixed(1)}</span>
                                   </div>
                               )}
                             </div>

                             <p className="text-gray-300 text-xs md:text-sm line-clamp-2 md:line-clamp-3 font-light leading-relaxed">
                                 {episode.overview || "No overview available for this episode."}
                             </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white/5 rounded-xl border border-dashed border-white/10">
                          <Layers className="w-12 h-12 mb-3 opacity-20" />
                          <p>No episodes found for this season.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Recommendations Row */}
        {recommendations.length > 0 && (
           <div className="mt-12 md:mt-16 w-full -ml-4 md:-ml-12">
             <Row 
               title="You May Also Like" 
               items={recommendations} 
               onItemSelect={(recId) => navigate(`/details/${mediaType}/${recId}`)} 
             />
           </div>
        )}
      </div>
    </div>
  );
};

export default Details;
