/**
 * Escapes special RegExp characters.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/**
 * Highlights occurrences of the search query.
 *
 * @param {string} text
 * @param {string} query
 * @returns {string | React.ReactNode[]}
 */
export default function highlightText(
  text,
  query
) {
  const content =
    String(text ?? "");

  const search =
    String(query ?? "").trim();

  if (!content || !search) {
    return content;
  }

  const escapedQuery =
    escapeRegExp(search);

  const regex = new RegExp(
    `(${escapedQuery})`,
    "gi"
  );

  const parts =
    content.split(regex);

  const normalizedSearch =
    search.toLowerCase();

  return parts.map(
    (part, index) =>
      part.toLowerCase() ===
      normalizedSearch ? (
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