const { validateDefectInput, isValidAssignedDeveloper } = require('../domain/validation');
const { DefectStatus } = require('../domain/defect');
const { createInMemoryDefectRepository } = require('../repository/defectRepository');
const { canTransitionToFixed } = require('../domain/transitions');

function createDefectService(repository = createInMemoryDefectRepository()) {
  return {
    createDefect(input) {
      const { valid, errors } = validateDefectInput(input);
      if (!valid) {
        return { valid: false, errors };
      }

      const defect = repository.create({
        title: input.title,
        description: input.description,
        severity: input.severity,
        reporter: input.reporter,
        stepsToReproduce: input.stepsToReproduce,
        affectedModule: input.affectedModule,
        assignedDeveloper: input.assignedDeveloper || undefined,
        status: DefectStatus.OPEN,
      });

      return { valid: true, defect };
    },

    getDefect(id) {
      return repository.findById(id);
    },

    updateAssignedDeveloper(id, assignedDeveloper) {
      if (!isValidAssignedDeveloper(assignedDeveloper)) {
        return {
          success: false,
          reason: 'INVALID_INPUT',
          message: 'Assigned developer must be text',
        };
      }

      const defect = repository.update(id, { assignedDeveloper });
      if (!defect) {
        return { success: false, reason: 'NOT_FOUND', message: 'Defect not found' };
      }

      return { success: true, defect };
    },

    transitionToFixed(id) {
      const defect = repository.findById(id);
      if (!defect) {
        return { success: false, reason: 'NOT_FOUND', message: 'Defect not found' };
      }

      if (!canTransitionToFixed(defect)) {
        return {
          success: false,
          reason: 'DEVELOPER_REQUIRED',
          message: 'An assigned developer is required to mark this defect as Fixed',
        };
      }

      const updated = repository.update(id, { status: DefectStatus.FIXED });
      return { success: true, defect: updated };
    },
  };
}

module.exports = { createDefectService };
