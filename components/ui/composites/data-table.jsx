import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

const darkTheme = themeQuartz.withParams({
  backgroundColor: 'transparent',
  foregroundColor: 'var(--foreground)',
  borderColor: 'var(--border-bright)',
  headerBackgroundColor: 'transparent',
  headerForegroundColor: 'var(--foreground-muted)',
  rowHoverColor: 'rgba(255,255,255,0.04)',
  selectedRowBackgroundColor: 'rgba(255,255,255,0.06)',
  oddRowBackgroundColor: 'transparent',
  fontFamily: 'inherit',
  fontSize: 12,
  headerFontWeight: 600,
  cellHorizontalPadding: 12,
  rowBorder: { color: 'var(--border-bright)', width: 1 },
  columnBorder: false,
  wrapperBorder: false,
  headerColumnBorder: false,
  headerRowBorder: { color: 'var(--border-bright)', width: 1 },
})

const lightTheme = themeQuartz.withParams({
  backgroundColor: 'transparent',
  foregroundColor: 'var(--foreground)',
  borderColor: 'var(--border)',
  headerBackgroundColor: 'transparent',
  headerForegroundColor: 'var(--foreground-muted)',
  rowHoverColor: 'rgba(0,0,0,0.02)',
  selectedRowBackgroundColor: 'rgba(0,0,0,0.04)',
  oddRowBackgroundColor: 'transparent',
  fontFamily: 'inherit',
  fontSize: 12,
  headerFontWeight: 600,
  cellHorizontalPadding: 12,
  rowBorder: { color: 'var(--border)', width: 1 },
  columnBorder: false,
  wrapperBorder: false,
  headerColumnBorder: false,
  headerRowBorder: { color: 'var(--border)', width: 1 },
})

const defaultRowData = [
  { timestamp: '2026-03-11 09:42:18.331', level: 'ERROR', service: 'pet-clinic-api', requestId: 'a3f8c1d2-7e4b', message: 'Connection pool exhausted — retrying in 500ms', duration: '1204ms' },
  { timestamp: '2026-03-11 09:42:17.892', level: 'WARN', service: 'payment-gateway', requestId: 'b7e2a9f0-3c1d', message: 'Slow upstream response from /api/v2/charges', duration: '892ms' },
  { timestamp: '2026-03-11 09:42:17.104', level: 'INFO', service: 'pet-clinic-frontend', requestId: 'c1d4e8a2-9f3b', message: 'GET /appointments 200 OK', duration: '45ms' },
  { timestamp: '2026-03-11 09:42:16.770', level: 'INFO', service: 'auth-service', requestId: 'd9a3f7c1-2e8b', message: 'Token refresh completed for user session', duration: '38ms' },
  { timestamp: '2026-03-11 09:42:15.998', level: 'ERROR', service: 'pet-clinic-db', requestId: 'e2b8d4f0-1a7c', message: 'Query timeout exceeded 5000ms on SELECT owners', duration: '5001ms' },
  { timestamp: '2026-03-11 09:42:15.443', level: 'INFO', service: 'notification-svc', requestId: 'f0c7a1e3-8d2b', message: 'Email dispatched to queue — appointment reminder', duration: '62ms' },
  { timestamp: '2026-03-11 09:42:14.887', level: 'WARN', service: 'search-indexer', requestId: 'a8d2f4c0-3b1e', message: 'Index rebuild lagging behind by 1,247 documents', duration: '340ms' },
  { timestamp: '2026-03-11 09:42:14.210', level: 'INFO', service: 'cdn-edge', requestId: 'b1e9c3a7-4f2d', message: 'Cache HIT /static/bundle.js — served from edge', duration: '4ms' },
  { timestamp: '2026-03-11 09:42:13.556', level: 'INFO', service: 'pet-clinic-api', requestId: 'c4f2a8d1-7e3b', message: 'POST /pets 201 Created', duration: '78ms' },
  { timestamp: '2026-03-11 09:42:12.901', level: 'ERROR', service: 'payment-gateway', requestId: 'd7a1c3e9-2f8b', message: 'Stripe webhook signature verification failed', duration: '12ms' },
]

const defaultColDefs = [
  { field: 'timestamp', headerName: 'Timestamp', flex: 1.5, minWidth: 180 },
  { field: 'level', headerName: 'Level', flex: 0.6, minWidth: 75 },
  { field: 'service', headerName: 'Service', flex: 1.2, minWidth: 140 },
  { field: 'requestId', headerName: 'Request ID', flex: 1, minWidth: 130 },
  { field: 'message', headerName: 'Message', flex: 3, minWidth: 280 },
  { field: 'duration', headerName: 'Duration', flex: 0.6, minWidth: 80, type: 'rightAligned' },
]

export default function AgGridTable({ isDark = true, rowData, columnDefs, onRowClicked }) {
  const theme = isDark ? darkTheme : lightTheme
  const rows = rowData || defaultRowData
  const cols = useMemo(() => columnDefs || defaultColDefs, [columnDefs])

  return (
    <div style={{ height: 360, width: '100%' }}>
      <AgGridReact
        theme={theme}
        rowData={rows}
        columnDefs={cols}
        headerHeight={40}
        rowHeight={40}
        suppressCellFocus
        animateRows={false}
        defaultColDef={{ sortable: true, resizable: true }}
        onRowClicked={onRowClicked}
      />
    </div>
  )
}
