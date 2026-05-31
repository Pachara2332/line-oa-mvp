import { Skeleton } from "@/components/ui/skeleton";

export default function LiffLoading() {
  return (
    <div className="mx-auto max-w-md p-4 animate-in fade-in duration-500 space-y-6">
      <Skeleton className="h-10 w-3/4 mb-8" />
      
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl mt-6" />
      </div>
    </div>
  );
}
