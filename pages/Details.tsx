import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api, getImageUrl, getPosterUrl, getStillUrl } from '../services/api';
import { watchlistService } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { MovieDetails, TvDetails, SeasonDetails, ContentItem } from '../types';
import TvButton from '../components/TvButton';
import Row from '../components/Row';
import { Play, Plus, Check, Star, Calendar, Clock, Layers, Tv, ChevronDown, X, Youtube, Users, Globe, Award, Film, BookOpen, Sparkles } from 'lucide-react';

const Details: React.FC = () => {
  const { type, id } = useParams<{ type?: string; id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const initialData = location.state?.movie as ContentItem | undefined;
  
  const [content, setContent] = useState<MovieDetails | TvDetails | null>(
    initialData ? (initialData as MovieDetails | TvDetails) : null
  );
  
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(!initialData);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'episodes' | 'details'>('overview');

  const mediaType = (type as 'movie' | 'tv') || 'movie';

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      if (!initialData) setLoading(true);
      
      try {
        const data = await api.getDetails(id, mediaType);
        if (typeof data.id === 'string') data.id = parseInt(data.id);
        (data as any).media_type = mediaType;
        
        setContent(data);
        
        const inList = await watchlistService.isInWatchlist(data.id);
        setInWatchlist(inList);

        const recs = await api.getRecommendations(parseInt(id), mediaType);
        setRecommendations(recs);

        if (mediaType === 'tv' && 'seasons' in data && data.seasons && data.seasons.length > 0) {
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
    window.scrollTo(0, 0);
  }, [id, mediaType, user]);

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

  const toggleWatchlist = async () => {
    if (content) {
      setInWatchlist(prev => !prev);
      await watchlistService.toggleWatchlist(content as any);
    }
  };

  const playEpisode = (season: number, episode: number) => {
    if (!content) return;
    navigate(`/watch/${content.id}?type=tv&s=${season}&e=${episode}`);
  };
  
  const safeContent = content || {} as any;
  const title = 'title' in safeContent ? safeContent.title : safeContent.name;
  const releaseDate = 'release_date' in safeContent ? safeContent.release_date : safeContent.first_air_date;
  const runtime = 'runtime' in safeContent ? safeContent.runtime : (safeContent.episode_run_time?.[0] || 0);
  const voteAverage = safeContent.vote_average || 0;
  const genres = safeContent.genres || [];
  const trailer = safeContent.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');

  if (loading && !content) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full animate-spin" />
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white font-sans overflow-x-hidden">
      {/* Hero Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-gray-900 z-10" />
        <img 
          src={getImageUrl(safeContent.backdrop_path)} 
          alt={title}
          className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-40 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/30 z-20" />
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300">
            <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all z-[110] backdrop-blur-md"
            >
                <X size={24} />
            </button>
            <div className="w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <iframe 
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&modestbranding=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`${title} Trailer`}
                />
            </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-30">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Poster & Quick Actions - Mobile First */}
            <div className="lg:w-1/3 xl:w-1/4 flex flex-col items-center lg:items-start">
              <div className="w-full max-w-sm lg:max-w-none">
                {/* Poster */}
                <div className="relative group rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl hover:shadow-purple-500/20 transition-all duration-500 mb-6">
                  <img 
                    src={getPosterUrl(safeContent.poster_path)} 
                    alt={title}
                    className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700"
                    style={{ viewTransitionName: 'shared-poster' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 lg:mb-8">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold font-mono">{voteAverage.toFixed(1)}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wider mt-1">Rating</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
                    <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold font-mono">{releaseDate ? releaseDate.split('-')[0] : 'N/A'}</div>
                    <div className="text-xs text-white/60 uppercase tracking-wider mt-1">Year</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <TvButton 
                    variant="primary"
                    icon={<Play className="w-5 h-5" />}
                    className="w-full h-12 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30"
                    onClick={() => {
                      if (mediaType === 'tv') {
                          playEpisode(selectedSeasonNumber, 1);
                      } else {
                          navigate(`/watch/${safeContent.id}?type=movie`);
                      }
                    }}
                  >
                    {mediaType === 'movie' ? 'Watch Now' : 'Start Watching'}
                  </TvButton>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <TvButton 
                      variant={inWatchlist ? "secondary" : "glass"}
                      icon={inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      className={`h-11 rounded-xl ${inWatchlist ? 'bg-purple-600/20 border-purple-500/50' : 'border-white/10 hover:bg-white/10'}`}
                      onClick={toggleWatchlist}
                    >
                      {inWatchlist ? 'In List' : 'My List'}
                    </TvButton>
                    
                    {trailer && (
                      <TvButton 
                        variant="glass"
                        icon={<Youtube className="w-4 h-4" />}
                        className="h-11 rounded-xl border border-white/10 hover:bg-white/10"
                        onClick={() => setShowTrailer(true)}
                      >
                        Trailer
                      </TvButton>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-2/3 xl:w-3/4">
              {/* Title & Meta */}
              <div className="mb-6 lg:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full text-xs font-semibold text-purple-300 border border-purple-500/30">
                    {mediaType === 'movie' ? 'MOVIE' : 'SERIES'}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>{safeContent.status}</span>
                    <span>•</span>
                    <span>{safeContent.original_language?.toUpperCase()}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  {title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">{mediaType === 'movie' ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : `${safeContent.number_of_seasons} Season${safeContent.number_of_seasons !== 1 ? 's' : ''}`}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g: any) => (
                      <span key={g.id} className="px-3 py-1 bg-white/5 rounded-full text-sm border border-white/10">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mb-6 lg:mb-8">
                <div className="flex space-x-1 border-b border-white/10">
                  {['overview', 'cast', mediaType === 'tv' ? 'episodes' : 'details', 'details'].filter(tab => tab !== 'episodes' || mediaType === 'tv').map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px capitalize ${
                        activeTab === tab
                          ? 'text-white border-purple-500'
                          : 'text-white/60 border-transparent hover:text-white'
                      }`}
                    >
                      {tab === 'overview' && 'Overview'}
                      {tab === 'cast' && 'Cast & Crew'}
                      {tab === 'episodes' && 'Episodes'}
                      {tab === 'details' && 'Details'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="mb-8 lg:mb-12">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {safeContent.tagline && (
                      <div className="relative pl-4 border-l-2 border-purple-500">
                        <p className="text-xl lg:text-2xl italic text-white/90 font-light">
                          "{safeContent.tagline}"
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        Synopsis
                      </h3>
                      <p className="text-white/80 leading-relaxed text-lg font-light">
                        {safeContent.overview}
                      </p>
                    </div>

                    {/* Featured Crew */}
                    {safeContent.credits?.crew && (
                      <div>
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-400" />
                          Featured Crew
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {safeContent.credits.crew
                            .filter((person: any) => ['Director', 'Writer', 'Creator'].includes(person.job))
                            .slice(0, 3)
                            .map((person: any) => (
                              <div key={person.id} className="bg-white/5 rounded-xl p-4 border border-white/10 min-w-[200px]">
                                <p className="font-semibold text-white">{person.name}</p>
                                <p className="text-sm text-white/60 mt-1">{person.job}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cast & Crew Tab */}
                {activeTab === 'cast' && safeContent.credits?.cast && (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {safeContent.credits.cast.slice(0, 12).map((person: any) => (
                        <div key={person.id} className="group cursor-pointer">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 relative">
                            {person.profile_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <Users className="w-8 h-8 text-white/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                              {person.name}
                            </p>
                            <p className="text-sm text-white/60 truncate">
                              {person.character}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Episodes Tab (TV Only) */}
                {activeTab === 'episodes' && mediaType === 'tv' && (
                  <div className="space-y-6">
                    {/* Season Selector */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">Episodes</h3>
                      <div className="relative">
                        <select
                          value={selectedSeasonNumber}
                          onChange={(e) => setSelectedSeasonNumber(parseInt(e.target.value))}
                          className="appearance-none bg-white/5 border border-white/10 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          {safeContent.seasons.map((season: any) => (
                            <option key={season.id} value={season.season_number}>
                              {season.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
                      </div>
                    </div>

                    {/* Episodes List */}
                    {loadingSeason ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      </div>
                    ) : seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                      <div className="space-y-4">
                        {seasonDetails.episodes.map((episode) => (
                          <div
                            key={episode.id}
                            onClick={() => playEpisode(episode.season_number, episode.episode_number)}
                            className="group bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <span className="text-lg font-bold">{episode.episode_number}</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-lg group-hover:text-purple-300 transition-colors">
                                    {episode.name}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    {episode.runtime && (
                                      <span className="text-sm text-white/60">
                                        {episode.runtime}m
                                      </span>
                                    )}
                                    <span className="text-sm text-white/60">
                                      {episode.air_date || 'TBA'}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-white/70 line-clamp-2">
                                  {episode.overview || 'No description available.'}
                                </p>
                                <div className="flex items-center gap-3 mt-3">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-medium">
                                      {episode.vote_average?.toFixed(1) || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-white/60">
                        No episodes available for this season.
                      </div>
                    )}
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-400" />
                          Production
                        </h4>
                        <div className="space-y-3">
                          {safeContent.production_companies?.map((company: any) => (
                            <div key={company.id} className="flex items-center gap-3">
                              {company.logo_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                  alt={company.name}
                                  className="h-8 object-contain"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                                  <Film className="w-4 h-4 text-white/40" />
                                </div>
                              )}
                              <span className="font-medium">{company.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold mb-3">Spoken Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {safeContent.spoken_languages?.map((lang: any) => (
                            <span key={lang.iso_639_1} className="px-3 py-1 bg-white/5 rounded-full text-sm border border-white/10">
                              {lang.english_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {safeContent.budget > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-green-400" />
                            Budget & Revenue
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-white/70">Budget:</span>
                              <span className="font-medium">
                                ${(safeContent.budget / 1000000).toFixed(1)}M
                              </span>
                            </div>
                            {safeContent.revenue > 0 && (
                              <div className="flex justify-between">
                                <span className="text-white/70">Revenue:</span>
                                <span className="font-medium">
                                  ${(safeContent.revenue / 1000000).toFixed(1)}M
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-lg font-semibold mb-3">Status</h4>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                          <div className={`w-2 h-2 rounded-full ${
                            safeContent.status === 'Released' ? 'bg-green-500' :
                            safeContent.status === 'In Production' ? 'bg-yellow-500' :
                            safeContent.status === 'Post Production' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`} />
                          <span className="font-medium">{safeContent.status}</span>
                        </div>
                      </div>

                      {safeContent.homepage && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3">Official Site</h4>
                          <a 
                            href={safeContent.homepage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-2"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="border-t border-white/10 mt-8 lg:mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2">More Like This</h2>
                <p className="text-white/60">Discover similar content you might enjoy</p>
              </div>
              <Row 
                title="" 
                items={recommendations} 
                onItemSelect={(rec) => navigate(`/details/${mediaType}/${rec.id}`, { state: { movie: rec } })} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
