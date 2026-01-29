import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
    return (
        <>
            <div className="container mx-auto sm:px-10 px-5 py-8">
                {/* Title Skeleton */}
                <div className="h-9 w-64 bg-gray-200 rounded-md mb-6 animate-pulse" />

                {/* Filters Section Skeleton */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="h-7 w-24 bg-gray-200 rounded-md mb-4 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input Skeleton */}
                        <div>
                            <div className="h-5 w-24 bg-gray-200 rounded-md mb-1 animate-pulse" />
                            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                        </div>

                        {/* Sector Filter Skeleton */}
                        <div>
                            <div className="h-5 w-20 bg-gray-200 rounded-md mb-1 animate-pulse" />
                            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                        </div>

                        {/* Location Filter Skeleton */}
                        <div>
                            <div className="h-5 w-16 bg-gray-200 rounded-md mb-1 animate-pulse" />
                            <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Offers Grid Skeleton */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index} className="relative">
                            {/* Badge Skeleton */}
                            <div className="absolute top-4 right-4 h-6 w-24 bg-gray-200 rounded-full animate-pulse" />

                            <CardHeader>
                                {/* Title Skeleton */}
                                <div className="h-7 w-3/4 bg-gray-200 rounded-md mb-2 animate-pulse" />
                                {/* Description Skeleton */}
                                <div className="h-5 w-1/2 bg-gray-200 rounded-md animate-pulse" />
                            </CardHeader>

                            <CardContent>
                                {/* Description lines */}
                                <div className="space-y-2 mb-4">
                                    <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
                                </div>

                                {/* Details */}
                                <div className="mt-4 space-y-2">
                                    <div className="h-4 w-2/3 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-1/2 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded-md animate-pulse" />
                                    <div className="h-4 w-3/4 bg-gray-200 rounded-md animate-pulse" />
                                </div>
                            </CardContent>

                            <CardFooter>
                                {/* Button Skeleton */}
                                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
                            </CardFooter>
                        </Card>
                    ))}
                </main>

                {/* Pagination Skeleton */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    <div className="h-10 w-28 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse" />
                    <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse" />
                </div>
            </div>
        </>
    );
}
