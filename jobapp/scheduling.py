# jobapp/scheduling.py
# No-op — kept for backward compatibility. Admin password expiry now uses
# a periodic beat task (jobapp.tasks.check_admin_password_expiry).

import logging

logger = logging.getLogger(__name__)


def revoke_admin_password_expiry_tasks(user):
    """No-op. Nothing to revoke anymore."""
    user.password_warning_task_id = None
    user.password_expired_task_id = None
    user.save(update_fields=[
        "password_warning_task_id",
        "password_expired_task_id",
    ])


def schedule_admin_password_expiry_tasks(user):
    """No-op. The periodic beat task handles everything."""
    pass


def reset_and_reschedule_admin_password_tasks(user):
    """Reset the sent flags so the next password cycle re-triggers emails."""
    revoke_admin_password_expiry_tasks(user)