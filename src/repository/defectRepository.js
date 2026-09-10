const { randomUUID } = require('node:crypto');

function createInMemoryDefectRepository() {
  const defects = new Map();

  return {
    create(defectData) {
      const defect = { id: randomUUID(), ...defectData };
      defects.set(defect.id, defect);
      return defect;
    },

    findById(id) {
      return defects.get(id);
    },

    update(id, changes) {
      const existing = defects.get(id);
      if (!existing) {
        return undefined;
      }
      const updated = { ...existing, ...changes };
      defects.set(id, updated);
      return updated;
    },
  };
}

module.exports = { createInMemoryDefectRepository };
