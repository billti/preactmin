/* TODO
- Menu to fire recalculation
- Simplify the drag and drop code
*/

import { useRef, useState } from "preact/hooks";

// Note: column 0 is expected to be unique amongst all rows
export function Table(props: {
  columnNames: string[];
  rows: (string | number)[][];
  initialColumns: number[];
  onRowSelected(rowId: string): void;
  onRowDeleted(rowId: string): void;
}) {
  const [showColumns, setShowColumns] = useState(props.initialColumns);
  const [sortColumn, setSortColumn] = useState<{
    columnId: number;
    ascending: boolean;
  } | null>(null);
  const [selectedRow, setSelectedRow] = useState<string>("");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showRowMenu, setShowRowMenu] = useState("");

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

  function rowClicked(rowId: string) {
    const newSelectedRow = selectedRow === rowId ? "" : rowId;
    setSelectedRow(newSelectedRow);
    props.onRowSelected(newSelectedRow);
  }

  function onClickRowMenu(ev: MouseEvent, rowid: string) {
    ev.stopPropagation();
    if (showRowMenu === rowid) {
      setShowRowMenu("");
    } else {
      setShowRowMenu(rowid!);
    }
  }

  function onClickColumnMenu(ev: MouseEvent) {
    setShowRowMenu("");
    setShowColumnMenu(!showColumnMenu);
  }

  function getColumnList() {
    return props.columnNames.map((name, idx) => ({
      name,
      idx,
      show: showColumns.includes(idx),
    }));
  }

  function toggleColumn(idx: number) {
    const newColumns = [...showColumns];
    const arrIdx = newColumns.indexOf(idx);
    if (arrIdx === -1) {
      // Not currently showing, need to add it
      if (idx > newColumns.length) {
        // The column position is greater than the number of columns currently showing
        // So just add to the end
        newColumns.push(idx);
      } else {
        // Insert at the correct position
        newColumns.splice(idx, 0, idx);
      }
    } else {
      newColumns.splice(arrIdx, 1);
    }
    setShowColumns(newColumns);
  }

  function deleteRow(e: MouseEvent, rowId: string) {
    e.stopPropagation();
    // Clear out any menus or selections for the row if needed
    console.log("Deleting row " + rowId);
    setShowRowMenu("");
    if (selectedRow === rowId) {
      setSelectedRow("");
      props.onRowSelected("");
    }
    props.onRowDeleted(rowId);
  }

  return (
    <table class="sortedTable">
      <thead>
        <tr>
          <th>
            <div style="position: relative">
              <svg
                width="16"
                height="16"
                style="position: relative;"
                onClick={onClickColumnMenu}
              >
                <rect x="1" y="3.5" width="14" height="2" fill="black" />
                <rect
                  x="1"
                  y="3"
                  width="14"
                  height="12"
                  stroke="gray"
                  stroke-width="1"
                  fill="none"
                  rx="2"
                />
                <path
                  stroke="gray"
                  stroke-width="1"
                  d="M4.5,3 V15 M8,3 V15 M11.5,3 V15"
                />
              </svg>
              <div
                class={
                  showColumnMenu ? "columnMenu showColumnMenu" : "columnMenu"
                }
                style="position: absolute; top: 16; left: 0;"
              >
                {getColumnList().map((elem) => (
                  <div
                    width="100px"
                    height="20px"
                    class={elem.show ? "columnSelected" : "menuItem"}
                    onClick={() => toggleColumn(elem.idx)}
                  >
                    {elem.name}
                  </div>
                ))}
              </div>
            </div>
          </th>
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
        {getSortedRows(props.rows).map((row) => {
          const rowId = row[0].toString();
          return (
            <tr
              onClick={() => rowClicked(rowId)}
              data-rowid={rowId}
              class={
                rowId === selectedRow ? "sortedTableSelectedRow" : undefined
              }
            >
              <td>
                <div
                  style="position: relative"
                  onClick={(e) => onClickRowMenu(e, rowId)}
                >
                  <svg width="16" height="16" style="position: relative;">
                    <path
                      stroke-width="1.5"
                      stroke="gray"
                      stroke-linecap="round"
                      d="M4,5 h8 M4,8 h8 M4,11 h8"
                    />
                  </svg>
                  {showRowMenu === rowId ? (
                    <div class="showColumnMenu" style="top: 16px; left: 0px;">
                      <div class="menuItem">Recalculate</div>
                      <div
                        class="menuItem"
                        onClick={(e) => deleteRow(e, rowId)}
                      >
                        Delete
                      </div>
                    </div>
                  ) : null}
                </div>
              </td>
              {showColumns.map((idx) => {
                return <td data-colid={idx.toString()}>{row[idx]}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
