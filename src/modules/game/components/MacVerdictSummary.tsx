import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { type MacVerdict } from '@/modules/game/types/MacVerdict';
import { type PlayMethodSummary } from '@/modules/game/types/PlayMethodSummary';
import { summarizeChips } from '@/modules/game/utils/summarizeChips';

const PERFORMANCE_LABELS: Record<string, string> = {
  EXCELLENT: 'excellently',
  VERY_GOOD: 'very well',
  GOOD: 'well',
  PLAYABLE: 'playably',
  BARELY_PLAYABLE: 'barely playably',
  UNPLAYABLE: 'unplayably',
};

const METHOD_LABELS: Record<string, string> = {
  NATIVE: 'natively',
  CROSSOVER: 'through CrossOver',
  PARALLELS: 'in Parallels',
  OTHER: 'through another layer',
};

type MacVerdictSummaryProps = {
  gameName: string;
  verdict: MacVerdict;
};

const pluralizeReports = (count: number) =>
  `${count} ${count === 1 ? 'report' : 'reports'}`;

const describeMethod = (method: PlayMethodSummary): string => {
  const performance = PERFORMANCE_LABELS[method.bestPerformance] ?? 'unrated';
  const label =
    METHOD_LABELS[method.playMethod] ?? method.playMethod.toLowerCase();
  const framerate = isDefined(method.medianFps)
    ? ` at a median ${method.medianFps} fps`
    : '';

  return `${performance} ${label}${framerate} (${pluralizeReports(method.reportCount)})`;
};

export const MacVerdictSummary = ({
  gameName,
  verdict,
}: MacVerdictSummaryProps) => {
  if (verdict.confidence === 'none') {
    return (
      <p className="text-gray-400">
        Nobody has reported running {gameName} on a Mac yet. Add the first
        experience report if you have tried it.
      </p>
    );
  }

  if (!isNonEmptyArray(verdict.methods)) {
    return null;
  }

  const methodSentence = verdict.methods.map(describeMethod).join(', and ');

  if (verdict.confidence === 'thin') {
    const caveat =
      verdict.thinReason === 'tooFewReports'
        ? `Only ${pluralizeReports(verdict.reportCount)} so far, so this is not a reliable verdict yet.`
        : `Most of these ${pluralizeReports(verdict.reportCount)} do not record a framerate, so treat the numbers loosely.`;

    return (
      <p className="text-gray-300">
        <span className="text-amber-300/90">Limited data.</span> {gameName} runs{' '}
        {methodSentence} on {summarizeChips(verdict.chips)}. {caveat}
      </p>
    );
  }

  return (
    <p className="text-gray-300">
      <span className="font-medium text-white">{gameName}</span> runs{' '}
      {methodSentence} on Apple Silicon. Based on{' '}
      {pluralizeReports(verdict.reportCount)} across{' '}
      {summarizeChips(verdict.chips)}.
    </p>
  );
};
