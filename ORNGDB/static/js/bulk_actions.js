// static/js/bulk_actions.js

document.addEventListener('DOMContentLoaded', function() {
  // Determine page type from URL or a data attribute
  const path = window.location.pathname;
  const page = path.includes('stores') ? 'stores' : 'products';
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

  function showToast(msg, isSuccess) {
    if (window.showToast) {
      window.showToast(msg, isSuccess);
      return;
    }
    const reorderToast = document.getElementById('reorderToast');
    if (reorderToast) {
      reorderToast.textContent = msg;
      reorderToast.style.background = isSuccess ? '#16a34a' : '#dc2626';
      reorderToast.classList.add('show');
      setTimeout(() => reorderToast.classList.remove('show'), 2800);
      return;
    }
    let toast = document.getElementById('dynamicBulkToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'dynamicBulkToast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.color = '#fff';
      toast.style.borderRadius = '40px';
      toast.style.padding = '10px 24px';
      toast.style.fontWeight = '600';
      toast.style.fontSize = '0.88rem';
      toast.style.boxShadow = '0 6px 24px rgba(0,0,0,0.18)';
      toast.style.zIndex = '9999';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.pointerEvents = 'none';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = isSuccess ? '#16a34a' : '#dc2626';
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(-4px)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%)';
    }, 2800);
  }

  const importInput = document.getElementById('bulkImportInput');
  const importBtn = document.getElementById('bulkImportBtn');
  const exportBtn = document.getElementById('bulkExportBtn');
  const deleteBtn = document.getElementById('bulkDeleteBtn');

  function getSelectedIds() {
    return Array.from(document.querySelectorAll('.bulk-select:checked'))
      .map(cb => cb.dataset.id)
      .filter(Boolean);
  }

  // Import via Modal with template preview and sample CSV download
  if (importBtn) {
    importBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const modalId = page === 'products' ? 'importProductsModal' : 'importStoresModal';
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    });
  }

  // Hook up sample download
  const downloadSampleBtn = document.getElementById(page === 'products' ? 'downloadProductSampleBtn' : 'downloadStoreSampleBtn');
  if (downloadSampleBtn) {
    const csvContent = page === 'products' 
      ? "position,name,price,available,icon\n1,Banana,60.00,True,🍌\n"
      : "name,phone\nSample Store,9876543210\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadSampleBtn.href = url;
  }

  // Hook up form submit inside import modal
  const importForm = document.getElementById(page === 'products' ? 'importProductsForm' : 'importStoresForm');
  const fileInput = document.getElementById(page === 'products' ? 'productCsvFileInput' : 'storeCsvFileInput');
  if (importForm && fileInput) {
    importForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const file = fileInput.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      
      const modalId = page === 'products' ? 'importProductsModal' : 'importStoresModal';
      const modalEl = document.getElementById(modalId);
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
      
      fetch(`/manage/${page}/bulk-import/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formData
      })
      .then(r => r.json())
      .then(data => {
        showToast(data.success ? 'Import successful' : (data.error || 'Import failed'), !!data.success);
        if (data.success) setTimeout(() => location.reload(), 1500);
      })
      .catch(() => showToast('Import failed', false));
    });
  }

  // Export via Modal with preview and download option
  if (exportBtn) {
    exportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      const modalId = page === 'products' ? 'exportProductsModal' : 'exportStoresModal';
      const modalEl = document.getElementById(modalId);
      if (!modalEl) return;
      
      const previewEl = document.getElementById(page === 'products' ? 'productExportPreview' : 'storeExportPreview');
      if (previewEl) previewEl.textContent = 'Loading preview...';
      
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      
      fetch(`/manage/${page}/bulk-export/`)
        .then(r => r.text())
        .then(csvText => {
          if (previewEl) {
            previewEl.textContent = csvText || '(No data to export)';
          }
          
          const downloadBtn = document.getElementById(page === 'products' ? 'downloadProductExportBtn' : 'downloadStoreExportBtn');
          if (downloadBtn) {
            const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            downloadBtn.href = url;
          }
        })
        .catch(() => {
          if (previewEl) previewEl.textContent = 'Failed to load preview.';
        });
    });
  }

  // Delete
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Show confirmation modal directly since we delete ALL items
      const modalEl = document.getElementById('confirmBulkDeleteModal');
      if (!modalEl) return;
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      const confirmBtn = document.getElementById('confirmBulkDeleteBtn');
      if (confirmBtn) {
        confirmBtn.onclick = function() {
          fetch(`/manage/${page}/bulk-delete/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({})
          })
          .then(r => r.json())
          .then(data => {
            showToast(data.success ? 'Deleted successfully' : (data.error || 'Delete failed'), !!data.success);
            if (data.success) setTimeout(() => location.reload(), 1500);
          })
          .catch(() => showToast('Delete failed', false));
          modal.hide();
        };
      }
    });
  }
});
