/**
 * PDF export uses the browser's own print pipeline: vector text, real A4
 * pagination, no external service and no 2MB rasteriser in the bundle.
 * The hidden #print-root holds the CV at true 210mm width, and the print
 * stylesheet in globals.css hides everything else.
 */
export async function exportToPDF(fileName: string): Promise<void> {
  if (typeof window === "undefined") throw new Error("Export is only available in the browser.");
  const root = document.getElementById("print-root");
  if (!root || root.childElementCount === 0) {
    throw new Error("Nothing to export yet. Add some content to your CV first.");
  }
  const safe = fileName.trim().replace(/[^\w\d -]/g, "").slice(0, 60) || "cv";
  const previousTitle = document.title;
  document.title = safe;
  try {
    await new Promise((resolve) => setTimeout(resolve, 60));
    window.print();
  } finally {
    setTimeout(() => {
      document.title = previousTitle;
    }, 500);
  }
}
