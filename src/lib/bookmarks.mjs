export function normalizeUrl(value) {
  if (typeof value !== 'string') {
    throw new TypeError('Enter a valid web address.');
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new TypeError('Enter a valid web address.');
  }

  const hasScheme =
    /^[a-z][a-z\d+.-]*:/i.test(trimmed) &&
    !/^[a-z\d.-]+:\d+(?:[/?#]|$)/i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;

  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new TypeError('Enter a valid web address.');
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw new TypeError('Only HTTP and HTTPS links can be saved.');
  }

  return url.href;
}

export function recoverBookmarks(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((entry) => {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      Array.isArray(entry) ||
      typeof entry.url !== 'string' ||
      typeof entry.slug !== 'string' ||
      !/^mona-[0-9A-Za-z]{1,12}$/.test(entry.slug)
    ) {
      return [];
    }

    try {
      return [{ url: normalizeUrl(entry.url), slug: entry.slug }];
    } catch {
      return [];
    }
  });
}

export function formatBookmark({ url, slug }) {
  return `${url} :: ${slug}`;
}
