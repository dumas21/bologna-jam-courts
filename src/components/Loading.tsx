
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
}

const Loading = ({ className }: LoadingProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <div className="w-16 h-16 border-8 border-t-jam-orange border-r-jam-purple border-b-jam-blue border-l-jam-pink animate-spin rounded-full" />
      <div className="mt-4 font-press-start text-xs text-white animate-pulse">
        Loading...
      </div>
    </div>
  );
};

export default Loading;
