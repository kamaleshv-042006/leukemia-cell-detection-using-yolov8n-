import { useMemo, useState, useId } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Inbox, Search } from 'lucide-react';
import { cn } from '../lib/utils.js';
import { downloadCSV } from '../lib/exporters.js';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';

/**
 * Sortable, searchable, exportable data table.
 *
 * columns: [{ key, header, align?, width?, sortable?, render?(row), sortValue?(row) }]
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (r) => r.id,
  initialSort = null,
  searchable = false,
  searchPlaceholder = 'Search records…',
  searchKeys = null,
  filters = null,
  toolbar = null,
  onRowClick = null,
  emptyTitle = 'No records found',
  emptyDescription = 'Adjust your filters or search query to see results.',
  exportFilename = 'table-export.csv',
  dense = false,
  maxHeight = null,
  className,
  zebra = true,
}) {
  const [sort, setSort] = useState(initialSort);
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries((filters ?? []).map((f) => [f.key, 'all'])),
  );
  const searchId = useId();

  const filtered = useMemo(() => {
    let out = rows ?? [];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      const keys =
        searchKeys ?? columns.map((c) => c.key);
      out = out.filter((row) =>
        keys.some((k) => {
          const v = row[k];
          if (v === null || v === undefined) return false;
          if (typeof v === 'object') return JSON.stringify(v).toLowerCase().includes(q);
          return String(v).toLowerCase().includes(q);
        }),
      );
    }

    (filters ?? []).forEach((f) => {
      const selected = filterValues[f.key];
      if (!selected || selected === 'all') return;
      out = out.filter((row) => {
        const raw = row[f.key];
        return (Array.isArray(f.options) ? f.options : []).includes(raw);
      });
    });

    return out;
  }, [rows, query, searchKeys, columns, filters, filterValues]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    const getValue = col.sortValue ?? ((row) => row[col.key]);
    return [...filtered].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va ?? '').localeCompare(String(vb ?? ''), undefined, { numeric: true }) * dir;
    });
  }, [filtered, sort, columns]);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'desc' };
      if (prev.dir === 'desc') return { key, dir: 'asc' };
      return null;
    });
  };

  const exportableColumns = columns
    .filter((c) => c.key !== '_actions')
    .map((c) => ({ key: c.key, label: c.header }));

  const header = searchable || filters?.length || toolbar ? (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-line-soft px-2.5 py-2">
      {searchable && (
        <div className="relative min-w-[170px] flex-1">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-7 w-full rounded-sm border border-line bg-base-850 pl-7 pr-2 text-[12px] text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-accent"
          />
        </div>
      )}
      {(filters ?? []).map((f) => (
        <div key={f.key} className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase leading-none tracking-[0.07em] text-ink-faint">{f.label}</span>
          <select
            value={filterValues[f.key]}
            onChange={(e) => setFilterValues((p) => ({ ...p, [f.key]: e.target.value }))}
            className="h-7 rounded-sm border border-line bg-base-850 px-1.5 text-[12px] text-ink-soft outline-none transition-colors focus:border-accent"
          >
            <option value="all">All</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5">
        {toolbar}
        <span className="tnum text-[10.5px] text-ink-muted">
          {sorted.length} / {rows?.length ?? 0}
        </span>
        <Button
          variant="subtle"
          size="xs"
          icon={Download}
          onClick={() => downloadCSV(sorted, exportableColumns, exportFilename)}
          disabled={!sorted.length}
        >
          Export CSV
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded border border-line bg-base-800', className)}>
      {header}

      <div
        className={cn('min-w-0 overflow-auto scroll-thin', maxHeight && 'overflow-y-auto')}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="w-full min-w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-base-750">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.key === col.key;
                const sortable = col.sortable !== false;
                const Icon = isSorted ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={cn(
                      'whitespace-nowrap border-b border-line px-2.5 py-1.5 text-[10px] font-semibold uppercase leading-none tracking-[0.07em] text-ink-muted',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          'inline-flex items-center gap-1 transition-colors hover:text-ink',
                          isSorted && 'text-ink',
                          col.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        {col.header}
                        <Icon
                          className={cn('h-3 w-3 shrink-0', !isSorted && 'opacity-35')}
                          strokeWidth={2.2}
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-3">
                  <EmptyState
                    icon={Inbox}
                    title={emptyTitle}
                    description={emptyDescription}
                    compact
                  />
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-line-soft transition-colors last:border-b-0',
                    zebra && i % 2 === 1 && 'bg-base-850/60',
                    onRowClick && 'cursor-pointer hover:bg-accent-soft',
                  )}
                >
                  {columns.map((col) => {
                    const content = col.render ? col.render(row, i) : row[col.key];
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'px-2.5 align-middle',
                          dense ? 'py-1' : 'py-1.5',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center',
                          'text-[11.5px] leading-snug text-ink-soft',
                          col.numeric && 'tnum text-ink',
                        )}
                      >
                        {content === null || content === undefined ? (
                          <span className="text-ink-faint">—</span>
                        ) : (
                          content
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Small helper for badge cells. */
export function BadgeCell({ tone, children }) {
  return (
    <StatusBadge tone={tone} size="sm">
      {children}
    </StatusBadge>
  );
}
