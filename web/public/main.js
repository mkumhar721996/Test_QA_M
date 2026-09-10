(function () {
  const { fetchDefects, renderDefectTable, createDefectListController } = window.DefectApp;

  const apiBaseUrl = window.DEFECT_API_BASE_URL || "http://localhost:8005";
  const listContainer = document.getElementById("defect-list");
  const statusFilter = document.getElementById("status-filter");
  const severityFilter = document.getElementById("severity-filter");
  const moduleFilter = document.getElementById("module-filter");
  const searchInput = document.getElementById("search-input");

  let currentSortState = null;

  function attachSortHandlers() {
    listContainer.querySelectorAll("th[data-column]").forEach((th) => {
      th.addEventListener("click", () => {
        controller.sortByColumn(th.getAttribute("data-column")).then((sorted) => {
          currentSortState = controller.getState().sort;
          listContainer.innerHTML = renderDefectTable(sorted, currentSortState);
          attachSortHandlers();
        });
      });
    });
  }

  const controller = createDefectListController({
    fetchDefects: (criteria) => fetchDefects(apiBaseUrl, criteria),
    onRender: (defects) => {
      listContainer.innerHTML = renderDefectTable(defects, currentSortState);
      attachSortHandlers();
    },
  });

  statusFilter.addEventListener("change", () => controller.setFilter("status", statusFilter.value));
  severityFilter.addEventListener("change", () => controller.setFilter("severity", severityFilter.value));
  moduleFilter.addEventListener("change", () => controller.setFilter("module", moduleFilter.value));
  searchInput.addEventListener("input", () => controller.setSearch(searchInput.value));

  controller.setFilter("status", "");
})();
