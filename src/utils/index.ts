class StringUtils {
  Compare(a: string, b: string): string {
    return a > b ? a + b : b + a;
  }
}
export const stringUtils = new StringUtils();
