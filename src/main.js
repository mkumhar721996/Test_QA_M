import { createDashboard } from "./features/analytics-dashboard/dashboard.js";
import { fixtureDefects } from "./data/fixtureDefects.js";

const PANEL_TITLES = {
  trend: "Defects Created vs. Closed",
  severity: "Severity Breakdown",
  module: "Defects by Module",
  status: "Status Distribution",
};

function renderBreakdownPanel(panel) {
  const section = document.createElement("section");
  section.setAttribute("aria-label", PANEL_TITLES[panel.id]);
  const heading = document.createElement("h2");
  heading.textContent = PANEL_TITLES[panel.id];
  section.append(heading);

  const list = document.createElement("ul");
  for (const item of panel.items) {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.dimension = item.dimension;
    button.dataset.value = item.value;
    button.setAttribute("aria-pressed", String(item.active));
    button.textContent = `${item.label} (${item.count})`;
    listItem.append(button);
    list.append(listItem);
  }
  section.append(list);
  return section;
}

function renderTrendPanel(panel) {
  const section = document.createElement("section");
  section.setAttribute("aria-label", PANEL_TITLES.trend);
  const heading = document.createElement("h2");
  heading.textContent = PANEL_TITLES.trend;
  section.append(heading);

  const list = document.createElement("ul");
  for (const point of panel.points) {
    const listItem = document.createElement("li");
    listItem.textContent = `${point.period}: created ${point.created}, closed ${point.closed}`;
    list.append(listItem);
  }
  section.append(list);
  return section;
}

function renderClearFiltersControl(clearFilters, onClear) {
  if (!clearFilters.visible) return null;
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = clearFilters.id;
  button.textContent = "Clear filters";
  button.addEventListener("click", onClear);
  return button;
}

export function mountDashboard(root, defects) {
  const dashboard = createDashboard(defects);

  function render() {
    root.replaceChildren();
    const vm = dashboard.getViewModel();

    const clearControl = renderClearFiltersControl(vm.clearFilters, () => dashboard.clearAll());
    if (clearControl) root.append(clearControl);

    for (const panel of [vm.trend, vm.severity, vm.module, vm.status]) {
      const section = panel.clickable ? renderBreakdownPanel(panel) : renderTrendPanel(panel);
      section.addEventListener("click", (event) => {
        const target = event.target.closest("button[data-dimension]");
        if (!target) return;
        dashboard.select(target.dataset.dimension, target.dataset.value);
      });
      root.append(section);
    }
  }

  dashboard.subscribe(render);
  render();
  return dashboard;
}

const root = document.getElementById("app");
if (root) {
  mountDashboard(root, fixtureDefects);
}
