from rest_framework import serializers
from django.core.exceptions import ValidationError
from drf_writable_nested.serializers import WritableNestedModelSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    User, JobSeekerProfile, EmployerProfile, AdminProfile,
    EducationEntry, WorkExperienceEntry, Skill, LanguageKnown, Certification,
    Company, Job, JobApplication, SavedJob,
    NewsletterSubscriber, Notification, Conversation, Message
)

User = get_user_model()

# serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import User
from . import models
from django.db.models import Q

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        'no_active_account': 'No active account found with the given credentials'
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow both fields
        self.fields['email'] = serializers.CharField(required=False)
        self.fields['username'] = serializers.CharField(required=False)

    def validate(self, attrs):
        # Get login value from either field
        login_value = attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        if not login_value:
            raise serializers.ValidationError(
                {"detail": "Must provide either 'username' or 'email'."}
            )

        if not password:
            raise serializers.ValidationError(
                {"detail": "Password is required."}
            )

        # Try to authenticate
        user = authenticate(
            request=self.context.get('request'),
            username=login_value,  # Django auth backend uses username internally
            password=password
        )

        if user is None:
            # Check if user exists (better error messages)
            exists = User.objects.filter(
                Q(email__iexact=login_value) | Q(username__iexact=login_value)
            ).exists()

            if not exists:
                raise serializers.ValidationError({
                    "detail": "No account found with this email or username."
                })
            else:
                raise serializers.ValidationError({
                    "detail": "Incorrect password."
                })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "This account is inactive."
            })

        # Success - map to username for JWT
        attrs['username'] = user.username
        return super().validate(attrs)

# User Serializers

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'user_type', 'date_joined']
        read_only_fields = ['id', 'date_joined', 'user_type']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone')
        )
        return user


class JobSeekerRegistrationSerializer(UserRegistrationSerializer):
    class Meta(UserRegistrationSerializer.Meta):
        fields = UserRegistrationSerializer.Meta.fields

    def create(self, validated_data):
        validated_data['user_type'] = User.UserType.JOBSEEKER
        user = super().create(validated_data)
        JobSeekerProfile.objects.create(user=user)
        return user


# Employer Registration 
class EmployerRegistrationSerializer(UserRegistrationSerializer):
    class Meta(UserRegistrationSerializer.Meta):
        fields = UserRegistrationSerializer.Meta.fields

    def create(self, validated_data):
        validated_data['user_type'] = User.UserType.EMPLOYER
        user = super().create(validated_data)
        EmployerProfile.objects.create(user=user)
        return user


# Child Model Serializers

class EducationEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationEntry
        fields = '__all__'
        read_only_fields = ['id', 'profile']

    def validate(self, data):
        level = data.get('qualification_level')
        errors = {}

        if not data.get('institution'):
            errors['institution'] = "Institution name is required."

        if level in ['SSLC', 'HSC', 'Diploma']:
            if not data.get('completion_year'):
                errors['completion_year'] = "Year of completion is required for this level."
            if data.get('start_year') or data.get('end_year'):
                errors['start_year'] = "Start/end year not allowed for SSLC/HSC/Diploma."

        if level in ['Graduation', 'Post-Graduation', 'Doctorate']:
            if not data.get('start_year'):
                errors['start_year'] = "Start year is required for Graduation+ levels."
            if not data.get('end_year'):
                errors['end_year'] = "End year is required for Graduation+ levels."
            if data.get('completion_year'):
                errors['completion_year'] = "Completion year not allowed for Graduation+ levels."

        if level == 'HSC' and not data.get('post_10th_study'):
            errors['post_10th_study'] = "Please select what you studied after 10th."

        if level in ['Graduation', 'Post-Graduation'] and not data.get('degree'):
            errors['degree'] = "Degree is required for Graduation/Post-Graduation."

        if errors:
            raise serializers.ValidationError(errors)

        return data


class WorkExperienceEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperienceEntry
        fields = '__all__'
        read_only_fields = ['id', 'profile']

    def validate(self, data):
        errors = {}

        if data.get('current_status') == WorkExperienceEntry.CurrentStatus.EXPERIENCED:
            if not data.get('job_title'):
                errors['job_title'] = "Job title is required when status is Experienced."
            if not data.get('company_name'):
                errors['company_name'] = "Company name is required when status is Experienced."

        if data.get('currently_working') and data.get('end_date'):
            errors['end_date'] = "End date should be empty if currently working."

        if errors:
            raise serializers.ValidationError(errors)

        return data


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']
        read_only_fields = ['id', 'profile']


