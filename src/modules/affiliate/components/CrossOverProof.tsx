import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { type CrossOverPitch } from '@/modules/affiliate/types/CrossOverPitch';

type CrossOverProofProps = {
  pitch: CrossOverPitch;
};

export const CrossOverProof = ({ pitch }: CrossOverProofProps) => {
  const { reportCount, playableReportCount, medianFps } = pitch;
  const framerate = isDefined(medianFps) && (
    <>
      {' '}
      at a median{' '}
      <span className="font-semibold text-white">{medianFps} fps</span>
    </>
  );

  if (reportCount === 1) {
    return (
      <p className="text-sm text-gray-400">
        <span className="font-semibold text-white">1 player</span> rates it
        playable or better in CrossOver{framerate}.
      </p>
    );
  }

  return (
    <p className="text-sm text-gray-400">
      <span className="font-semibold text-white">
        {playableReportCount} of {reportCount} players
      </span>{' '}
      rate it playable or better in CrossOver{framerate}.
    </p>
  );
};
