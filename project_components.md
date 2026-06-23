# Project UI Components Overview

This document catalogs all major UI elements (buttons, cards, navigation items) present in the **ORNGDB** Django project. Each entry lists the component type, the template or script where it is defined, its visual position within the page, its functional purpose, and the associated behavior (e.g., navigation, modal, AJAX call).

---

| Component | Template / Script | Section / Position | Primary Function | Behavior / Interaction |
|-----------|-------------------|-------------------|------------------|------------------------|
| **Bottom Navigation Bar** | `templates/base.html` (lines 156‑188) | Fixed bottom of viewport (`.bottom-nav`) | Global navigation for Agent role | Clicking a nav item follows a Django URL (`{% url 'delivery_dashboard' %}` etc.). The active link receives the `active` class giving orange highlight. |
| **Orders Tab** | `templates/base.html` (line 158‑162) | Bottom nav item (left) | Navigate to Delivery Dashboard | Standard `<a>` link with Django URL `{% url 'delivery_dashboard' %}`; active state handled by `request.resolver_match.url_name`. |
| **Products Tab** | `templates/base.html` (line 164‑168) | Bottom nav item (second) | Navigate to Products admin view | `<a>` link to `{% url 'admin_products_view' %}`; active styling same as Orders tab. |
| **Quick Bill Button (center raised)** | `templates/base.html` (lines 170‑174) | Center of bottom nav (`.bottom-nav-center`) | Open Quick‑Bill workflow | Button id `bottom-qb-btn`; on click JavaScript (lines 191‑205) checks if current page is the delivery dashboard. If yes, calls `handleQuickBillBtnClick()`; otherwise stores flag in `sessionStorage` and redirects to dashboard. |
| **Stores Tab** | `templates/base.html` (lines 176‑180) | Bottom nav item (right) | Navigate to Stores admin view | `<a>` link to `{% url 'admin_stores_view' %}`; active styling similar to other tabs. |
| **Profile Tab** | `templates/base.html` (lines 182‑186) | Bottom nav item (far right) | Navigate to user profile | `<a>` link to `{% url 'profile_view' %}`; active styling same as others. |
| **Add Product Button** | `templates/products/product_list.html` (line 5) | Above product table | Create new product | Simple `<a>` styled as button linking to `{% url 'product_create' %}`. |
| **Product Table Row** | `templates/products/product_list.html` (lines 18‑27) | Inside `<table>` body | Display product data | Each row shows name, purchase price, selling price, qty, store, and action links (Edit/Delete). Action links are normal `<a>` tags pointing to `{% url 'product_update' product.pk %}` and `{% url 'product_delete' product.pk %}`. |
| **Cart Item Quantity Stepper** | `templates/orders/cart.html` (lines 33‑40) | Inside cart list items | Adjust quantity of a cart line | Consists of decrement (`.dec-btn`) and increment (`.inc-btn`) buttons surrounding a number `<input>`. JavaScript in the same file (lines 81‑99) intercepts clicks, updates the input value, and submits the enclosing form via POST to `{% url 'cart_update' item.id %}`. |
| **Place Order Button** | `templates/orders/cart.html` (line 67‑69) | Order summary card (right side) | Submit checkout | `<button type="submit">` inside a form posting to `{% url 'checkout' %}`. Styled with orange background. |
| **Order Card (My Orders)** | `templates/orders/my_orders.html` (lines 16‑19) | Grid of cards on My Orders page | Visual container for each order | `<div class="card ..." id="order-card-{{ order.id }}">` contains header, body, and footer. |
| **Order Status Badge** | `templates/orders/my_orders.html` (lines 25‑36) | Card header | Show order status (Pending, Packed, Delivered, Received, Cancelled) | Rendered with conditional `{% if %}` blocks; each badge uses a Bootstrap badge with appropriate colour. |
| **Order Items List (inline checklist)** | `templates/orders/my_orders.html` (lines 42‑63) | Card body when a delivered order has ≤3 items | Allow user to tick items as received | Each item has a checkbox (`.inline-check-{{ order.id }}`) and label. JavaScript functions `inlineToggle` (lines 144‑165) update visual strike‑through and enable the **Confirm Receipt** button only when all are checked. |
| **Confirm Receipt Button** | `templates/orders/my_orders.html` (lines 94‑100) | Card footer (delivered small orders) | Mark order as received | Disabled by default; becomes enabled when all checkboxes are checked. On click, `submitInlineReceive` (lines 167‑242) sends an AJAX POST to `{% url 'mark_order_received' order.id %}` and updates UI (badge, list, footer) on success. |
| **View Order Button** | `templates/orders/my_orders.html` (lines 110‑112) | Card footer (standard orders) | Navigate to order detail page | Simple `<a>` linking to `{% url 'order_detail' order.id %}`. |
| **Bulk Import Button** | `static/js/bulk_actions.js` (line 65) | Dynamically attached to page based on `page` variable (`products` or `stores`) | Open import modal | Click opens Bootstrap modal (`importProductsModal` or `importStoresModal`). |
| **Bulk Export Button** | `static/js/bulk_actions.js` (line 118) | Same as above | Open export modal & preview data | Click opens modal, fetches CSV via `/manage/${page}/bulk-export/`, shows preview, and creates a download link. |
| **Bulk Delete Button** | `static/js/bulk_actions.js` (line 154) | Same as above | Delete all items of the current page | Click opens confirmation modal; upon confirmation sends POST to `/manage/${page}/bulk-delete/` and reloads page on success. |
| **Sample CSV Download Link** | `static/js/bulk_actions.js` (lines 78‑85) | Inside import modal | Provide sample CSV template | Generates a Blob from hard‑coded CSV string and sets `href` of the download button. |
| **Toast Notification (generic)** | `static/js/bulk_actions.js` (lines 9‑45) | Dynamically created `<div id="dynamicBulkToast">` | Show success/error messages | `showToast(msg, isSuccess)` updates toast text, colour, shows it for ~2.8 s, then fades out. |
| **Orders Toast** | `templates/orders/my_orders.html` (lines 123‑140) | Fixed bottom‑center container | Show order‑related success/error | `showOrdersToast(msg, isSuccess)` toggles visibility and colour of the toast. |

---

### Notes
- All URLs are generated by Django's `{% url %}` tag, ensuring correct routing.
- JavaScript interactions rely on Bootstrap’s modal component and the Fetch API for AJAX calls.
- Buttons that trigger modals (`bulkImportBtn`, `bulkExportBtn`, `bulkDeleteBtn`) are conditionally rendered by the server depending on the current page (`products` vs `stores`).
- The **Quick Bill** button has special logic to either execute `handleQuickBillBtnClick()` on the dashboard or store a flag for later use when navigating to the dashboard.

This table serves as a quick reference for developers and designers to understand where UI elements live, how they behave, and where to modify them.

*Generated on 2026‑06‑23*
