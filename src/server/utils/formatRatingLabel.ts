
export const formatRatingLabel = (rating: string) => {
  switch (rating) {
    case 'ALL':
      return 'All Games';
    case 'EXCELLENT':
      return 'Excellent';
    case 'GOOD':
      return 'Good';
    case 'BARELY_PLAYABLE':
      return 'Barely Playable';
    case 'PLAYABLE':
      return 'Playable';
    case 'UNPLAYABLE':
      return 'Unplayable';
    default:
      return rating;
  }
};
