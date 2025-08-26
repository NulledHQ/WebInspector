// js/devtools-utils.js

export function parseHeadersString(headersString) {
  const headers = {};
  if (!headersString) return headers;
  
  const lines = headersString.split('\n');
  for (const line of lines) {
    const parts = line.split(/:\s*(.*)/);
    if (parts.length === 3 && parts[0].trim()) {
      headers[parts[0].trim()] = parts[1].trim();
    }
  }
  return headers;
}

export function formatHeaders(headers) {
  if (!Array.isArray(headers)) return "";
  return headers.map(header => `${header.name}: ${header.value}`).join('\n');
}

export function formatJSON(value) {
  if (!value) return "";
  try {
    const obj = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(obj, null, 2);
  } catch {
    return value;
  }
}

export function highlightJSON(text) {
  if (!text) return "";
  const json = formatJSON(text);
  return json
    .replace(/&/g, "&amp;")
    .replace(/>/g, "&gt;")
    .replace(/</g, "&lt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      match => {
        let cls = "hljs-number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "hljs-attr";
          } else {
            cls = "hljs-string";
          }
        } else if (/true|false/.test(match)) {
          cls = "hljs-boolean";
        } else if (/null/.test(match)) {
          cls = "hljs-null";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}