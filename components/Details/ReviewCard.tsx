
import React, { useState } from 'react';
import { Star, User, ChevronDown } from 'lucide-react';
import { Review } from '../../types';

interface ReviewCardProps {
    review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const [expanded, setExpanded] = useState(false);
    const rating = review.author_details?.rating;
    const avatar = review.author_details?.avatar_path;
    const avatarUrl = avatar
        ? (avatar.startsWith('http') ? avatar.substring(1) : `https://image.tmdb.org/t/p/w185${avatar}`)
        : null;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={review.author} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-6 h-6 text-white/40" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{review.author}</h4>
                        <p className="text-sm text-white/40">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {rating && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{rating}</span>
                    </div>
                )}
            </div>

            <div className="relative">
                <p className={`text-white/70 leading-relaxed ${!expanded && review.content.length > 300 ? 'line-clamp-4' : ''}`}>
                    {review.content}
                </p>

                {review.content.length > 300 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1"
                    >
                        {expanded ? 'Show less' : 'Read more'}
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
        </div>
    );
};
