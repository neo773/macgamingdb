import { Card, CardContent } from '@/components/ui/card';
import ExpandableDescription from '@/modules/review/components/ExpandableDescription';

interface GameInfoCardProps {
  description: string;
}

export function GameInfoCard({ description }: GameInfoCardProps) {
  return (
    <div className="md:col-span-2">
      <h1 className="text-2xl text-white font-semibold">Game Information</h1>
      <Card className="shadow-lg mb-8 mt-4 bg-primary-gradient">
        <CardContent className="text-gray-300">
          <ExpandableDescription description={description || 'No description available.'} />
        </CardContent>
      </Card>
    </div>
  );
}
