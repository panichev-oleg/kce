export function tableToArraysFromHTML(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const table = doc.querySelector("table");
  if (!table) {
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tr.onx, tr.on"));

  const arrays = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    return cells.map((cell) => {
      const link = cell.querySelector<HTMLAnchorElement>("a[href]");
      if (link) {
        return {
          text: link.textContent?.trim() || "",
          tid:
            new URL(link.href, document.baseURI).searchParams.get("tid") ||
            null,
        };
      }
      return {
        text: cell.textContent?.trim() || "",
        tid: null,
      };
    });
  });

  return arrays;
}
