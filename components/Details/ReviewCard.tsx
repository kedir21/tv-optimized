
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
        <div className="bg-white/[0.03] border border-white/[0.04] rounded-2xl p-5 lg:p-7 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/[0.06] flex items-center justify-center">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={review.author} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 text-white/25" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-white">{review.author}</h4>
                        <p className="text-xs text-white/30">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {rating && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/8 text-amber-400 text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-semibold">{rating}</span>
                    </div>
                )}
            </div>

            <div className="relative">
                <p className={`text-white/55 text-sm leading-relaxed ${!expanded && review.content.length > 300 ? 'line-clamp-4' : ''}`}>
                    {review.content}
                </p>

                {review.content.length > 300 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-2 text-rose-400 hover:text-rose-300 text-sm font-medium transition-colors flex items-center gap-1"
                    >
                        {expanded ? 'Show less' : 'Read more'}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>
        </div>
    );
};
