import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <Card className="bg-white border border-gray-200 h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image Skeleton */}
        <div className="relative aspect-square bg-gray-100">
          <Skeleton className="w-full h-full rounded-none" />
        </div>

        {/* Content Skeleton */}
        <div className="p-4 flex flex-col flex-1 space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
