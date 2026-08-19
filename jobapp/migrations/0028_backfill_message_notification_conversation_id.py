from django.db import migrations
 
 
def backfill_conversation_ids(apps, schema_editor):

    Notification = apps.get_model('jobapp', 'Notification')

    Conversation = apps.get_model('jobapp', 'Conversation')

    Message = apps.get_model('jobapp', 'Message')
 
    stale = Notification.objects.filter(

        event_type='new_message',

        related_object_id__isnull=False,

    )
 
    fixed = 0

    skipped = 0
 
    for notification in stale.iterator():

        roid = notification.related_object_id
 
        if Conversation.objects.filter(pk=roid).exists():

            continue
 
        message = Message.objects.filter(pk=roid).first()

        if message is None:

            skipped += 1

            continue
 
        notification.related_object_id = message.conversation_id

        notification.save(update_fields=['related_object_id'])

        fixed += 1
 
    print(f"[backfill_message_notification_conversation_id] fixed={fixed} skipped={skipped}")
 
 
def noop_reverse(apps, schema_editor):

    pass
 
 
class Migration(migrations.Migration):
 
    dependencies = [

        ('jobapp', '0023_alter_postajob_job_status'),

    ]
 
    operations = [

        migrations.RunPython(backfill_conversation_ids, noop_reverse),

    ]
 