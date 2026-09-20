type PlayMethodCounts = {
  native: number;
  crossover: number;
  parallels: number;
  other: number;
};

type PlayMethodBarsProps = {
  methods: PlayMethodCounts;
};

const METHOD_ORDER = [
  { key: 'native', label: 'Native' },
  { key: 'crossover', label: 'CrossOver' },
  { key: 'parallels', label: 'Parallels' },
  { key: 'other', label: 'Other' },
] as const;

export const PlayMethodBars = ({ methods }: PlayMethodBarsProps) => {
  const highest = Math.max(
    methods.native,
    methods.crossover,
    methods.parallels,
    methods.other,
  );

  return (
    <ul className="space-y-3">
      {METHOD_ORDER.map(({ key, label }) => {
        const count = methods[key];
        const fillPercentage = highest > 0 ? (count / highest) * 100 : 0;

        return (
          <li key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-gray-300">{label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-700/70">
              <span
                className="block h-full rounded-full bg-blue-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </span>
            <span className="w-8 shrink-0 text-right font-medium tabular-nums text-white">
              {count}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
