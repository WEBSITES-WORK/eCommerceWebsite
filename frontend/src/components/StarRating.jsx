import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxRating = 5,
  size = 'w-4 h-4',
  interactive = false,
  onRate,
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);

        return (
          <button
            type="button"
            key={index}
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(starValue)}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } p-0.5`}
          >
            <Star
              className={`${size} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
