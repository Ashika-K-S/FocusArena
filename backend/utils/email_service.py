from django.core.mail import send_mail
from django.conf import settings


def send_block_email(user, reason):

    subject = "FocusArena Account Blocked"

    message = f"""
Hello {user.username},

Your FocusArena account has been blocked by the administration team.

Reason:
{reason}

If you believe this is a mistake, contact support.

Regards,
FocusArena Team
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False
    )


def send_unblock_email(user):

    subject = "FocusArena Account Restored"

    message = f"""
Hello {user.username},

Your FocusArena account has been restored.

You can now login again.

Regards,
FocusArena Team
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False
    )