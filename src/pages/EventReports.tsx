import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { reportService } from '../services/reportService';
import { attendanceService } from '../services/attendanceService';
import { useFetch } from '../hooks/useFetch';
import { useToast } from '../hooks/useToast';
import { formatEventDate } from '../utils/dateUtils';
import { Badge, getStatusBadgeProps } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { LoadingState, ErrorState } from '../components/StateFeedback';

export function EventReports() {
  const { showToast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState('evt-usc-eng-week');
  const [exporting, setExporting] = useState(false);

  const {
    data: reports,
    loading,
    error,
    refetch,
  } = useFetch(() => reportService.getEventReports(), []);

  const { data: attendees } = useFetch(
    () => attendanceService.getEventAttendance(selectedEventId),
    [selectedEventId]
  );

  const reportList = reports || [];
  const selectedReport =
    reportList.find((r) => r.eventId === selectedEventId) || reportList[0];

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!selectedReport) return;
    setExporting(true);
    try {
      const res = await reportService.exportEventReport(selectedReport.eventId, format);
      // Trigger client-side download for CSV so user gets a real file
      if (format === 'csv') {
        const blob = new Blob([res.content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      showToast(
        `Exported ${format.toUpperCase()} Report`,
        'success',
        `Generated ${res.filename} (${res.rowCount} attendee records).`
      );
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Compiling USC event attendance reports..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-usc-green-dark">
            OSA & Organization Compliance Reports
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
            Event Attendance & Capacity Reports
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled={exporting}
            onClick={() => handleExport('csv')}
          >
            <Download className="w-4 h-4 text-usc-green" />
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={exporting}
            onClick={() => handleExport('pdf')}
          >
            <FileText className="w-4 h-4" />
            Export PDF Summary
          </Button>
        </div>
      </div>

      {/* All Events Summary Table */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-text-primary font-serif">
          Per-Event Registered vs. Attended Summary
        </h2>
        <Table
          rowKey={(r) => r.eventId}
          data={reportList}
          columns={[
            {
              key: 'eventTitle',
              header: 'Event Title & Organizer',
              render: (r) => (
                <div>
                  <p className="font-semibold text-text-primary">{r.eventTitle}</p>
                  <p className="text-xs text-text-muted">
                    {r.organizer} · {formatEventDate(r.date)}
                  </p>
                </div>
              ),
            },
            {
              key: 'registered',
              header: 'Registered',
              align: 'right',
              render: (r) => (
                <span className="font-mono text-xs">
                  {r.registeredCount} / {r.capacity}
                </span>
              ),
            },
            {
              key: 'attended',
              header: 'Attended',
              align: 'right',
              render: (r) => (
                <span className="font-mono text-xs font-semibold text-usc-green-dark">
                  {r.attendedCount}
                </span>
              ),
            },
            {
              key: 'rate',
              header: 'Attendance Rate',
              align: 'right',
              render: (r) => (
                <span className="font-mono text-xs font-bold text-usc-blue">
                  {r.attendanceRate}%
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (r) => {
                const st = getStatusBadgeProps(r.status);
                return <Badge variant={st.variant}>{st.label}</Badge>;
              },
            },
          ]}
        />
      </div>

      {/* Per-Event Detailed Attendee Breakdown */}
      {selectedReport && (
        <Card padding="lg">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-surface-border">
            <div className="w-full sm:w-96">
              <Select
                label="Inspect Detailed Event Roster"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                options={reportList.map((r) => ({
                  value: r.eventId,
                  label: r.eventTitle,
                }))}
              />
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <p className="text-text-muted">Registered</p>
                <p className="text-lg font-bold font-mono tabular-nums text-text-primary">
                  {selectedReport.registeredCount}/{selectedReport.capacity}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Checked In</p>
                <p className="text-lg font-bold font-mono tabular-nums text-usc-green-dark">
                  {selectedReport.attendedCount}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Turnout Rate</p>
                <p className="text-lg font-bold font-mono tabular-nums text-usc-blue">
                  {selectedReport.attendanceRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Table
              rowKey={(a) => a.id}
              data={attendees || []}
              emptyMessage="No attendee records logged for this event yet."
              columns={[
                {
                  key: 'ticketCode',
                  header: 'Pass Code',
                  render: (a) => <span className="font-mono text-xs font-semibold">{a.ticketCode}</span>,
                },
                {
                  key: 'studentId',
                  header: 'USC ID',
                  render: (a) => <span className="font-mono text-xs">{a.studentId}</span>,
                },
                {
                  key: 'userName',
                  header: 'Student Name',
                  render: (a) => <span className="font-semibold text-text-primary">{a.userName}</span>,
                },
                {
                  key: 'course',
                  header: 'Program',
                  render: (a) => <span className="text-xs text-text-secondary">{a.course}</span>,
                },
                {
                  key: 'checkedIn',
                  header: 'Verification',
                  render: (a) =>
                    a.checkedIn ? (
                      <Badge variant="open">Verified Present</Badge>
                    ) : (
                      <Badge variant="neutral">Registered Only</Badge>
                    ),
                },
              ]}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
