declare module "arabic-reshaper" {
  export function convertArabic(text: string): string;
  export function convertArabicBack(text: string): string;
  const defaultExport: {
    convertArabic: typeof convertArabic;
    convertArabicBack: typeof convertArabicBack;
  };
  export default defaultExport;
}
