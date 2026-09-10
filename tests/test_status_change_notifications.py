import unittest

from defect_tracker.defect_service import DefectService
from defect_tracker.models import Defect, Status
from defect_tracker.notifications import NotificationService


class FakeMailer:
    def __init__(self):
        self.sent_emails = []

    def send(self, to, subject, body):
        self.sent_emails.append({"to": to, "subject": subject, "body": body})

    def emails_to(self, address):
        return [email for email in self.sent_emails if email["to"] == address]


class StatusChangeNotificationTests(unittest.TestCase):
    def setUp(self):
        self.mailer = FakeMailer()
        self.service = DefectService(NotificationService(self.mailer))

    def test_any_status_change_emails_reporter_with_defect_and_new_status(self):
        defect = Defect(
            id="DEF-1",
            status=Status.OPEN,
            reporter="reporter@example.com",
            assigned_developer=None,
        )

        self.service.change_status(defect, Status.IN_PROGRESS)

        reporter_emails = self.mailer.emails_to("reporter@example.com")
        self.assertEqual(len(reporter_emails), 1)
        combined = reporter_emails[0]["subject"] + reporter_emails[0]["body"]
        self.assertIn("DEF-1", combined)
        self.assertIn(Status.IN_PROGRESS.value, combined)

    def test_reopened_with_assigned_developer_emails_that_developer(self):
        defect = Defect(
            id="DEF-2",
            status=Status.RESOLVED,
            reporter="reporter@example.com",
            assigned_developer="dev@example.com",
        )

        self.service.change_status(defect, Status.REOPENED)

        dev_emails = self.mailer.emails_to("dev@example.com")
        self.assertEqual(len(dev_emails), 1)
        combined = dev_emails[0]["subject"] + dev_emails[0]["body"]
        self.assertIn("DEF-2", combined)
        self.assertIn("revisit", combined.lower())

        reporter_emails = self.mailer.emails_to("reporter@example.com")
        self.assertEqual(len(reporter_emails), 1)

    def test_reopened_without_assigned_developer_sends_no_developer_email(self):
        defect = Defect(
            id="DEF-3",
            status=Status.RESOLVED,
            reporter="reporter@example.com",
            assigned_developer=None,
        )

        self.service.change_status(defect, Status.REOPENED)

        developer_addressed_emails = [
            email
            for email in self.mailer.sent_emails
            if email["to"] != "reporter@example.com"
        ]
        self.assertEqual(developer_addressed_emails, [])
        self.assertEqual(len(self.mailer.emails_to("reporter@example.com")), 1)

    def test_reopened_notifies_current_assignee_not_prior_assignee(self):
        defect = Defect(
            id="DEF-4",
            status=Status.RESOLVED,
            reporter="reporter@example.com",
            assigned_developer="dev-a@example.com",
        )

        defect.assigned_developer = "dev-b@example.com"

        self.service.change_status(defect, Status.REOPENED)

        self.assertEqual(len(self.mailer.emails_to("dev-b@example.com")), 1)
        self.assertEqual(self.mailer.emails_to("dev-a@example.com"), [])


if __name__ == "__main__":
    unittest.main()
