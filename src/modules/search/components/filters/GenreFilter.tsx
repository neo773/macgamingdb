import { SelectFilter } from 'macgamingdb-ui/input/SelectFilter';
import { type GenreFilter as GenreFilterType } from '@/modules/search/types/GenreFilter';

type GenreOption = {
  value: string;
  label: string;
};

type GenreFilterProps = {
  selectedGenre: GenreFilterType;
  genreOptions: GenreOption[];
  onGenreChange: (value: string) => void;
  className?: string;
};

export const GenreFilter = ({
  selectedGenre,
  genreOptions,
  onGenreChange,
  className = '',
}: GenreFilterProps) => (
  <SelectFilter
    value={selectedGenre}
    onValueChange={onGenreChange}
    options={genreOptions}
    placeholder="All Genres"
    className={className}
    minWidth="150px"
  />
);
