from typing import Protocol

from defect_tracker.models import Defect


class Mailer(Protocol):
    def send(self, to: str, subject: str, body: str) -> None:
        ...


class NotificationService:
    def __init__(self, mailer: Mailer):
        self._mailer = mailer

    def notify_status_change(self, defect: Defect) -> None:
        self._mailer.send(
            to=defect.reporter,
            subject=f"Defect {defect.id} status changed to {defect.status.value}",
            body=(
                f"Defect {defect.id} has a new status: {defect.status.value}."
            ),
        )

    def notify_reopened(self, defect: Defect) -> None:
        if defect.assigned_developer is None:
            return
        self._mailer.send(
            to=defect.assigned_developer,
            subject=f"Defect {defect.id} has been reopened",
            body=(
                f"Defect {defect.id} was reopened. Please revisit the fix."
            ),
        )