class LanguageKnownSerializer(serializers.ModelSerializer):
    class Meta:
        model = LanguageKnown
        fields = ['id', 'name', 'proficiency']
        read_only_fields = ['id', 'profile']


class CertificationSerializer(serializers.ModelSerializer):
    certificate_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Certification
        fields = ['id', 'name', 'certificate_file', 'certificate_url']
        read_only_fields = ['id', 'profile']

    def get_certificate_url(self, obj):
        return obj.certificate_file.url if obj.certificate_file else None


# Profile Serializers

class JobSeekerProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)

    educations = EducationEntrySerializer(many=True, read_only=True)
    experiences = WorkExperienceEntrySerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    languages = LanguageKnownSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)

    expected_salary = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )

    experience_years = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    class Meta:
        model = JobSeekerProfile
        fields = '__all__'

    def get_profile_photo_url(self, obj):
        return obj.profile_photo.url if obj.profile_photo else None

    def get_resume_url(self, obj):
        return obj.resume_file.url if obj.resume_file else None


class JobSeekerProfileWriteSerializer(WritableNestedModelSerializer):
    educations = EducationEntrySerializer(many=True, required=False)
    experiences = WorkExperienceEntrySerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    languages = LanguageKnownSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)

    class Meta:
        model = JobSeekerProfile
        exclude = ['id', 'user', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get('dob') and data['dob'] > timezone.now().date():
            raise serializers.ValidationError({
                "dob": "Date of birth cannot be in the future."
            })
        return data

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills', None)
        languages_data = validated_data.pop('languages', None)
        certifications_data = validated_data.pop('certifications', None)

        # First update normal profile fields + educations + experiences
        instance = super().update(instance, validated_data)

        # --------------------------
        # SKILLS (Replace Completely)
        # --------------------------
        if skills_data is not None:
            instance.skills.all().delete()
            for skill in skills_data:
                if skill.get("name"):
                    Skill.objects.create(
                        profile=instance,
                        name=skill["name"].strip()
                    )

        # --------------------------
        # LANGUAGES (Replace Completely)
        # --------------------------
        if languages_data is not None:
            instance.languages.all().delete()
            for lang in languages_data:
                if lang.get("name"):
                    LanguageKnown.objects.create(
                        profile=instance,
                        name=lang["name"].strip(),
                        proficiency=lang.get("proficiency")
                    )

        # --------------------------
        # CERTIFICATIONS (Replace Completely)
        # --------------------------
        if certifications_data is not None:
            instance.certifications.all().delete()
            for cert in certifications_data:
                if cert.get("name"):
                    Certification.objects.create(
                        profile=instance,
                        name=cert["name"].strip(),
                        certificate_file=cert.get("certificate_file")
                    )

        return instance
    
class AdminProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)

    class Meta:
        model = AdminProfile
        fields = '__all__'


class AdminProfileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        exclude = ['id', 'user', 'created_at', 'updated_at']


# Company Serializer — full & supports create/update/disable
class CompanySerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField(read_only=True)
    custom_id = serializers.CharField(read_only=True)  # auto-generated

    class Meta:
        model = Company
        fields = [
            'id', 'custom_id', 'name', 'logo', 'logo_url',
            'slogan', 'rating', 'review_count',
            'company_overview', 'website', 'industry',
            'employee_count', 'founded_year', 'company_address',
            'is_active'
        ]
        read_only_fields = ['id', 'custom_id', 'rating', 'review_count', 'is_active']

    def get_logo_url(self, obj):
        return obj.logo.url if obj.logo else None



# EmployerProfile Read Serializer
class EmployerProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    company = CompanySerializer(read_only=True)

    class Meta:
        model = EmployerProfile
        fields = ['id', 'user', 'full_name', 'employee_id', 'company', 'created_at', 'updated_at']


# EmployerProfile Write Serializer 
class EmployerProfileWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerProfile
        fields = ['full_name', 'employee_id', 'company']

    def validate_employee_id(self, value):
        if not value:
            return None

        qs = EmployerProfile.objects.filter(employee_id=value)
        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            raise serializers.ValidationError("This Employee ID is already in use.")

        return value


    def validate_company(self, value):
        if value and not value.is_active:
            raise serializers.ValidationError("Cannot link to an inactive company.")
        return value


