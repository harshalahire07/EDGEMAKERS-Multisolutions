"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Filter, X, Download, Trash2, RefreshCw } from "lucide-react";
import { db } from "@/lib/database";
import { useActivityLogs } from "@/lib/database-hooks";
import { ActivityLog, ActivityAction, EntityType } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface ActivityLogFilters {
  searchTerm: string;
  actionType: string;
  entityType: string;
  dateFrom: string;
  dateTo: string;
  sortOrder: "asc" | "desc";
}

export default function ActivityLogComponent() {
  const { activityLogs, loading } = useActivityLogs();
  const { toast } = useToast();

  const [filters, setFilters] = useState<ActivityLogFilters>({
    searchTerm: "",
    actionType: "all",
    entityType: "all",
    dateFrom: "",
    dateTo: "",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Update filters helper
  const updateFilters = (updates: Partial<ActivityLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      actionType: "all",
      entityType: "all",
      dateFrom: "",
      dateTo: "",
      sortOrder: "desc",
    });
  };

  // Clear all logs
  const handleClearLogs = () => {
    if (
      confirm(
        "Are you sure you want to clear all activity logs? This action cannot be undone."
      )
    ) {
      db.cleanupOldActivityLogs(0);
      toast({
        title: "Logs Cleared",
        description: "All activity logs have been removed.",
      });
    }
  };

  // Export logs
  const handleExportLogs = () => {
    try {
      const filename = `activity-logs-${
        new Date().toISOString().split("T")[0]
      }.json`;
      db.downloadDataAsJSON(filename, filteredLogs);
      toast({
        title: "Logs Exported",
        description: `Successfully exported ${filteredLogs.length} log entries.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export activity logs.",
        variant: "destructive",
      });
    }
  };

  // Manual cleanup (30 days)
  const handleRefreshLogs = () => {
    const removed = db.cleanupOldActivityLogs(30);
    toast({
      title: "Logs Cleaned Up",
      description: `Removed ${removed} old log entries (older than 30 days).`,
    });
  };

  // Badge variant for action types
  const getActionBadgeVariant = (
    action: ActivityAction
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (action) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      case "activate":
      case "deactivate":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Entity type label
  const getEntityTypeLabel = (entityType: EntityType): string => {
    const labels: Record<EntityType, string> = {
      service: "Service",
      team: "Team Member",
      testimonial: "Testimonial",
      job: "Job",
      user: "User",
      contact: "Contact",
      newsletter: "Newsletter",
      application: "Application",
      backup: "Backup",
    };
    return labels[entityType] || entityType;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Relative time
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return formatTimestamp(timestamp);
  };

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    let logs = [...activityLogs];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.entityName.toLowerCase().includes(searchLower) ||
          log.user.toLowerCase().includes(searchLower)
      );
    }

    // Action type filter
    if (filters.actionType !== "all") {
      logs = logs.filter((log) => log.action === filters.actionType);
    }

    // Entity type filter
    if (filters.entityType !== "all") {
      logs = logs.filter((log) => log.entityType === filters.entityType);
    }

    // Date from filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      logs = logs.filter((log) => new Date(log.timestamp) >= fromDate);
    }

    // Date to filter
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      logs = logs.filter((log) => new Date(log.timestamp) <= toDate);
    }

    // Sort by timestamp
    logs.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return filters.sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return logs;
  }, [activityLogs, filters]);

  // Active filter count
  const activeFilterCount = [
    filters.searchTerm,
    filters.actionType !== "all",
    filters.entityType !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  // Stats
  const totalLogs = activityLogs.length;
  const logsLast24Hours = activityLogs.filter((log) => {
    const diffMs = new Date().getTime() - new Date(log.timestamp).getTime();
    return diffMs < 24 * 60 * 60 * 1000;
  }).length;
  const logsLast7Days = activityLogs.filter((log) => {
    const diffMs = new Date().getTime() - new Date(log.timestamp).getTime();
    return diffMs < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Most active user
  const userCounts = activityLogs.reduce((acc, log) => {
    acc[log.user] = (acc[log.user] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostActiveUser =
    Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Most common action
  const actionCounts = activityLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonAction =
    Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>
                Track all admin actions and changes to website content
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefreshLogs}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Cleanup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                disabled={filteredLogs.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearLogs}
                disabled={activityLogs.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Filter Panel */}
        {showFilters && (
          <CardContent className="border-t">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search by entity name or user..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    updateFilters({ searchTerm: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action">Action Type</Label>
                <Select
                  value={filters.actionType}
                  onValueChange={(value) =>
                    updateFilters({ actionType: value })
                  }
                >
                  <SelectTrigger id="action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="deactivate">Deactivate</SelectItem>
                    <SelectItem value="restore">Restore</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="import">Import</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Entity Type</Label>
                <Select
                  value={filters.entityType}
                  onValueChange={(value) =>
                    updateFilters({ entityType: value })
                  }
                >
                  <SelectTrigger id="entity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="testimonial">Testimonial</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="application">Application</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilters({ dateTo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Sort Order</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: "asc" | "desc") =>
                    updateFilters({ sortOrder: value })
                  }
                >
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Logs</CardDescription>
            <CardTitle className="text-3xl">{totalLogs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last 24 Hours</CardDescription>
            <CardTitle className="text-3xl">{logsLast24Hours}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Last 7 Days</CardDescription>
            <CardTitle className="text-3xl">{logsLast7Days}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Most Active User</CardDescription>
            <CardTitle className="text-lg truncate">{mostActiveUser}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Most Common Action</CardDescription>
            <CardTitle className="text-lg capitalize">
              {mostCommonAction}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Activity Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activity History
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "entry" : "entries"})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {activityLogs.length === 0 ? (
                <>
                  <History className="mx-auto h-12 w-12 opacity-20 mb-4" />
                  <p>No activity logs yet.</p>
                  <p className="text-sm">Admin actions will be tracked here.</p>
                </>
              ) : (
                <>
                  <Filter className="mx-auto h-12 w-12 opacity-20 mb-4" />
                  <p>No logs match your filters.</p>
                  <p className="text-sm">Try adjusting your search criteria.</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {formatTimestamp(log.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getRelativeTime(log.timestamp)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEntityTypeLabel(log.entityType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.entityName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.user}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
