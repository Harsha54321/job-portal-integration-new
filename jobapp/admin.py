from django.contrib import admin
from .models import (
    AdminProfile,
    EducationEntry,
    WorkExperienceEntry,
    Skill,
    LanguageKnown,
    Certification,
    Company,
    EmployerProfile,
    Job,
    JobApplication,
    SavedJob,
    NewsletterSubscriber,
    Notification,
    Conversation,
    Message,
    ChatMessage,
    HelpTopic,
    RaiseTicket,
)

# -------------------------
# INLINE CONFIGURATION
# -------------------------

class EducationInline(admin.TabularInline):
    model = EducationEntry
    extra = 0


class ExperienceInline(admin.TabularInline):
    model = WorkExperienceEntry
    extra = 0


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0


class LanguageInline(admin.TabularInline):
    model = LanguageKnown
    extra = 0


class CertificationInline(admin.TabularInline):
    model = Certification
    extra = 0


# -------------------------
# COMPANY ADMIN
# -------------------------

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("custom_id", "name", "industry", "is_active", "created_at")
    search_fields = ("name", "industry")
    list_filter = ("is_active", "industry")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)


# -------------------------
# EMPLOYER ADMIN
# -------------------------

@admin.register(EmployerProfile)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "company", "created_at")
    search_fields = ("full_name", "user__email")
    list_filter = ("company",)


# -------------------------
# ADMIN PROFILE
# -------------------------

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "department", "access_level", "created_at")
    search_fields = ("user__email", "department")


# -------------------------
# JOB ADMIN
# -------------------------

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "location", "job_type", "is_active", "posted_date")
    list_filter = ("job_type", "work_type", "is_active")
    search_fields = ("title", "company__name")
    readonly_fields = ("applicants_count",)


# -------------------------
# JOB APPLICATION ADMIN
# -------------------------

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "status", "applied_date")
    list_filter = ("status",)
    search_fields = ("user__email", "job__title")
    readonly_fields = ("applied_date",)


# -------------------------
# SAVED JOBS
# -------------------------

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("user", "job", "saved_date")
    search_fields = ("user__email", "job__title")


# -------------------------
# NEWSLETTER
# -------------------------

@admin.register(NewsletterSubscriber)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "subscribed_at")
    search_fields = ("email",)
    list_filter = ("is_active",)


# -------------------------
# NOTIFICATIONS
# -------------------------

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("user__email",)


# -------------------------
# CHAT SYSTEM
# -------------------------

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "initiated_by", "jobseeker_can_reply", "updated_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "receiver", "timestamp", "is_read")
    search_fields = ("sender__email", "receiver__email")
    readonly_fields = ("timestamp",)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "created_at")
    readonly_fields = ("created_at",)


# -------------------------
# HELP SYSTEM
# -------------------------

@admin.register(HelpTopic)
class HelpTopicAdmin(admin.ModelAdmin):
    list_display = ("title", "path")


@admin.register(RaiseTicket)
class RaiseTicketAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "category", "subject", "created_at")
    list_filter = ("category", "subject", "created_at")
    search_fields = ("name", "email", "subject")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)



from django.contrib import admin
from django.contrib.sessions.models import Session
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()


class ActiveUserAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'session_key', 'expire_date')
    readonly_fields = ('user', 'email', 'session_key', 'expire_date')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.filter(expire_date__gte=timezone.now())

    def user(self, obj):
        data = obj.get_decoded()
        user_id = data.get('_auth_user_id')
        if user_id:
            return User.objects.filter(id=user_id).first()
        return None

    def email(self, obj):
        data = obj.get_decoded()
        user_id = data.get('_auth_user_id')
        if user_id:
            user = User.objects.filter(id=user_id).first()
            if user:
                return user.email
        return None


admin.site.register(Session, ActiveUserAdmin)
 
