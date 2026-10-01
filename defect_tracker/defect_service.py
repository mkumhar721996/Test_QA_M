from defect_tracker.models import Defect, Status
from defect_tracker.notifications import NotificationService


class DefectService:
    def __init__(self, notification_service: NotificationService):
        self._notifications = notification_service

    def change_status(self, defect: Defect, new_status: Status) -> None:
        defect.status = new_status
        self._notifications.notify_status_change(defect)
        if new_status == Status.REOPENED:
            self._notifications.notify_reopened(defect)
