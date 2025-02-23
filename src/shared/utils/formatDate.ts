export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
