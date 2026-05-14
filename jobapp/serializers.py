from rest_framework import serializers
from django.core.exceptions import ValidationError
from drf_writable_nested.serializers import WritableNestedModelSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
      User, JobSeekerProfile, EmployerProfile, AdminProfile,
    EducationEntry, WorkExperienceEntry, Skill, LanguageKnown, Certification,
    PostAJob, JobApplication, SavedJob,
    NewsletterSubscriber, Notification, Conversation, Message, ContactMessage, 
    CompanyVerification, Complaint, CompanyProfile, UserSettings, 
    HelpTopic, RaiseTicket, PasswordResetToken, EmailOTP, ChatMessage, Plan, Subscription,
    Invoice, PaymentMethod,
)
 
User = get_user_model()

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from django.db.models import Q
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that accepts BOTH username and email
    No field validation - accepts any string for username/email
    """
    
    # ✅ CRITICAL: Override fields to remove EmailField validation
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Remove default fields and add custom ones
        self.fields.clear()
        self.fields['username'] = serializers.CharField(required=False, allow_blank=True, write_only=True)
        self.fields['email'] = serializers.CharField(required=False, allow_blank=True, write_only=True)
        self.fields['password'] = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        # Get login value - try both fields
        login_value = attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        print(f"🔍 Login attempt with: '{login_value}'")
        print(f"🔍 Received attrs: {attrs}")

        if not login_value:
            raise serializers.ValidationError({
                "detail": ["Username or Email is required"]
            })

        if not password:
            raise serializers.ValidationError({
                "detail": ["Password is required"]
            })

        # ✅ Find user by username OR email
        user = None
        
        # Try to find by exact match first
        try:
            user = User.objects.get(
                Q(username__iexact=login_value) | Q(email__iexact=login_value)
            )
            print(f"📊 User found via direct lookup: {user.username}")
        except User.DoesNotExist:
            print(f"❌ No user found for: {login_value}")
            raise serializers.ValidationError({
                "detail": ["No account found with this email or username."]
            })
        except User.MultipleObjectsReturned:
            print(f"⚠️ Multiple users found, taking first")
            user = User.objects.filter(
                Q(username__iexact=login_value) | Q(email__iexact=login_value)
            ).first()

        # ✅ Check password
        if not user.check_password(password):
            print(f"❌ Password check failed for: {user.username}")
            raise serializers.ValidationError({
                "detail": ["Incorrect password."]
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": ["This account is inactive."]
            })
        from django.utils import timezone
        user.login_time = timezone.now()
        user.save(update_fields=["login_time"])
        
        print(f"✅ Login successful for: {user.username}")

        # ✅ Generate tokens
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'user_type': user.user_type,
                'phone': user.phone,
                'is_online': user.is_online
            }
        }
 
 
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
        password = validated_data.pop('password')
       
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
        )
       
        if 'user_type' in validated_data:
            user.user_type = validated_data['user_type']
       
        user.set_password(password)
        user.is_active = False
        user.save()
       
        return user
 
 
class JobSeekerRegistrationSerializer(UserRegistrationSerializer):
    class Meta(UserRegistrationSerializer.Meta):
        fields = UserRegistrationSerializer.Meta.fields
 
    def create(self, validated_data):
        validated_data['user_type'] = User.UserType.JOBSEEKER
        user = super().create(validated_data)
        JobSeekerProfile.objects.create(user=user)
        return user
 
 
class EmployerRegistrationSerializer(UserRegistrationSerializer):
    class Meta(UserRegistrationSerializer.Meta):
        fields = UserRegistrationSerializer.Meta.fields
 
    def validate(self, data):
        validated_data = super().validate(data)
        return validated_data
 
    def create(self, validated_data):
        validated_data['user_type'] = User.UserType.EMPLOYER

        if 'password_confirm' in validated_data:
            validated_data.pop('password_confirm')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            user_type=User.UserType.EMPLOYER
        )

        user.is_active = False    
        user.save()
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
 
        if level == 'HSC' and not data.get('post_10th_study'):
            errors['post_10th_study'] = "Please select what you studied after 10th."
 
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
    id = serializers.IntegerField(required=False)
    certificate_url = serializers.SerializerMethodField(read_only=True)
    certificate_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Certification
        fields = ['id', 'name', 'certificate_file', 'certificate_url']
        read_only_fields = ['certificate_url']

    def get_certificate_url(self, obj):
        return obj.certificate_file.url if obj.certificate_file else None
    
    def create(self, validated_data):
        certificate_file = validated_data.pop('certificate_file', None)
        certification = Certification.objects.create(
            **validated_data,
            certificate_file=certificate_file
        )
        return certification
    
    def update(self, instance, validated_data):
        certificate_file = validated_data.pop('certificate_file', None)
        
        # Update name
        instance.name = validated_data.get('name', instance.name)
        
        # Only update file if a new one is provided
        if certificate_file:
            # Delete old file if it exists
            if instance.certificate_file:
                instance.certificate_file.delete(save=False)
            instance.certificate_file = certificate_file
        
        instance.save()
        return instance
 
 
# Profile Serializers
 
# Profile Serializers
class JobSeekerProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    resume_url = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    highest_qualification = serializers.SerializerMethodField()
    employment_status = serializers.CharField(read_only=True)
   
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
   
    def get_highest_qualification(self, obj):
        """Calculate highest qualification from education entries"""
        educations = obj.educations.all()
       
        # Priority order: Doctorate > Post-Graduation > Graduation > Diploma
        if educations.filter(qualification_level='Doctorate').exists():
            return 'Doctorate'
        if educations.filter(qualification_level='Post-Graduation').exists():
            return 'Post-Graduation'
        if educations.filter(qualification_level='Graduation').exists():
            return 'Graduation'
        if educations.filter(qualification_level='Diploma').exists():
            return 'Diploma'
       
        # Check HSC for diploma equivalent
        hsc_entry = educations.filter(qualification_level='HSC').first()
        if hsc_entry and hsc_entry.post_10th_study == 'Diploma':
            return 'Diploma'
       
        return None
 
 
class JobSeekerProfileWriteSerializer(WritableNestedModelSerializer):

    employment_status = serializers.CharField(required=False)
 
    experiences = WorkExperienceEntrySerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    languages = LanguageKnownSerializer(many=True, required=False)
    certifications = CertificationSerializer(many=True, required=False)
    educations = EducationEntrySerializer(many=True, required=False)
 
    highest_qualification = serializers.CharField(required=False, allow_null=True)
    delete_profile_photo = serializers.BooleanField(write_only=True, required=False, default=False)
 
    class Meta:
        model = JobSeekerProfile
        fields = [
            'employment_status',  # ✅ added
 
            'full_name', 'gender', 'dob', 'marital_status', 'nationality',
            'profile_photo',
            'current_job_title', 'current_company', 'total_experience_years',
            'notice_period', 'current_location', 'preferred_locations',
            'alternate_phone', 'alternate_email', 'full_address',
            'street', 'city', 'state', 'pincode', 'country',
            'resume_file',
            'portfolio_link',
            'current_ctc', 'expected_ctc', 'preferred_job_type',
            'preferred_role_industry', 'ready_to_start_immediately',
            'willing_to_relocate',
            'experiences', 'skills', 'languages', 'certifications', 'educations',
            'delete_profile_photo',
            'highest_qualification'
        ]
 
    # =====================================================
    # VALIDATION (UNCHANGED)
    # =====================================================
    def validate(self, attrs):
        experiences = attrs.get("experiences", [])
 
        is_fresher = False
        is_experienced = False
 
        for exp in experiences:
            status = exp.get("current_status")
            if status == "Fresher":
                is_fresher = True
            elif status == "Experienced":
                is_experienced = True
 
        if is_fresher:
            errors = {}
 
            if attrs.get("current_company"):
                errors["current_company"] = "Not allowed for Freshers."
            if attrs.get("current_job_title"):
                errors["current_job_title"] = "Not allowed for Freshers."
            if attrs.get("notice_period"):
                errors["notice_period"] = "Not allowed for Freshers."
            if attrs.get("total_experience_years") not in [None, ""]:
                errors["total_experience_years"] = "Not allowed for Freshers."
 
            if errors:
                raise serializers.ValidationError(errors)
 
        if is_experienced:
            errors = {}
 
            if not attrs.get("current_company"):
                errors["current_company"] = "Required for Experienced users."
            if not attrs.get("current_job_title"):
                errors["current_job_title"] = "Required for Experienced users."
            if not attrs.get("notice_period"):
                errors["notice_period"] = "Required for Experienced users."
            if attrs.get("total_experience_years") in [None, ""]:
                errors["total_experience_years"] = "Required for Experienced users."
 
            if errors:
                raise serializers.ValidationError(errors)
 
        current_jobs = [exp for exp in experiences if exp.get("currently_working")]
        if len(current_jobs) > 1:
            raise serializers.ValidationError({
                "experiences": "Only one experience can be marked as currently working."
            })
 
        return attrs
 
    # =====================================================
    # UPDATE (UNCHANGED)
    # =====================================================
    def update(self, instance, validated_data):
        print("\n" + "="*60)
        print("SERIALIZER UPDATE METHOD")
        print("="*60)
 
        highest_qual = validated_data.pop('highest_qualification', None)
 
        delete_photo = validated_data.pop('delete_profile_photo', False)
 
        if delete_photo and instance.profile_photo:
            try:
                instance.profile_photo.delete(save=False)
            except Exception as e:
                print(f"Error deleting file: {e}")
            instance.profile_photo = None
 
        skills_data = validated_data.pop('skills', None)
        languages_data = validated_data.pop('languages', None)
        certifications_data = validated_data.pop('certifications', None)
        educations_data = validated_data.pop('educations', None)
        experiences_data = validated_data.pop('experiences', None)
 
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
 
        if educations_data is not None:
            instance.educations.all().delete()
            for edu in educations_data:
                EducationEntry.objects.create(profile=instance, **edu)
 
        if skills_data is not None:
            instance.skills.all().delete()
            for skill in skills_data:
                if skill.get("name"):
                    Skill.objects.create(profile=instance, name=skill["name"].strip())
 
        if languages_data is not None:
            instance.languages.all().delete()
            for lang in languages_data:
                if lang.get("name"):
                    LanguageKnown.objects.create(
                        profile=instance,
                        name=lang["name"].strip(),
                        proficiency=lang.get("proficiency")
                    )
 
        if certifications_data is not None:
            instance.certifications.all().delete()
            for cert in certifications_data:
                Certification.objects.create(profile=instance, **cert)
 
        if experiences_data is not None:
            instance.experiences.all().delete()
            for exp in experiences_data:
                WorkExperienceEntry.objects.create(profile=instance, **exp)
 
        print("\nUPDATE COMPLETED")
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
 
 
# REMOVED: CompanySerializer - Using CompanyProfileSerializer instead

class CompanyProfileSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField(read_only=True)
    logo_absolute_url = serializers.SerializerMethodField(read_only=True)
 
    class Meta:
        model = CompanyProfile
        fields = [
            'id',
            'company_name',
            'company_moto',
            'contact_person',
            'contact_number',
            'company_email',
            'website',
            'company_size',
            'address1',
            'address2',
            'about',
            'company_logo',
            'logo_url',
            'logo_absolute_url',
            'created_at',
            'created_by'
        ]
        read_only_fields = ['created_at', 'created_by']  # ✅ created_by is read-only
 
    def get_logo_url(self, obj):
        return obj.company_logo.url if obj.company_logo else None
    def get_logo_absolute_url(self, obj):
        request = self.context.get('request')
        if obj.company_logo and request:
            return request.build_absolute_uri(obj.company_logo.url)
        return None
    

# EmployerProfile Serializers
class EmployerProfileReadSerializer(serializers.ModelSerializer):
    user = UserReadSerializer(read_only=True)
    company = CompanyProfileSerializer(read_only=True)  # Changed from CompanySerializer to CompanyProfileSerializer
 
    class Meta:
        model = EmployerProfile
        fields = ['id', 'user', 'full_name', 'employee_id', 'company', 'created_at', 'updated_at']
 
 
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
        # CompanyProfile doesn't have is_active field, so we skip that validation
        # Add any validation needed for CompanyProfile
        if value:
            # You can add custom validation here if needed
            pass
        return value
 
 
# PostAJob Serializer

class PostAJobSerializer(serializers.ModelSerializer):

    company = serializers.SerializerMethodField()

    posted_date = serializers.DateTimeField(source='created_at', read_only=True)

    applicants_count = serializers.SerializerMethodField()
 
    class Meta:

        model = PostAJob

        fields = [

            'id',

            'job_title',

            'industry_type',

            'department',

            'work_type',

            'shift',

            'work_duration',

            'salary',

            'experience',

            'location',

            'openings',

            'job_category',

            'education',

            'key_skills',

            'job_highlights',

            'job_description',

            'responsibilities',

            'job_status',

            'is_published',

            'posted_date',

            'employer',

            'company',

            'applicants_count',

            'is_highlighted',
            'highlighted_at'

        ]

        read_only_fields = [

            'id',

            'is_published',

            'posted_date',

            'employer'

        ]
 
    def get_company(self, obj):

        if obj.employer and hasattr(obj.employer, 'employer_profile'):

            if obj.employer.employer_profile.company:

                # Pass the context to CompanyProfileSerializer

                return CompanyProfileSerializer(

                    obj.employer.employer_profile.company,

                    context=self.context  # This is the key fix

                ).data

        return None
 
    def validate(self, data):

        is_partial = self.context.get('partial', False)
 
        if not is_partial:

            required_fields = [

                'job_title',

                'work_type',

                'shift',

                'work_duration',

                'salary',

                'experience',

                'location',

                'openings',

                'job_description'

            ]
 
            for field in required_fields:

                if not data.get(field):

                    raise serializers.ValidationError({

                        field: f"{field} is required."

                    })
 
        if 'job_status' in data and data['job_status']:

            valid_statuses = [

                'Hiring in Progress',

                'Reviewing Application',

                'Hiring Done'

            ]

            if data['job_status'] not in valid_statuses:

                raise serializers.ValidationError({

                    'job_status': f"Invalid status. Choose from: {', '.join(valid_statuses)}"

                })
 
        array_fields = [

            'industry_type',

            'department',

            'education',

            'key_skills',

            'job_highlights',

            'responsibilities',

            'location'

        ]
 
        for field in array_fields:

            if field in data and data[field] is not None:

                if not isinstance(data[field], list):

                    raise serializers.ValidationError({

                        field: f"{field} must be a list."

                    })
 
        return data
 
    def create(self, validated_data):

        if 'job_status' not in validated_data:

            validated_data['job_status'] = 'Reviewing Application'
 
        array_fields = [

            'industry_type',

            'department',

            'education',

            'key_skills',

            'job_highlights',

            'responsibilities',

            'location'

        ]
 
        for field in array_fields:

            if field in validated_data and validated_data[field]:

                validated_data[field] = [

                    item for item in validated_data[field]

                    if item and str(item).strip()

                ]
 
        return super().create(validated_data)
 
    def update(self, instance, validated_data):

        for attr, value in validated_data.items():

            if value is not None:

                setattr(instance, attr, value)
 
        instance.save()

        return instance
    
    def get_applicants_count(self, obj):

        return JobApplication.objects.filter(job=obj).count()


# Job Read Serializer (for PostAJob)

class JobReadSerializer(serializers.ModelSerializer):

    company = serializers.SerializerMethodField()

    posted_by = serializers.CharField(source='employer.email', read_only=True, default='Company Jobs')

    applicants_count = serializers.SerializerMethodField()

    class Meta:

        model = PostAJob

        fields = "__all__"

    def get_company(self, obj):

        if obj.employer and hasattr(obj.employer, 'employer_profile'):

            if obj.employer.employer_profile.company:

                # Pass the context to CompanyProfileSerializer

                return CompanyProfileSerializer(

                    obj.employer.employer_profile.company,

                    context=self.context  # This is the key fix

                ).data

        return None

    def get_applicants_count(self, obj):

        return JobApplication.objects.filter(job=obj).count()


# Job Write Serializer

class JobWriteSerializer(serializers.ModelSerializer):

    company = serializers.SerializerMethodField()

    posted_by = serializers.CharField(source='employer.email', read_only=True)

    class Meta:

        model = PostAJob

        fields = [

            'id', 'job_title', 'company', 'location',

            'work_type', 'salary', 'job_description', 

            'responsibilities', 'job_highlights', 'key_skills',

            'education', 'shift', 'work_duration',

            'openings', 'experience', 'created_at', 'posted_by',

            'is_published', 'job_status'

        ]

        read_only_fields = ['id', 'company', 'created_at', 'posted_by', 'is_published']

    def get_company(self, obj):

        if obj.employer and hasattr(obj.employer, 'employer_profile'):

            if obj.employer.employer_profile.company:

                # Pass the context to CompanyProfileSerializer

                return CompanyProfileSerializer(

                    obj.employer.employer_profile.company,

                    context=self.context  # This is the key fix

                ).data

        return None

    def validate(self, data):

        user = self.context['request'].user

        if not hasattr(user, 'employer_profile'):

            raise serializers.ValidationError("Only employers can create/update jobs.")

        employer_profile = user.employer_profile

        if not employer_profile.company:

            raise serializers.ValidationError(

                "You must create or link a company in your profile before posting jobs."

            )

        try:

            verification = CompanyVerification.objects.get(employer=user)

        except CompanyVerification.DoesNotExist:

            raise serializers.ValidationError(

                "Please verify your company first before posting jobs."

            )

        if verification.status != "approved":

            raise serializers.ValidationError(

                "Your company verification is not approved by admin yet."

            )

        title = data.get('job_title')

        if title and PostAJob.objects.filter(

            employer=user,

            job_title__iexact=title

        ).exists():

            raise serializers.ValidationError({

                "job_title": f"A job with title '{title}' already exists for this company."

            })

        return data

    def create(self, validated_data):

        user = self.context['request'].user

        validated_data['employer'] = user

        validated_data['is_published'] = False

        return super().create(validated_data)


# Job Update Serializer

class JobUpdateSerializer(serializers.ModelSerializer):

    company = serializers.SerializerMethodField()

    posted_by = serializers.CharField(source='employer.email', read_only=True)

    class Meta:

        model = PostAJob

        fields = "__all__"

        read_only_fields = ['id', 'company', 'created_at', 'posted_by', 'employer']

    def get_company(self, obj):

        if obj.employer and hasattr(obj.employer, 'employer_profile'):

            if obj.employer.employer_profile.company:

                # Pass the context to CompanyProfileSerializer

                return CompanyProfileSerializer(

                    obj.employer.employer_profile.company,

                    context=self.context  # This is the key fix

                ).data

        return None

    def validate(self, data):

        user = self.context['request'].user

        if not hasattr(user, 'employer_profile'):

            raise serializers.ValidationError("Only employers can update jobs.")

        title = data.get('job_title')

        if title:

            instance = self.instance

            if PostAJob.objects.filter(

                employer=user,

                job_title__iexact=title

            ).exclude(id=instance.id).exists():

                raise serializers.ValidationError(

                    {"job_title": f"A job with title '{title}' already exists for this company."}

                )

        return data
 
 
 
# JobApplication & SavedJob
class JobApplicationWriteSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)
    job = serializers.PrimaryKeyRelatedField(
        queryset=PostAJob.objects.filter(is_published=True)
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
                "You already have an active application for this job."
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
 
 
class SavedJobSerializer(serializers.ModelSerializer):
    job = JobReadSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=PostAJob.objects.all(),
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
        fields = ['id', 'user', 'message', 'created_at', 'is_read', 'notification_type', 'related_object_id']
        read_only_fields = ['id', 'created_at']
 
 
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
                    "Only employers can start new conversations."
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
 
 
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = "__all__"
 
 
class HelpTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpTopic
        fields = ['id', 'title', 'path']
 
 
class RaiseTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = RaiseTicket
        fields = '__all__'
 
 
# Password Serializers
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
 
 
# Contact Us Serializer
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'    
 
 
# CompanyVerify Serializer
class CompanyVerificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyVerification
        fields = "__all__"
        read_only_fields = ['status', 'employer', 'created_at']
 
    def validate(self, data):
        registration_number = data.get("registration_number")
        tax_id = data.get("tax_id")
        legal_name = data.get("legal_name")
        
        # Safely get employer from context
        employer = None
        if hasattr(self, 'context') and 'request' in self.context:
            employer = self.context['request'].user
 
        # Check if this employer already has a verification
        if employer and CompanyVerification.objects.filter(employer=employer).exists():
            raise serializers.ValidationError(
                "You have already submitted a verification request."
            )
        
        # Only check for existing verifications with same details if they are approved
        # This allows multiple pending verifications for the same company from different employers
        existing_reg = CompanyVerification.objects.filter(
            registration_number=registration_number,
            status='approved'
        ).exists()
        
        existing_tax = CompanyVerification.objects.filter(
            tax_id=tax_id,
            status='approved'
        ).exists()
        
        # Allow verification submission even if company exists
        # The save() method will handle linking to existing company
        
        return data
 
 
# OTP Serializer
class VerifyEmailOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
 
 
# REMOVED: Duplicate CompanyProfileSerializer (now defined above)
 
 
# Report a Job Serializer
class ComplaintSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
 
    class Meta:
        model = Complaint
        fields = [
            'id',
            'firstName',
            'lastName',
            'mobile',
            'email',
            'reason',
            'explanation',
            'status',
            'created_at'
        ]
        read_only_fields = ['status', 'created_at']
 
    def validate_mobile(self, value):
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Enter valid 10-digit mobile number")
        return value
 
    def validate(self, data):
        user = self.context['request'].user
 
        if Complaint.objects.filter(user=user, reason=data.get('reason')).exists():
            raise serializers.ValidationError("You already submitted this complaint")
 
        return data
    
# Billing Serializer

class PlanSerializer(serializers.ModelSerializer):
    pricing = serializers.SerializerMethodField()
   
    class Meta:
        model = Plan
        fields = ['id', 'name', 'monthly_price', 'duration_days', 'pricing']
   
    def get_pricing(self, obj):
        # Get duration from request if provided
        request = self.context.get('request')
        duration = request.query_params.get('duration', None) if request else None
       
        if duration and duration in ['monthly', '6_months', 'yearly']:
            return obj.get_price_for_duration(duration)
        else:
            return obj.get_all_pricing()
 
 
 
class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer()
    class Meta:
        model = Subscription
        fields = "__all__"
 
 
class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
 
 
class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'method_type', 'card_last4', 'card_holder_name',
                  'expiry_date', 'upi_id', 'bank_name', 'is_default']
        read_only_fields = ['user']
        extra_kwargs = {
            'method_type': {'required': False},
            'card_last4': {'required': False},
            'card_holder_name': {'required': False},
            'expiry_date': {'required': False},
            'upi_id': {'required': False},
            'bank_name': {'required': False},
        }
   
    def validate(self, data):
        # Only validate for create operations
        if self.instance is None:
            method_type = data.get('method_type')
           
            if method_type == 'card':
                if not data.get('card_last4'):
                    raise serializers.ValidationError({
                        'card_last4': 'Card last 4 digits are required for card payments'
                    })
                if not data.get('card_holder_name'):
                    raise serializers.ValidationError({
                        'card_holder_name': 'Card holder name is required for card payments'
                    })
                if not data.get('expiry_date'):
                    raise serializers.ValidationError({
                        'expiry_date': 'Expiry date is required for card payments'
                    })
                import re
                if not re.match(r'^(0[1-9]|1[0-2])/(\d{2})$', data.get('expiry_date')):
                    raise serializers.ValidationError({
                        'expiry_date': 'Expiry date must be in MM/YY format'
                    })
                   
            elif method_type == 'upi':
                if not data.get('upi_id'):
                    raise serializers.ValidationError({
                        'upi_id': 'UPI ID is required for UPI payments'
                    })
                if '@' not in data.get('upi_id'):
                    raise serializers.ValidationError({
                        'upi_id': 'Please enter a valid UPI ID'
                    })
                   
            elif method_type == 'netbanking':
                if not data.get('bank_name'):
                    raise serializers.ValidationError({
                        'bank_name': 'Bank name is required for net banking'
                    })
       
        return data
   
    def create(self, validated_data):
        # User is already passed from the view, don't try to get from context
        # If this is the first payment method, make it default
        if not PaymentMethod.objects.filter(user=validated_data['user']).exists():
            validated_data['is_default'] = True
           
        return super().create(validated_data)
   
    def update(self, instance, validated_data):
        is_default = validated_data.get('is_default')
       
        if is_default and not instance.is_default:
            # Set all other payment methods to non-default
            PaymentMethod.objects.filter(user=instance.user).exclude(id=instance.id).update(is_default=False)
           
        return super().update(instance, validated_data)
    

class AdminCompanySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    user = serializers.CharField(source='employer.username')
    date = serializers.SerializerMethodField()
    certificate = serializers.SerializerMethodField()
    verification = serializers.CharField(source='get_status_display')
 
    class Meta:
        model = CompanyVerification
        fields = ['id', 'name', 'user', 'date', 'certificate', 'verification']
 
    def get_date(self, obj):
        return obj.created_at.strftime("%d %B %Y")
 
    def get_certificate(self, obj):
        return "Yes" if obj.incorporation_certificate else "No"
 
    def get_name(self, obj):
        return obj.legal_name



#UserManagement Serializers


 
class UserListSerializer(serializers.ModelSerializer):
   
    role = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    contact = serializers.SerializerMethodField()
    joinDate = serializers.SerializerMethodField()
 
    class Meta:
        model = User
        fields = ['id', 'role', 'status', 'joinDate', 'profile', 'contact']
 
    def get_role(self, obj):
        if obj.user_type == User.UserType.EMPLOYER:
            return "employer"
        return "candidate"  
 
    def get_profile(self, obj):
        full_name = ""
 
        if obj.user_type == User.UserType.JOBSEEKER:
            try:
                full_name = obj.jobseeker_profile.full_name
            except JobSeekerProfile.DoesNotExist:
                full_name = obj.username
 
        elif obj.user_type == User.UserType.EMPLOYER:
            try:
                full_name = obj.employer_profile.full_name
            except EmployerProfile.DoesNotExist:
                full_name = obj.username
 
        elif obj.user_type == User.UserType.ADMIN:
            full_name = obj.get_full_name() or obj.username
 
        return {"fullName": full_name}
 
    def get_contact(self, obj):
        '''#city = ""
        if obj.user_type == User.UserType.JOBSEEKER:
            try:
                city = obj.jobseeker_profile.city
            except JobSeekerProfile.DoesNotExist:
                pass'''
        return {
            "email": obj.email,
            #"city": city
        }
 
    def get_joinDate(self, obj):
        if obj.date_joined:
            return obj.date_joined.strftime("%b %d, %Y")  # e.g., "Jan 10, 2024"
        return None
 
 
class UserStatusUpdateSerializer(serializers.ModelSerializer):
 
    STATUS_TRANSITIONS = {
        "Active": ["Hold", "Deactivated"],
        "Hold": ["Active", "Deactivated"],
        "Deactivated": ["Active", "Hold"],
    }
 
    class Meta:
        model = User
        fields = ['status']
 
    def validate_status(self, value):
        user = self.instance
 
       
        valid_choices = [c[0] for c in User.AccountStatus.choices]
        if value not in valid_choices:
            raise serializers.ValidationError("Invalid status")
 
        # 🔹 transition check
        allowed_transitions = self.STATUS_TRANSITIONS.get(user.status, [])
 
        if value not in allowed_transitions:
            raise serializers.ValidationError(
                f"Cannot change from {user.status} to {value}. "
                f"Allowed: {', '.join(allowed_transitions)}"
            )
 
        return value
    

serializers
from rest_framework import serializers
from .models import AJob, ACompany, AEmployer, AJobSeeker
 
class AJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AJob
        fields = '__all__'
 
 
class ACompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = ACompany
        fields = '__all__'
 
 
class AEmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AEmployer
        fields = '__all__'
 
 
class AJobSeekerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AJobSeeker
        fields = '__all__'


class AdminJobSerializer(serializers.ModelSerializer):
    company_name = serializers.SerializerMethodField()
    employer_email = serializers.EmailField(source='employer.email')
    employer_username = serializers.CharField(source='employer.username')
    applicants_count = serializers.SerializerMethodField()
    company_verification_status = serializers.SerializerMethodField()
    formatted_created_at = serializers.SerializerMethodField()
   
    class Meta:
        model = PostAJob
        fields = [
            'id', 'job_title', 'company_name', 'job_status', 'is_published',
            'flagged', 'created_at', 'formatted_created_at', 'location',
            'experience', 'salary', 'work_type', 'openings', 'key_skills',
            'applicants_count', 'employer_email', 'employer_username',
            'company_verification_status', 'job_description'
        ]
   
    def get_company_name(self, obj):
        if obj.employer and hasattr(obj.employer, 'employer_profile'):
            if obj.employer.employer_profile.company:
                return obj.employer.employer_profile.company.company_name
        return 'N/A'
   
    def get_applicants_count(self, obj):
        return obj.applications.count()
   
    def get_company_verification_status(self, obj):
        if hasattr(obj.employer, 'company_verification'):
            return obj.employer.company_verification.status
        return None
   
    def get_formatted_created_at(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')        


from .models import Role, Module, Permission


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'name']


class PermissionSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='module.name', read_only=True)

    class Meta:
        model = Permission
        fields = ['id', 'module', 'module_name', 'read', 'create', 'update', 'delete']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    # Live count from User table — computed, not stored
    # 'Candidate' role  → jobseeker users
    # 'Employer' role   → employer users
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'user_count', 'permissions']

    def get_user_count(self, obj):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        name_lower = obj.name.lower()

        if name_lower == 'candidate':
            return User.objects.filter(user_type='jobseeker').count()
        elif name_lower == 'employer':
            return User.objects.filter(user_type='employer').count()
        else:
            # For any other custom roles return 0 for now
            return 0


class EmployerRoleSerializer(serializers.ModelSerializer):
    """
    Serializer for the employer list inside RoleManagement.
    Reads from real User + EmployerProfile + CompanyProfile + Subscription.
    """
    company     = serializers.SerializerMethodField()
    recruiter   = serializers.SerializerMethodField()
    status      = serializers.SerializerMethodField()  # SUBSCRIBER / NON SUBSCRIBER
    joined_date = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'company', 'recruiter', 'status', 'joined_date']

    def get_company(self, obj):
        try:
            return obj.employer_profile.company.company_name if obj.employer_profile.company else '—'
        except Exception:
            return '—'

    def get_recruiter(self, obj):
        try:
            name = obj.employer_profile.full_name
            return name.upper() if name else obj.email.upper()
        except Exception:
            return obj.email.upper()

    def get_status(self, obj):
        from .models import Subscription
        from django.utils import timezone

        has_active_sub = Subscription.objects.filter(
            user=obj,
            status='active',
            end_date__gte=timezone.now()
        ).exists()

        return 'SUBSCRIBER' if has_active_sub else 'NON SUBSCRIBER'

    def get_joined_date(self, obj):
        return obj.date_joined.strftime('%b %d, %Y') if obj.date_joined else '—'