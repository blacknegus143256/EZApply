import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ columns = 5, showAvatar = false }: { columns?: number; showAvatar?: boolean }) {
  return (
    <tr className="border-b">
      {showAvatar && (
        <td className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </td>
      )}
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for table with multiple rows
 */
export function TableSkeleton({ rows = 5, columns = 5, showAvatar = false }: { rows?: number; columns?: number; showAvatar?: boolean }) {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <div className="border-b bg-muted/50 p-4">
          <div className="flex gap-4">
            {Array.from({ length: columns + (showAvatar ? 1 : 0) }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>
        <div className="divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex gap-4">
                {showAvatar && (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                )}
                {Array.from({ length: columns }).map((_, j) => (
                  <Skeleton key={j} className="h-4 flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for application/company cards
 */
export function ApplicationCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 p-4 mb-4 rounded-lg shadow border border-gray-100 dark:border-neutral-700">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2 border-t pt-3 mt-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-10 w-full rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton for company card (used in listings)
 */
export function CompanyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded" />
        <Skeleton className="h-10 w-24 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton for stat cards (dashboard)
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow p-6 border border-gray-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * Skeleton for chat message
 */
export function ChatMessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={cn("flex items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full" />}
      <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
        <Skeleton className={cn("h-12 rounded-2xl", isOwn ? "w-48" : "w-56")} />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
      {isOwn && <Skeleton className="h-8 w-8 rounded-full" />}
    </div>
  );
}

/**
 * Skeleton for chat list item
 */
export function ChatListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/**
 * Skeleton for form fields
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

/**
 * Skeleton for profile sections
 */
export function ProfileSectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton />
      </div>
    </div>
  );
}

/**
 * Generic loading container with skeleton
 */
export function LoadingSkeleton({ 
  type = "table", 
  rows = 5, 
  columns = 5,
  className 
}: { 
  type?: "table" | "cards" | "list" | "form";
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {type === "table" && <TableSkeleton rows={rows} columns={columns} />}
      {type === "cards" && (
        <div className="grid gap-4">
          {Array.from({ length: rows }).map((_, i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      )}
      {type === "list" && (
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <ChatListItemSkeleton key={i} />
          ))}
        </div>
      )}
      {type === "form" && (
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <FormFieldSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