# Job Read Serializer 
class JobReadSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    posted_by = serializers.CharField(source='posted_by.username', read_only=True, default='Company Jobs')
    job_status_display = serializers.CharField(source='get_job_status_display', read_only=True)
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location',
            'job_type', 'industry_type', 'experience_required', 'work_type',
            'salary', 'description', 'responsibilities', 'job_highlights', 'key_skills',
            'education_required', 'tags', 'department', 'shift', 'duration',
            'openings', 'applicants_count', 'posted_date', 'posted_by',
            'is_active','job_status','job_status_display'
        ]

# Job Serializer for CREATE (full validation)
class JobWriteSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    posted_by = serializers.CharField(source='posted_by.username', read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location',
            'job_type', 'industry_type', 'experience_required', 'work_type',
            'salary', 'description', 'responsibilities','job_highlights','key_skills',
            'education_required', 'tags', 'department', 'shift', 'duration',
            'openings', 'applicants_count', 'posted_date', 'posted_by',
            'is_active','job_status'
        ]
        read_only_fields = ['id', 'company', 'posted_date', 'posted_by', 'applicants_count']

    def validate(self, data):
        user = self.context['request'].user
        if not hasattr(user, 'employer_profile'):
            raise serializers.ValidationError("Only employers can create/update jobs.")
        
        employer_profile = user.employer_profile
        if not employer_profile.company:
            raise serializers.ValidationError(
                "You must create or link a company in your profile before posting jobs."
            )

        # For CREATE: title must be unique per company
        title = data.get('title')
        if title and Job.objects.filter(
            company=employer_profile.company,
            title__iexact=title
        ).exists():
            raise serializers.ValidationError(
                {"title": f"A job with title '{title}' already exists for this company."}
            )

        return data

    def create(self, validated_data):
        validated_data['posted_by'] = self.context['request'].user
        employer_profile = self.context['request'].user.employer_profile
        validated_data['company'] = employer_profile.company
        return super().create(validated_data)


# NEW: Separate serializer for UPDATE (PATCH/PUT) - fields optional
class JobUpdateSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    posted_by = serializers.CharField(source='posted_by.username', read_only=True)

    class Meta:
        model = Job
        fields =  "__all__"
        read_only_fields = ['id', 'company', 'posted_date', 'posted_by', 'applicants_count']

    def validate(self, data):
        user = self.context['request'].user
        if not hasattr(user, 'employer_profile'):
            raise serializers.ValidationError("Only employers can update jobs.")
        
        # Optional: only check title uniqueness if title is being changed
        title = data.get('title')
        if title:
            instance = self.instance
            if Job.objects.filter(
                company=instance.company,
                title__iexact=title
            ).exclude(id=instance.id).exists():
                raise serializers.ValidationError(
                    {"title": f"A job with title '{title}' already exists for this company."}
                )

        return data

# JobApplication & SavedJob 
class JobApplicationWriteSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)
    job = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all()
    )

    class Meta:
        model = JobApplication
        fields = ['job', 'cover_letter', 'resume']
        read_only_fields = ['id', 'applied_date', 'user', 'status', 'resume_version']

    def validate(self, data):
        if not hasattr(self.context['request'].user, 'jobseeker_profile'):
            raise serializers.ValidationError("Only jobseekers can apply.")

        user = self.context['request'].user
        job = data.get('job')

        # Check if there is already an ACTIVE application
        active_statuses = [
            JobApplication.Status.APPLIED,
            JobApplication.Status.RESUME_SCREENING,
            JobApplication.Status.RECRUITER_REVIEW,
            JobApplication.Status.SHORTLISTED,
            JobApplication.Status.INTERVIEW_CALLED,
            JobApplication.Status.OFFERED,
            JobApplication.Status.HIRED
        ]

        if JobApplication.objects.filter(
            user=user,
            job=job,
            status__in=active_statuses
        ).exists():
            raise serializers.ValidationError(
                "You already have an active application for this job. "
                "Please wait for a response or withdraw the existing one."
            )

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        resume = validated_data.pop('resume', None)

        validated_data['user'] = user
        validated_data['status'] = JobApplication.Status.APPLIED

        if resume:
            validated_data['resume_version'] = resume
        else:
            profile = user.jobseeker_profile
            if profile.resume_file:
                validated_data['resume_version'] = profile.resume_file

        return super().create(validated_data)

# NEW: Full read serializer for JobApplication (used after create)
class JobApplicationDetailSerializer(serializers.ModelSerializer):
    job = JobReadSerializer(read_only=True)
    user = UserReadSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'user', 'applied_date', 'status',
            'cover_letter', 'resume_version'
        ]
        read_only_fields = ['id', 'applied_date', 'user', 'status']


