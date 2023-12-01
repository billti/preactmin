import { useState } from "preact/hooks";

export function Table(props: {
  columns: string[];
  rows: (string | number)[][];
}) {
  const [showColumns, setShowColumns] = useState([0, 1, 2, 3]);
  const [dragging, setDragging] = useState<string | undefined>();

  function onDragStart(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    ev.dataTransfer!.dropEffect = "move";
    setDragging(ev.target.dataset["colid"]);
  }

  function onDragEnter(ev: DragEvent) {
    // Only called on the headers
    if (!(ev.target instanceof HTMLElement)) return;

    ev.dataTransfer!.dropEffect = "move";
    const thisCol = ev.target.dataset["colid"];

    // If dragged to a different column, then highlight the column
    if (thisCol && thisCol !== dragging) {
      const table = ev.target.closest("table");
      const columns = table!.querySelectorAll(`[data-colid="${thisCol}"]`);
      columns.forEach((col) => col.classList.add("dragEnter"));
      ev.preventDefault();
    }
  }

  function onDragOver(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;

    // If this event handler isn't called and doesn't
    // call preventDefault, then the target cannot be dropped on.
    if (ev.target.dataset["colid"] !== dragging) ev.preventDefault();
    ev.dataTransfer!.dropEffect = "move";
  }

  function onDragLeave(ev: DragEvent) {
    // Called if <Esc> key is pressed also
    if (!(ev.target instanceof HTMLElement)) return;

    // If this is a column, then remove the highlight
    const thisCol = ev.target.dataset["colid"];
    if (thisCol) {
      const table = ev.target.closest("table");
      const columns = table!.querySelectorAll(`[data-colid="${thisCol}"]`);
      columns.forEach((col) => col.classList.remove("dragEnter"));
      ev.preventDefault();
    }
  }

  function onDrop(ev: DragEvent) {
    if (!(ev.target instanceof HTMLElement)) return;
    ev.preventDefault();

    const thisCol = ev.target.dataset["colid"];
    if (thisCol) {
      // Remove the highlight
      const table = ev.target.closest("table");
      const columns = table!.querySelectorAll(`[data-colid="${thisCol}"]`);
      columns.forEach((col) => col.classList.remove("dragEnter"));
      ev.preventDefault();

      // Rearrange the columns
      if (thisCol !== dragging) {
        const oldIdx = showColumns.indexOf(parseInt(dragging!));
        const newIdx = showColumns.indexOf(parseInt(thisCol));
        const newColumns = [...showColumns];
        newColumns.splice(oldIdx, 1);
        newColumns.splice(newIdx, 0, parseInt(dragging!));
        setShowColumns(newColumns);
      }
    }
  }

  function onDragEnd(ev: DragEvent) {
    // Called regardless of how dragging ends
    // ev.target is the source element
  }

  function onSort(ev: MouseEvent) {
    console.log(
      "Clicked on header with ",
      (ev.target as HTMLElement).innerText
    );
  }

  return (
    <table>
      <thead>
        <tr>
          {showColumns.map((idx) => (
            <th
              draggable
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
          ))}
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row) => (
          <tr>
            {showColumns.map((idx) => (
              <td data-colid={idx.toString()}>{row[idx]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
