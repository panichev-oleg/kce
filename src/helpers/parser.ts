export function tableToArraysFromHTMLInternal(htmlString: string) {
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

export function tableToArraysFromHTMLExternal(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const table = doc.querySelector("table#geo2g");
  if (!table) {
    return [];
  }

  const rows = Array.from(table.querySelectorAll("tr.on, tr.onx"));

  const arrays = rows.map((row) => {
    const cells = Array.from(row.querySelectorAll("td"));
    return cells.map((cell) => {
      const link = cell.querySelector("a[href]") as HTMLAnchorElement | null;
      const hasAlert = !!cell.querySelector('font[color="red"]');

      if (link) {
        const url = new URL(link.href, document.baseURI);
        return {
          text: link.textContent?.trim() || "",
          tid: url.searchParams.get("tid"),
          sid: url.searchParams.get("sid"),
          hasAlert,
        };
      }

      return {
        text: cell.textContent?.trim() || "",
        tid: null,
        sid: null,
        hasAlert,
      };
    });
  });

  return arrays;
}