from rest_framework import serializers
from .models import SavedJob
class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobReadSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(),
        source="job",
        write_only=True
    )

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_id', 'saved_date']
        read_only_fields = ['id', 'saved_date']



class JobApplicationListSerializer(serializers.ModelSerializer):
    job = JobReadSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'applied_date', 'status', 'cover_letter']
        read_only_fields = ['id', 'applied_date', 'status']


class JobApplicationEmployerSerializer(serializers.ModelSerializer):
    job = JobReadSerializer(read_only=True)
    user = UserReadSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'user', 'applied_date', 'status', 'cover_letter']
        read_only_fields = ['id', 'applied_date']

# Other Models


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = '__all__'
        read_only_fields = ['subscribed_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at']

from rest_framework import serializers
from .models import UserSettings

class UserSettingsSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserSettings
        fields = [
            "account_type",
            "email",
            "phone",
            "show_online_status",
            "show_read_receipts",
            "restrict_duplicate_applications",
            "hide_cv",
        ]



class ChatUserSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_online']
        read_only_fields = fields

class MessageSerializer(serializers.ModelSerializer):
    sender = ChatUserSerializer(read_only=True)
    receiver = ChatUserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'timestamp']

class SendMessageSerializer(serializers.Serializer):
   
    receiver_id = serializers.IntegerField()
    content = serializers.CharField()
    
    def validate(self, data):
        sender = self.context['request'].user
        receiver_id = data.get('receiver_id')
        
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            raise serializers.ValidationError({"receiver_id": "Receiver not found"})
        
       
        conversation = Conversation.objects.filter(
            participants=sender
        ).filter(
            participants=receiver
        ).first()
        
        if not conversation:
           
            if sender.user_type != 'employer':
                raise serializers.ValidationError(
                    "Only employers can start new conversations. Jobseekers can only reply to existing conversations."
                )
        else:
            
            if sender.user_type == 'jobseeker':
               
                employer = conversation.participants.filter(user_type='employer').first()
                if not employer:
                    raise serializers.ValidationError("No employer found in this conversation")
                
                
                if not conversation.jobseeker_can_reply:
                    raise serializers.ValidationError(
                        "You cannot reply yet. Please wait for the employer to respond first."
                    )
        
        data['receiver'] = receiver
        data['conversation'] = conversation
        return data
    
    def create(self, validated_data):
        sender = self.context['request'].user
        receiver = validated_data['receiver']
        content = validated_data['content']
        existing_conversation = validated_data.get('conversation')
        
        
        if existing_conversation:
            conversation = existing_conversation
        else:
            conversation = Conversation.objects.create()
            conversation.participants.add(sender, receiver)
            
            
            if sender.user_type == 'employer':
                conversation.initiated_by = sender
                conversation.save()
        
        
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            receiver=receiver,
            content=content
        )
        
        
        conversation.save()
        
        return message
    
class ConversationSerializer(serializers.ModelSerializer):
    participants = ChatUserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    initiated_by = ChatUserSerializer(read_only=True)
    jobseeker_can_reply = serializers.BooleanField(read_only=True)
    conversation_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'created_at', 'updated_at', 
            'last_message', 'unread_count',
            'initiated_by', 'jobseeker_can_reply', 'conversation_status'
        ]
    
    def get_last_message(self, obj):
        last_msg = obj.messages.first()
        return MessageSerializer(last_msg).data if last_msg else None
    
    def get_unread_count(self, obj):
        return obj.messages.filter(
            receiver=self.context['request'].user, 
            is_read=False
        ).count()
    
    def get_conversation_status(self, obj):
        
        user = self.context['request'].user
        
        if user.user_type == 'employer':
            return "You can message any jobseeker"
        else:  
            if obj.jobseeker_can_reply:
                return "You can reply to this conversation"
            else:
                return "Waiting for employer to respond"
            
        
from rest_framework import serializers
from .models import ChatMessage
 
 
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"

from rest_framework import serializers
from .models import HelpTopic
from .models import RaiseTicket
 
class HelpTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpTopic
        fields = ['id', 'title', 'path']
 
class RaiseTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = RaiseTicket
        fields = '__all__'


# Password Serializer
 
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
 
    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if not user.is_active:
                raise serializers.ValidationError("This account is inactive.")
            self.context['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        return value
 
 
class ResetPasswordConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
 
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data
 
 
class CreatePasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
 
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data       