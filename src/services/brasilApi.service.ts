// Serviço para buscar informações de livros na BrasilAPI por ISBN
// Docs: https://brasilapi.com.br/docs#tag/ISBN/operation/get-v1-isbn-isbn

export interface BrasilApiBook {
  title: string;
  subtitle?: string;
  authors: string[];
  publisher: string;
  year: string;
  cover_url?: string;
  synopsis?: string;
  isbn: string;
}

export async function fetchBookByIsbnFromBrasilApi(isbn: string): Promise<BrasilApiBook | null> {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/isbn/v1/${isbn}`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title,
      subtitle: data.subtitle,
      authors: data.authors,
      publisher: data.publisher,
      year: data.year,
      cover_url: data.cover_url,
      synopsis: data.synopsis,
      isbn: data.isbn,
    };
  } catch (e) {
    return null;
  }
}

// Utilitário para detectar ISBN brasileiro (978-65 ou 978-85)
export function isBrazilianIsbn(isbn: string): boolean {
  const digits = isbn.replace(/[^0-9]/g, "");
  return digits.startsWith("97865") || digits.startsWith("97885");
}
