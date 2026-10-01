/** @type {import('../models/defect').Defect[]} */
const defectsSeed = [
  {
    id: "DEF-1",
    title: "Login page throws error on invalid password",
    status: "Open",
    severity: "High",
    module: "Authentication",
    assignedDeveloper: "Alice Chen",
  },
  {
    id: "DEF-2",
    title: "Checkout button unresponsive on mobile",
    status: "In Progress",
    severity: "Critical",
    module: "Checkout",
    assignedDeveloper: "Bilal Khan",
  },
  {
    id: "DEF-3",
    title: "Search results pagination skips last page",
    status: "Resolved",
    severity: "Medium",
    module: "Search",
    assignedDeveloper: "Carla Diaz",
  },
  {
    id: "DEF-4",
    title: "Profile avatar upload fails for large images",
    status: "Closed",
    severity: "Low",
    module: "Profile",
    assignedDeveloper: "Alice Chen",
  },
  {
    id: "DEF-5",
    title: "Password reset email never arrives",
    status: "Open",
    severity: "Critical",
    module: "Authentication",
    assignedDeveloper: "Dev Patel",
  },
  {
    id: "DEF-6",
    title: "Cart total miscalculates with discount codes",
    status: "In Progress",
    severity: "High",
    module: "Checkout",
    assignedDeveloper: "Carla Diaz",
  },
];

module.exports = { defectsSeed };
