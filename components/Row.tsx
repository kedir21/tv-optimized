import React from 'react';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import { RowSkeleton } from './Skeletons';

interface RowProps {
  title: string;
  movies: Movie[];
  onMovieSelect: (id: number) => void;
  isLoading?: boolean;
}

const Row: React.FC<RowProps> = ({ title, movies, onMovieSelect, isLoading = false }) => {
  return (
    <div className="mb-8 md:mb-12 pl-4 md:pl-12">
      <h2 className="text-lg md:text-2xl font-bold text-gray-100 mb-3 md:mb-6 tracking-wide pl-1">{title}</h2>
      {isLoading ? (
        <RowSkeleton />
      ) : (
        <div className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar py-2 md:py-4 px-1 scroll-smooth">
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onClick={() => onMovieSelect(movie.id)} 
            />
          ))}
          {/* Spacer for end of row */}
          <div className="w-4 md:w-12 flex-shrink-0" />
        </div>
      )}
    </div>
  );
};

export default Row;