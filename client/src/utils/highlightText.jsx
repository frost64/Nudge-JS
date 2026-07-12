function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function highlightText(text, query) {
  if (!query || !text) {
    return text;
  }

  const escapedQuery = escapeRegExp(query);

  const parts = text.split(
    new RegExp(`(${escapedQuery})`, "gi")
  );

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span
        key={index}
        className="search-highlight"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
}