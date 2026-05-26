type OpenLibrarySearchDoc = {
  title?: string;
  author_name?: string[];
  publisher?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  key?: string;
};

type OpenLibrarySearchResponse = {
  docs: OpenLibrarySearchDoc[];
  numFound?: number;
};

type OpenLibraryWorkResponse = {
  description?: string | { value?: string };
  first_sentence?: string | { value?: string };
};

type OpenLibraryEditionsResponse = {
  entries?: Array<{
    isbn_13?: string[];
    isbn_10?: string[];
  }>;
};

export type OpenLibraryBook = {
  isbn: string;
  title: string;
  author?: string;
  publisher?: string;
  year?: number;
  description?: string;
  coverUrl?: string;
  workKey?: string;
};

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org";
const OPEN_LIBRARY_COVER_BASE_URL = "https://covers.openlibrary.org";

function normalizeIsbn(value: string): string {
  return value.replace(/[^0-9X]/gi, "").trim();
}

function pickIsbn(isbns?: string[]): string {
  if (!isbns || isbns.length === 0) {
    return "";
  }

  const normalized = isbns
    .map((isbn) => normalizeIsbn(isbn))
    .filter(Boolean);

  const isbn13 = normalized.find((isbn) => isbn.length === 13);
  if (isbn13) {
    return isbn13;
  }

  const isbn10 = normalized.find((isbn) => isbn.length === 10);
  return isbn10 ?? normalized[0] ?? "";
}

function buildCoverUrl({ coverId, isbn }: { coverId?: number; isbn?: string }) {
  if (coverId) {
    return `${OPEN_LIBRARY_COVER_BASE_URL}/b/id/${coverId}-M.jpg`;
  }

  if (isbn) {
    return `${OPEN_LIBRARY_COVER_BASE_URL}/b/isbn/${isbn}-M.jpg`;
  }

  return undefined;
}

function parseDescription(value: unknown): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    const obj = value as { value?: unknown };
    if (typeof obj.value === "string") {
      return obj.value.trim();
    }
  }

  return undefined;
}

function mapDocToBook(doc: OpenLibrarySearchDoc): OpenLibraryBook | null {
  const isbn = pickIsbn(doc.isbn);
  const title = doc.title?.trim() ?? "";

  if (!title) {
    return null;
  }

  return {
    isbn,
    title,
    author: doc.author_name?.[0],
    publisher: doc.publisher?.[0],
    year: doc.first_publish_year,
    coverUrl: buildCoverUrl({ coverId: doc.cover_i, isbn }),
    workKey: doc.key,
  };
}

async function fetchWorkDescription(workKey?: string): Promise<string | undefined> {
  if (!workKey) {
    return undefined;
  }

  try {
    const res = await fetch(`${OPEN_LIBRARY_BASE_URL}${workKey}.json`);
    if (!res.ok) {
      return undefined;
    }

    const data = (await res.json()) as OpenLibraryWorkResponse;
    const description =
      parseDescription(data.description) ??
      parseDescription(data.first_sentence);

    return description?.trim();
  } catch {
    return undefined;
  }
}

async function fetchIsbnFromEditions(
  workKey?: string,
): Promise<string | undefined> {
  if (!workKey) {
    return undefined;
  }

  try {
    const res = await fetch(
      `${OPEN_LIBRARY_BASE_URL}${workKey}/editions.json?limit=5`,
    );
    if (!res.ok) {
      return undefined;
    }

    const data = (await res.json()) as OpenLibraryEditionsResponse;
    const entries = data.entries ?? [];

    for (const entry of entries) {
      const isbn = pickIsbn([
        ...(entry.isbn_13 ?? []),
        ...(entry.isbn_10 ?? []),
      ]);
      if (isbn) {
        return isbn;
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

async function searchBooksByTitle(
  title: string,
  limit = 10,
): Promise<OpenLibraryBook[]> {
  const trimmed = title.trim();
  if (!trimmed) {
    return [];
  }

  const res = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/search.json?title=${encodeURIComponent(
      trimmed,
    )}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Open Library search failed");
  }

  const data = (await res.json()) as OpenLibrarySearchResponse;
  return (data.docs ?? [])
    .map(mapDocToBook)
    .filter((book): book is OpenLibraryBook => Boolean(book));
}

async function searchBooksByQuery(
  query: string,
  limit = 10,
): Promise<OpenLibraryBook[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const res = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(
      trimmed,
    )}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Open Library search failed");
  }

  const data = (await res.json()) as OpenLibrarySearchResponse;
  return (data.docs ?? [])
    .map(mapDocToBook)
    .filter((book): book is OpenLibraryBook => Boolean(book));
}

async function lookupByIsbn(isbn: string): Promise<OpenLibraryBook | null> {
  const normalized = normalizeIsbn(isbn);
  if (!normalized) {
    return null;
  }

  const res = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/search.json?isbn=${encodeURIComponent(
      normalized,
    )}&limit=1`,
  );

  if (!res.ok) {
    throw new Error("Open Library ISBN lookup failed");
  }

  const data = (await res.json()) as OpenLibrarySearchResponse;
  const first = data.docs?.[0];
  if (!first) {
    return null;
  }

  const book = mapDocToBook(first);
  if (!book) {
    return null;
  }

  const description = await fetchWorkDescription(book.workKey);
  return {
    ...book,
    description: description ?? book.description,
  };
}

async function enrichBookWithDescription(
  book: OpenLibraryBook,
): Promise<OpenLibraryBook> {
  const needsDescription = !book.description;
  const needsIsbn = !book.isbn;

  if (!needsDescription && !needsIsbn) {
    return book;
  }

  const [description, isbn] = await Promise.all([
    needsDescription ? fetchWorkDescription(book.workKey) : undefined,
    needsIsbn ? fetchIsbnFromEditions(book.workKey) : undefined,
  ]);

  return {
    ...book,
    description: description ?? book.description,
    isbn: isbn ?? book.isbn,
  };
}

export const openLibraryService = {
  searchBooksByTitle,
  searchBooksByQuery,
  lookupByIsbn,
  enrichBookWithDescription,
  normalizeIsbn,
};
