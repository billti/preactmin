import { useRef, useState } from "preact/hooks";

const log = console.log.bind(console);

// Note: column 0 is expected to be unique amongst all rows
export function Table(props: {
  columnNames: string[];
  rows: (string | number)[][];
}) {
  const [showColumns, setShowColumns] = useState([0, 1, 2, 3]);
  const [sortColumn, setSortColumn] = useState<{
    columnId: number;
    ascending: boolean;
  } | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  // Use to track the column being dragged
  const draggingCol = useRef("");

  /*
  Note: Drag and drop events can occur faster than preact reconciles state.
  This causes challenges where one event will set state, and the next event
  that needs to use the latest state will still see old state.

  So don't apply state changes in the drag and drop handlers. Instead, set
  styles directly, and just update state if the 'drop' event changes column
  order.
  */

  function onDragStart(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    const colid = ev.target.closest("th")?.dataset["colid"];
    draggingCol.current = colid!;
    ev.dataTransfer!.dropEffect = "move";
  }

  function onDragEnter(ev: DragEvent) {
    // Get the column id of the column being entered
    if (!(ev.target instanceof HTMLElement)) return;
    const thisColId = ev.target.closest("th")?.dataset["colid"];
    if (!thisColId || !draggingCol.current) return;

    // If this column is different to the column being dragged, add the CSS class
    if (draggingCol.current !== thisColId) {
      ev.preventDefault();
      ev.dataTransfer!.dropEffect = "move";
      ev.target
        .closest("table")!
        .querySelectorAll(`[data-colid="${thisColId}"]`)
        .forEach((elem) => elem.classList.add("dragEnter"));
    }
  }

  function onDragOver(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    const thisColId = ev.target.closest("th")?.dataset["colid"];
    if (!thisColId || !draggingCol.current) return;

    // If dragging something over a different column, allow the drop
    if (draggingCol.current !== thisColId) {
      ev.dataTransfer!.dropEffect = "move";
      ev.preventDefault();
    }
  }

  function onDragLeave(ev: DragEvent) {
    // Remove the CSS class from the column being left
    if (!(ev.target instanceof HTMLElement)) return;
    const thisColId = ev.target.closest("th")?.dataset["colid"];
    if (!thisColId) return;

    ev.target
      .closest("table")!
      .querySelectorAll(`[data-colid="${thisColId}"]`)
      .forEach((elem) => elem.classList.remove("dragEnter"));
    ev.preventDefault();
  }

  function onDrop(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    const thisColId = ev.target.closest("th")?.dataset["colid"];
    if (!thisColId) return;

    if (draggingCol.current) {
      moveColumn(parseInt(draggingCol.current), parseInt(thisColId));
      ev.preventDefault();
    }
  }

  function onDragEnd(ev: DragEvent) {
    // Called regardless of how dragging ends
    // ev.target is the source element
    // Just remove any dragEnter classes from cells that may remain
    (ev.target as HTMLElement)
      .closest("table")!
      .querySelectorAll(`th, td`)
      .forEach((elem) => elem.classList.remove("dragEnter"));
    draggingCol.current = "";
  }

  function moveColumn(oldIdx: number, newIdx: number) {
    // Locate the indexes in the array where the column idx is
    const arrIdxOld = showColumns.indexOf(oldIdx);
    const arrIdxNew = showColumns.indexOf(newIdx);

    const newColumns = [...showColumns];
    const removed = newColumns.splice(arrIdxOld, 1);
    newColumns.splice(arrIdxNew, 0, ...removed);
    setShowColumns(newColumns);
  }

  function onSort(ev: MouseEvent) {
    if (!(ev.currentTarget instanceof HTMLTableCellElement)) return;
    const thisCol = ev.currentTarget.dataset["colid"];

    if (sortColumn && thisCol === sortColumn.columnId.toString()) {
      // Toggle the sort order
      setSortColumn({
        columnId: sortColumn.columnId,
        ascending: !sortColumn.ascending,
      });
    } else {
      // Set the sort column
      setSortColumn({
        columnId: parseInt(thisCol!),
        ascending: true,
      });
    }
  }

  function getSortedRows(rows: (string | number)[][]) {
    if (!sortColumn) return rows;

    const colIdx = sortColumn.columnId;
    const ascending = sortColumn.ascending;

    const sortedRows = [...rows];
    sortedRows.sort((a, b) => {
      const aVal = a[colIdx];
      const bVal = b[colIdx];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return ascending ? aVal - bVal : bVal - aVal;
      } else {
        return 0;
      }
    });

    return sortedRows;
  }

  function rowClicked(ev: MouseEvent) {
    // Current target is the element with the handler (in this case the tr)
    const rowId = (ev.currentTarget as HTMLTableRowElement).dataset["rowid"]!;
    if (selectedRow === rowId) {
      setSelectedRow(null);
    } else {
      setSelectedRow(rowId!);
    }
  }

  return (
    <table class="sortedTable">
      <thead>
        <tr>
          {showColumns.map((idx) => {
            const isSortColumn = sortColumn?.columnId === idx;
            return (
              <th onClick={onSort} data-colid={idx.toString()}>
                <span
                  class={isSortColumn ? "sortHeaderCell" : "headerCell"}
                  draggable
                  onDragStart={onDragStart}
                  onDragEnter={onDragEnter}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDragEnd={onDragEnd}
                  onDrop={onDrop}
                >
                  {props.columnNames[idx]}
                </span>
                {isSortColumn ? (
                  <svg
                    width="16"
                    height="16"
                    style={`transform: rotate(${
                      sortColumn!.ascending ? "0" : "180"
                    }deg)`}
                  >
                    <polygon points="2,10 8,4 14,10" />
                  </svg>
                ) : null}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {getSortedRows(props.rows).map((row) => (
          <tr
            onClick={rowClicked}
            data-rowid={row[0].toString()}
            class={
              row[0].toString() === selectedRow
                ? "sortedTableSelectedRow"
                : undefined
            }
          >
            {showColumns.map((idx) => {
              return <td data-colid={idx.toString()}>{row[idx]}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
