'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsWrapperProps {
  children: (searchParams: ReturnType<typeof useSearchParams>) => React.ReactNode;
  fallback?: React.ReactNode;
}

function SearchParamsContent({ children }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}

export default function SearchParamsWrapper({ children, fallback }: SearchParamsWrapperProps) {
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
} 