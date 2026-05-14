from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification, Message

# Signal for sending email when notification is created
@receiver(post_save, sender=Notification)
def send_email_when_notification_created(sender, instance, created, **kwargs):
    if created:
        user = instance.user

        if user.email:
            send_mail(
                subject="New Notification",
                message=instance.message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )


# Signal for creating notification when a new message is sent
@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """
    Automatically create a notification when a new message is sent
    """
    if created and instance.sender != instance.receiver:
        # Create notification for the message receiver
        Notification.objects.create(
            user=instance.receiver,
            message=f"New message from {instance.sender.username}",
            notification_type='message',
            related_object_id=instance.conversation.id,
            is_read=False
        )