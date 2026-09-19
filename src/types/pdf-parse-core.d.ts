declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfPage = {
    getTextContent: (options: {
      normalizeWhitespace: boolean;
      disableCombineTextItems: boolean;
    }) => Promise<{
      items: Array<{ str?: string; transform?: number[] }>;
    }>;
  };

  type PdfParseOptions = {
    pagerender?: (page: PdfPage) => Promise<string>;
  };

  type PdfParseResult = {
    text: string;
    numpages: number;
    info?: Record<string, unknown>;
  };

  const pdfParse: (buffer: Buffer, options?: PdfParseOptions) => Promise<PdfParseResult>;
  export default pdfParse;
}
