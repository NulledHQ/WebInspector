# WebInspector 🕵️‍♂️

A powerful Chrome DevTools extension to inspect, filter, modify, and replay network requests directly inside the browser.

## Features

WebInspector enhances the standard network panel with a suite of powerful features designed for efficient debugging and development:

-   **Live Request Logging:** Captures and displays network activity in a clean, filterable table.
-   **Advanced Filtering:**
    -   Filter requests by URL text.
    -   Filter by request method (GET, POST, etc.) via a dynamic dropdown.
    -   Filter by request type (XHR, FETCH, SCRIPT, etc.).
    -   Filter by status code.
    -   Toggle visibility of requests made by other Chrome extensions.
-   **Detailed Request/Response Viewer:**
    -   Click any request to view its full details (URL, Method, Status, Headers, Body) in a dedicated modal.
    -   Headers are formatted for easy reading (`Key: Value`).
    -   Response bodies with JSON content are automatically syntax-highlighted.
    -   Clicking any header or body box instantly selects all its content for easy copying.
-   **Full-Featured Custom Request Builder:**
    -   Send custom HTTP requests directly from DevTools.
    -   Define the URL, Method, Headers, and Body.
    -   Utilities to URL-encode and decode the request body.
    -   View the full response, including status, headers, and a syntax-highlighted body.
-   **Integrated "Edit & Replay" Workflow:**
    -   Instantly send any logged network request to the Custom Request builder with a single click.
    -   All data (URL, Method, Headers, Body) is pre-filled, ready for you to modify and resend.
-   **Dynamic Image Preview:**
    -   If a custom request returns an image, it's displayed in a separate, dedicated preview modal.

## Installation

1.  Download the latest release from the [Releases page](https://github.com/NulledHQ/WebInspector/releases).
2.  Open Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" in the top-right corner.
4.  Click "Load unpacked" and select the project directory.

## How to Use

1.  Open Chrome DevTools (F12 or Ctrl+Shift+I).
2.  Look for the **"WebInspector"** tab and click it.
3.  Network requests from the inspected page will appear in the log in real-time.
4.  Click any row to open the **Details Modal**.
5.  From the Details Modal, click **"Edit & Replay"** to send that request to the Custom Request builder.
6.  Click the **`+`** button in the bottom-right to open the **Custom Request** builder from scratch.
