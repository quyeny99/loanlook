"use client";

import * as React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

type LoanFiltersProps = {
  timeFilteredCounts: Record<string, number>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchLoans: () => void;
  loading: boolean;
};

export function LoanFilters({
  timeFilteredCounts,
  searchTerm,
  setSearchTerm,
  fetchLoans,
  loading,
}: LoanFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <TabsList>
        <TabsTrigger value="Today">Today ({timeFilteredCounts['Today']})</TabsTrigger>
        <TabsTrigger value="1D">1D ({timeFilteredCounts['1D']})</TabsTrigger>
        <TabsTrigger value="7D">7D ({timeFilteredCounts['7D']})</TabsTrigger>
        <TabsTrigger value="30D">30D ({timeFilteredCounts['30D']})</TabsTrigger>
        <TabsTrigger value="1M">1M ({timeFilteredCounts['1M']})</TabsTrigger>
        <TabsTrigger value="All Time">All Time ({timeFilteredCounts['All Time']})</TabsTrigger>
      </TabsList>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 w-full sm:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={fetchLoans} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
