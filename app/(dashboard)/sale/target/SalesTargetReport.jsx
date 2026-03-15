/* eslint-disable react/prop-types */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReportTable from "./ReportTable";
import { SpinnerCustom } from "@/components/shared/CustomLoader";

export default function SalesTargetReport({
  report,
  isLoading,
  isFetching,
  targetMonth,
  page,
  onPageChange,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Sales Target Report</span>
          <span className="text-sm text-muted-foreground">
            {targetMonth}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {(isLoading || isFetching) && (
          <p className="text-sm text-muted-foreground flex items-center gap-2"> <SpinnerCustom /> Loading…</p>
        )}

        {report?.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No data for this month.
          </p>
        )}

        {report?.data?.length > 0 && (
          <>
            <ReportTable data={report.data} />

            {report.last_page > 1 && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!report.prev_page_url}
                  onClick={() => onPageChange(page - 1)}
                >
                  Prev
                </Button>

                <span className="text-sm">
                  Page {report.current_page} / {report.last_page}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!report.next_page_url}
                  onClick={() => onPageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
