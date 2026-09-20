import { Card, CardContent } from 'macgamingdb-ui/display/Card';
import { ExpandableDescription } from '@/modules/review/components/ExpandableDescription';
import { demoteDescriptionHeadings } from '@/modules/game/utils/demoteDescriptionHeadings';

interface GameInfoCardProps {
  description: string;
}

export const GameInfoCard = ({ description }: GameInfoCardProps) => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl text-white font-semibold">Game Information</h2>
      <Card className="shadow-lg mb-8 mt-4 bg-primary-gradient">
        <CardContent className="text-gray-300">
          <div data-nosnippet>
            <ExpandableDescription
              description={
                description
                  ? demoteDescriptionHeadings(description)
                  : 'No description available.'
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
