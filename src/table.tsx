import { useState } from "preact/hooks";

export function Table(props: {
  columns: string[];
  rows: (string | number)[][];
}) {
  const [showColumns, setShowColumns] = useState([0, 1, 2, 3]);
  const [sortColumn, setSortColumn] = useState<{
    columnId: number;
    ascending: boolean;
  } | null>(null);

  // Use to track the drag and drop columns
  const [dragCol, setDragCol] = useState<string | undefined>();
  const [dropCol, setDropCol] = useState<string | undefined>();

  function onDragStart(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    ev.dataTransfer!.dropEffect = "move";
    setDragCol(ev.target.dataset["colid"]);
  }

  function onDragEnter(ev: DragEvent) {
    // Only called on the headers
    if (!(ev.target instanceof HTMLElement)) return;

    ev.dataTransfer!.dropEffect = "move";
    const thisCol = ev.target.dataset["colid"];

    // If dragged to a different column, then highlight the column
    if (thisCol && thisCol !== dragCol) {
      setDropCol(thisCol);
      ev.preventDefault();
    }
  }

  function onDragOver(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    const thisCol = ev.target.dataset["colid"];

    // If this event handler isn't called and doesn't
    // call preventDefault, then the target cannot be dropped on.
    if (thisCol && thisCol !== dragCol) {
      ev.dataTransfer!.dropEffect = "move";
      ev.preventDefault();
    }
  }

  function onDragLeave(ev: DragEvent) {
    // Called if <Esc> key is pressed also
    if (!(ev.target instanceof HTMLElement)) return;
    const thisCol = ev.target.dataset["colid"];
    if (thisCol && thisCol === dropCol) {
      setDropCol(undefined);
      ev.preventDefault();
    }
  }

  function onDrop(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;

    const thisCol = ev.target.dataset["colid"];
    if (thisCol) {
      // Rearrange the columns
      if (thisCol !== dragCol) {
        moveColumn(parseInt(dragCol!), parseInt(thisCol));
      }
      ev.preventDefault();
    }
  }

  function onDragEnd(ev: DragEvent) {
    // Called regardless of how dragging ends
    // ev.target is the source element
    setDragCol(undefined);
    setDropCol(undefined);
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
    if (!(ev.target instanceof HTMLElement)) return;
    const thisCol = ev.target.dataset["colid"];

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
    console.log("row clicked", ev.currentTarget);
  }

  return (
    <table class="sortedTable">
      <thead>
        <tr>
          {showColumns.map((idx) => {
            const isDropTarget = dropCol && idx.toString() === dropCol;
            return (
              <th
                draggable
                class={isDropTarget ? "dragEnter" : undefined}
                onDragStart={onDragStart}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDragEnd={onDragEnd}
                onDrop={onDrop}
                onClick={onSort}
                data-colid={idx.toString()}
              >
                {props.columns[idx]}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {getSortedRows(props.rows).map((row) => (
          <tr onClick={rowClicked}>
            {showColumns.map((idx) => {
              const isDropTarget = dropCol && idx.toString() === dropCol;
              return (
                <td
                  class={isDropTarget ? "dragEnter" : undefined}
                  data-colid={idx.toString()}
                >
                  {row[idx]}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
