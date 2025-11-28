"use client";

import { useState } from "react";
import { ProfilesTable } from "@/components/profiles-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfilePageClient() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [resetToPage1, setResetToPage1] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshToken((v) => v + 1);
    toast({
      title: "Refreshed",
      description: "Profiles list has been refreshed.",
    });
  };

  const handleResetPage1Complete = () => {
    setResetToPage1(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Profiles Management
              </CardTitle>
              <CardDescription>
                Manage user profiles and their roles.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={tableLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${tableLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProfilesTable
            refreshToken={refreshToken}
            onLoadingChange={setTableLoading}
            resetToPage1={resetToPage1}
            onResetPage1Complete={handleResetPage1Complete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
