import { cn } from '../../utilities/cn/cn';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-800/50', className)}
      {...props}
    />
  );
}

export { Skeleton };
