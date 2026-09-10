from dataclasses import dataclass
from enum import Enum
from typing import Optional


class Status(Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    REOPENED = "Reopened"
    CLOSED = "Closed"


@dataclass
class Defect:
    id: str
    status: Status
    reporter: str
    assigned_developer: Optional[str] = None
