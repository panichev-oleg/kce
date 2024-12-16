export function tableToArraysFromHTML(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const table = doc.querySelector("table");
  if (!table) {
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tr"));

  const arrays = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    return cells.map((cell) => cell.textContent?.trim() || "");
  });

  return arrays;
}
