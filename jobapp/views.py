from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.db.models import Q, Count
from datetime import timedelta
import random

from .serializers import (
    JobSeekerRegistrationSerializer,
    EmployerRegistrationSerializer,
    JobSeekerProfileReadSerializer,
    JobSeekerProfileWriteSerializer,
    EmployerProfileReadSerializer,
    EmployerProfileWriteSerializer,
    UserReadSerializer,
    JobApplicationDetailSerializer,
    NotificationSerializer,
    CustomTokenObtainPairSerializer,
    ContactMessageSerializer,
    # REMOVED: CompanySerializer
    PostAJobSerializer,
    JobReadSerializer,
    JobWriteSerializer,
    JobUpdateSerializer,
    JobApplicationWriteSerializer,
    JobApplicationEmployerSerializer,
    JobApplicationListSerializer,
    SavedJobSerializer,
    UserSettingsSerializer,
    ConversationSerializer,
    MessageSerializer,
    SendMessageSerializer,
    ChatUserSerializer,
    ChatMessageSerializer,
    HelpTopicSerializer,
    RaiseTicketSerializer,
    ForgotPasswordSerializer,
    ResetPasswordConfirmSerializer,
    CreatePasswordSerializer,
    NewsletterSubscriberSerializer,
    CompanyVerificationSerializer,
    CompanyProfileSerializer,
    ComplaintSerializer,
    VerifyEmailOTPSerializer,
    PlanSerializer,
    SubscriptionSerializer,
    InvoiceSerializer,
    PaymentMethodSerializer,
    AdminCompanySerializer,

)

from .models import (
    User, JobSeekerProfile, EmployerProfile, PostAJob, 
    JobApplication, SavedJob, Notification, UserSettings,
    Conversation, Message, ChatMessage, HelpTopic, RaiseTicket,
    PasswordResetToken, EmailOTP, NewsletterSubscriber,
    CompanyVerification, CompanyProfile, Complaint, Plan, Subscription,
    Invoice, PaymentMethod,CompanyEmailOTP,
)
from .permissions import IsAdminOrEmployer, IsEmployerOrAdmin, IsJobSeeker, IsAdminUserType
from .utils import generate_otp, generate_4digit_otp, send_email_otp, generate_token, send_password_reset_email,generate_company_otp, send_company_email_otp

User = get_user_model()


# ============ REGISTRATION VIEWS ============

class JobSeekerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        email_verified = EmailOTP.objects.filter(
            email=email,
            purpose="email_verification",
            is_verified=True
        ).exists()

        if not email_verified:
            return Response({"error": "Please verify your email first"}, status=400)

        serializer = JobSeekerRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.save()

            return Response({
                "message": "User registered successfully"
            }, status=201)
        else:
            return Response(serializer.errors, status=400)
 

class EmployerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(f"Registration data received: {request.data}")
        
        email = request.data.get("email")
        
        email_verified = EmailOTP.objects.filter(
            email=email,
            purpose="email_verification",
            is_verified=True
        ).exists()
        
        if not email_verified:
            return Response(
                {"error": "Please verify your email first"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = EmployerRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.save()

            print(f"User created: {user.email}, Type: {user.user_type}")

            return Response({
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "user_type": user.user_type,
                    "phone": user.phone
                }
            }, status=status.HTTP_201_CREATED)

        print(f"Registration errors: {serializer.errors}")

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ AUTHENTICATION VIEWS ============

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
 

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                raise ValidationError("Refresh token is required.")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
 

# ============ PROFILE VIEWS ============

class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobSeekerProfileReadSerializer
        return JobSeekerProfileWriteSerializer

    def get_object(self):
        profile, created = JobSeekerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile

    def update(self, request, *args, **kwargs):
        print("\n" + "="*80)
        print("🚀 JOBSEEKER PROFILE UPDATE - START")
        print("="*80)

        print(f"📌 User: {request.user.email} (ID: {request.user.id})")
        print(f"📌 Method: {request.method}")
        print(f"📌 Content-Type: {request.headers.get('Content-Type', 'Not specified')}")

        content_type = request.headers.get('Content-Type', '')

        if 'multipart/form-data' in content_type and 'data' in request.data:
            try:
                import json
                json_data = json.loads(request.data.get('data'))
                print("\n📦 Parsed JSON data from 'data' field:")
                print(json.dumps(json_data, indent=2, default=str)[:1000])

                combined_data = {}

                # Add all JSON data
                for key, value in json_data.items():
                    combined_data[key] = value

                # IMPORTANT: Check for delete_profile_photo flag in FormData
                if 'delete_profile_photo' in request.data:
                    combined_data['delete_profile_photo'] = request.data.get('delete_profile_photo') == 'true'
                    print(f"📸 Found delete_profile_photo flag: {combined_data['delete_profile_photo']}")

                # Add file data
                for key, value in request.data.items():
                    if key != 'data':
                        combined_data[key] = value
                
                # Process certifications
                certifications_list = []
                
                # First, get certifications from JSON data
                if 'certifications' in json_data:
                    certifications_list = json_data['certifications']
                
                # Then, check for files in FormData and merge with existing IDs
                cert_index = 0
                while f'certifications[{cert_index}][name]' in request.data:
                    cert_name = request.data.get(f'certifications[{cert_index}][name]')
                    cert_id = request.data.get(f'certifications[{cert_index}][id]')
                    cert_file = request.FILES.get(f'certifications[{cert_index}][certificate_file]')
                    
                    if cert_index < len(certifications_list):
                        if cert_id:
                            certifications_list[cert_index]['id'] = int(cert_id)
                        certifications_list[cert_index]['name'] = cert_name
                        if cert_file:
                            certifications_list[cert_index]['certificate_file'] = cert_file
                    else:
                        cert_dict = {'name': cert_name}
                        if cert_id:
                            cert_dict['id'] = int(cert_id)
                        if cert_file:
                            cert_dict['certificate_file'] = cert_file
                        certifications_list.append(cert_dict)
                    
                    cert_index += 1
                
                if certifications_list:
                    print("FINAL certifications_list:", certifications_list)
                    combined_data['certifications'] = certifications_list
                    print(f"\n📦 Processed {len(certifications_list)} certifications")
                    for i, cert in enumerate(certifications_list):
                        print(f"   Cert {i}: ID={cert.get('id')}, Name={cert.get('name')}, HasFile={bool(cert.get('certificate_file'))}")

                # Replace request.data with our combined data
                request._full_data = combined_data

            except Exception as e:
                print(f"Error parsing JSON data: {e}")
                import traceback
                traceback.print_exc()

        print("\n" + "="*80)
        print("🚀 CALLING SUPER().UPDATE()")
        print("="*80 + "\n")

        return super().update(request, *args, **kwargs)

class JobSeekerListView(generics.ListAPIView):
    queryset = JobSeekerProfile.objects.all()
    serializer_class = JobSeekerProfileReadSerializer
    permission_classes = [IsAdminOrEmployer]
   

class EmployerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
 
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EmployerProfileReadSerializer
        return EmployerProfileWriteSerializer
 
    def get_object(self):
        if not hasattr(self.request.user, 'employer_profile'):
            raise ValidationError("You are not an employer.")
        return self.request.user.employer_profile
   

# ============ COMPANY VIEWS - REMOVED AND REPLACED WITH COMPANYPROFILE ============

# REMOVED: CompanyListView, CompanyDetailView, CompanyCreateView, 
# CompanyLinkView, CompanyEditView, AdminCompanyToggleActiveView

# These have been replaced with CompanyProfile views at the bottom of the file


# ============ JOB VIEWS ============

class JobListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        # ONLY approved + published jobs visible
        return PostAJob.objects.filter(
            is_published=True,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        )
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
 
        search = request.query_params.get("search")
        location = request.query_params.get("location")
        experience = request.query_params.get("experience")
        company_id = request.query_params.get("company")
 
        # Company filter (safe)
        if company_id:
            queryset = queryset.filter(
                employer__employer_profile__company_id=company_id
            )
 
        # Search
        if search:
            queryset = queryset.filter(job_title__icontains=search)
 
        # location is JSONField → icontains may not work properly
        if location:
            queryset = queryset.filter(location__icontains=location)
 
        # Experience filter
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
        
        queryset = queryset.order_by(
            '-is_highlighted',
            '-highlighted_at',
            '-created_at'
        )
 
        serializer = self.get_serializer(queryset, many=True)
 
        return Response({
            "total_jobs": queryset.count(),
            "jobs": serializer.data
        })
 

class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PostAJobSerializer
    queryset = PostAJob.objects.filter(is_published=True)
 

class JobCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'employer_profile'):
            raise PermissionDenied("Only employers can post jobs.")
        employer_profile = self.request.user.employer_profile
        if not employer_profile.company:
            raise PermissionDenied("You must link a company before posting jobs.")
        serializer.save(employer=self.request.user, is_published=False)
 

class JobUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class JobDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class JobToggleActiveView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostAJobSerializer
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 
    def perform_update(self, serializer):
        job = serializer.instance
        job.is_published = not job.is_published
        job.save()
        serializer.save()
 

# ============ POST A JOB VIEWS ============

class CreateJobPreviewView(generics.CreateAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def create(self, request, *args, **kwargs):
        print("=" * 50)
        print("Received job data:", request.data)
        print("=" * 50)
        return super().create(request, *args, **kwargs)
 
    def perform_create(self, serializer):
        user = self.request.user
 
        if user.user_type != "employer":
            raise PermissionDenied("Only employers can post jobs")
 
        if not hasattr(user, "employer_profile"):
            raise PermissionDenied("Employer profile not found")
 
        employer_profile = user.employer_profile
 
        if not employer_profile.company:
            raise PermissionDenied("You must link a company first")
 
        verification = CompanyVerification.objects.filter(
            employer=user,
            status="Verified"
        ).exists()
 
        if not verification:
            raise PermissionDenied("Company must be verified before posting jobs")
        
        is_highlighted = self.request.data.get('is_highlighted', False)
        # Convert string to boolean
        if isinstance(is_highlighted, str):
            is_highlighted = is_highlighted.lower() == 'true'
        # =============================
        # PLAN-BASED HIGHLIGHT LIMIT
        # =============================
        if is_highlighted:
            # Active subscription
            subscription = Subscription.objects.filter(
                # employer=user,
                user=user,
                status='active'
            ).select_related('plan').first()
            # No active plan
            if not subscription:
                raise ValidationError({
                    "error": "You need an active subscription plan to use highlighted jobs"
                })
            total_limit = subscription.plan.highlight_limit
            # Count already used highlighted jobs
            used_highlights = PostAJob.objects.filter(
                employer=user,
                is_highlighted=True
            ).count()
            # Limit exceeded
            if used_highlights >= total_limit:
                raise ValidationError({
                    "error": f"Highlight limit reached. Your current plan allows only {total_limit} highlighted jobs."
                })
 
        # MAIN LOGIC (IMPORTANT)
        job = serializer.save(
            employer=user,
            is_published=False,
            approval_status=PostAJob.ApprovalStatus.PENDING,
            is_highlighted=is_highlighted,
            highlighted_at=timezone.now() if is_highlighted else None
        )
 
        # OPTIONAL: Notify Admin (if you have admin users)
        admins = User.objects.filter(user_type="admin")
 
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"New job '{job.job_title}' submitted for approval by {user.email}",
                notification_type="job_pending",
                job=job
            )
 
    def handle_exception(self, exc):
        print(f"Exception occurred: {exc}")
        return super().handle_exception(exc)
 

class PreviewJobView(generics.RetrieveAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class PublishJobView(APIView):
    permission_classes = [IsAuthenticated]
 
    def patch(self, request, pk):
        if request.user.user_type != "employer":
            raise PermissionDenied("Only employers can submit jobs")
 
        job = get_object_or_404(
            PostAJob,
            id=pk,
            employer=request.user
        )
 
        # Prevent re-submitting approved job
        if job.approval_status == PostAJob.ApprovalStatus.APPROVED:
            return Response({
                "message": "Job already approved and live"
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # MAIN LOGIC (IMPORTANT)
        job.approval_status = PostAJob.ApprovalStatus.PENDING
        job.is_published = False
        job.save()
 
        # Notify Admins
        admins = User.objects.filter(user_type="admin")
 
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"Job '{job.job_title}' submitted for approval by {request.user.email}",
                notification_type="job_pending",
                job=job
            )
 
        return Response({
            "message": "Job submitted for admin approval",
            "job_id": job.id,
            "job_title": job.job_title,
            "status": "pending"
        }, status=status.HTTP_200_OK)
 

class UpdateJobView(generics.UpdateAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
   
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['partial'] = True
        return context
   
    def patch(self, request, *args, **kwargs):
        print("=" * 50)
        print("PATCH request received for job update")
        print("Request data:", request.data)
        print("=" * 50)
        return super().patch(request, *args, **kwargs)
 

class DeleteJobView(generics.DestroyAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(employer=self.request.user)
 

class PostedJobListView(generics.ListAPIView):
    queryset = PostAJob.objects.filter(is_published=True)
    serializer_class = PostAJobSerializer
 

class EmployerJobListView(generics.ListAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        queryset = PostAJob.objects.filter(
            employer=self.request.user
        ).order_by('-created_at')
 
        # Optional filter by status
        status_filter = self.request.query_params.get("status")  # pending/approved/rejected
 
        if status_filter:
            queryset = queryset.filter(approval_status=status_filter)
 
        return queryset
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
 
        serializer = self.get_serializer(queryset, many=True)
 
        # Dashboard-style stats
        total = PostAJob.objects.filter(employer=request.user).count()
        pending = PostAJob.objects.filter(
            employer=request.user,
            approval_status=PostAJob.ApprovalStatus.PENDING
        ).count()
        approved = PostAJob.objects.filter(
            employer=request.user,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        ).count()
        rejected = PostAJob.objects.filter(
            employer=request.user,
            approval_status=PostAJob.ApprovalStatus.REJECTED
        ).count()
 
        return Response({
            "stats": {
                "total_jobs": total,
                "pending_jobs": pending,
                "approved_jobs": approved,
                "rejected_jobs": rejected,
            },
            "jobs": serializer.data
        })

class JobSeekerJobListView(generics.ListAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return PostAJob.objects.filter(
            is_published=True,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        ).order_by(
            '-is_highlighted',
            '-highlighted_at',
            '-created_at'
        )
 
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
 
        # 🔍 Optional filters
        search = request.query_params.get("search")
        location = request.query_params.get("location")
        experience = request.query_params.get("experience")
 
        if search:
            queryset = queryset.filter(job_title__icontains=search)
 
        if location:
            queryset = queryset.filter(location__icontains=location)
 
        if experience:
            queryset = queryset.filter(experience__icontains=experience)
 
        serializer = self.get_serializer(queryset, many=True)
 
        return Response({
            "total_jobs": queryset.count(),
            "jobs": serializer.data
        })
    
class JobSeekerJobDetailView(generics.RetrieveAPIView):
    serializer_class = PostAJobSerializer
    permission_classes = [IsAuthenticated]
   
    def get_queryset(self):
        # ONLY approved + published jobs accessible
        return PostAJob.objects.filter(
            is_published=True,
            approval_status=PostAJob.ApprovalStatus.APPROVED
        )

# ============ JOB APPLICATION & SAVED JOBS ============

class ApplyJobView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationWriteSerializer
    parser_classes = [MultiPartParser, FormParser]
 
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
 
        if not serializer.is_valid():
            print("❌ JOB APPLY VALIDATION ERROR:", serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
 
        instance = serializer.save()
 
        job = instance.job
        if job.employer and hasattr(job.employer, 'employer_profile'):
            Notification.objects.create(
                user=job.employer,
                message=f"New application received for '{job.job_title}' from {request.user.email}"
            )
 
        detail_serializer = JobApplicationDetailSerializer(instance)
        headers = self.get_success_headers(serializer.data)
       
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
 

class AppliedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationListSerializer
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 

class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        serializer = SavedJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
 
        try:
            serializer.save(user=request.user)
        except IntegrityError:
            raise ValidationError({"detail": "Job already saved"})
 
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
 
    def delete(self, request, job_id):
        deleted, _ = SavedJob.objects.filter(
            user=request.user,
            job_id=job_id
        ).delete()
 
        if deleted == 0:
            return Response(
                {"detail": "Saved job not found"},
                status=status.HTTP_404_NOT_FOUND
            )
 
        return Response(status=status.HTTP_204_NO_CONTENT)
 

class SavedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer
 
    def get_queryset(self):
        return (
            SavedJob.objects
            .filter(user=self.request.user)
            .select_related("job")
            .order_by("-saved_date")
        )
 

class WithdrawApplicationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationDetailSerializer
    queryset = JobApplication.objects.all()
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        application = serializer.instance
        if application.status == JobApplication.Status.WITHDRAWN:
            raise ValidationError("Application is already withdrawn.")
       
        application.status = JobApplication.Status.WITHDRAWN
        application.save()
       
        return Response(JobApplicationDetailSerializer(application).data)
 

class JobApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)
 

# ============ EMPLOYER APPLICATION VIEWS ============

class EmployerApplicationsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer
 
    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
        jobs = PostAJob.objects.filter(employer=user, is_published=True)
        return JobApplication.objects.filter(job__in=jobs)
   

class EmployerApplicationStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer
 
    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
       
        jobs = PostAJob.objects.filter(employer=user)
        return JobApplication.objects.filter(job__in=jobs)
 
    def perform_update(self, serializer):
        application = serializer.instance
        new_status = self.request.data.get('status')
       
        if not new_status:
            raise ValidationError({"status": "This field is required to update status."})
       
        if new_status not in [choice[0] for choice in JobApplication.Status.choices]:
            raise ValidationError({"status": f"Invalid status."})
       
        application.status = new_status
        application.save()
 
        Notification.objects.create(
            user=application.user,
            message=f"Your application for '{application.job.job_title}' has been updated to: {new_status.replace('_', ' ').title()}"
        )
 
        return Response(JobApplicationEmployerSerializer(application).data)
 

# ============ NOTIFICATION VIEWS ============

class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 

class MarkNotificationReadView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        serializer.instance.is_read = True
        serializer.instance.save()
       

class MarkNotificationUnreadView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 
    def perform_update(self, serializer):
        serializer.instance.is_read = False
        serializer.instance.save()
 

class DeleteNotificationView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()
 
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
 

class ClearAllNotificationsView(APIView):
    permission_classes = [IsAuthenticated]
 
    def delete(self, request):
        Notification.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
 

# ============ USER SETTINGS ============

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
 
    def patch(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(
            settings, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
 

# ============ CHAT VIEWS ============

class ConversationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
   
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
   
    def get_serializer_context(self):
        return {'request': self.request}
 

class ConversationDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer
   
    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
   
    def get_serializer_context(self):
        return {'request': self.request}
 

class ConversationMessagesView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
       
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
 

class MarkConversationReadView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
       
        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        conversation.messages.filter(
            receiver=request.user,
            is_read=False
        ).update(is_read=True)
       
        return Response({'status': 'conversation marked as read'})
 

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        serializer = SendMessageSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            message = serializer.save()
            return Response(
                MessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        count = Message.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})
 

class ConversationWithUserView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        other_user_id = request.query_params.get('user_id')
        if not other_user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
       
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=other_user
        ).first()
       
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)
       
        messages = conversation.messages.all()[:50]
        return Response({
            'conversation_id': conversation.id,
            'participants': ChatUserSerializer([request.user, other_user], many=True).data,
            'messages': MessageSerializer(messages, many=True).data
        })
 

class MarkMessageReadView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request, pk):
        message = get_object_or_404(Message, pk=pk)
       
        if message.receiver != request.user:
            return Response(
                {'error': 'You can only mark messages sent to you as read'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        message.is_read = True
        message.save()
        return Response({'status': 'message marked as read'})
 

class ChatUsersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatUserSerializer
   
    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)
   

class EmployerInitiateChatView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        if request.user.user_type != 'employer':
            return Response(
                {'error': 'Only employers can initiate new conversations'},
                status=status.HTTP_403_FORBIDDEN
            )
       
        jobseeker_id = request.data.get('jobseeker_id')
        initial_message = request.data.get('message', '')
       
        if not jobseeker_id:
            return Response(
                {'error': 'jobseeker_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
       
        try:
            jobseeker = User.objects.get(id=jobseeker_id, user_type='jobseeker')
        except User.DoesNotExist:
            return Response(
                {'error': 'Jobseeker not found'},
                status=status.HTTP_404_NOT_FOUND
            )
       
        conversation = Conversation.objects.filter(
            participants=request.user
        ).filter(
            participants=jobseeker
        ).first()
       
        if not conversation:
            conversation = Conversation.objects.create(
                initiated_by=request.user
            )
            conversation.participants.add(request.user, jobseeker)
           
            if initial_message:
                message = Message.objects.create(
                    conversation=conversation,
                    sender=request.user,
                    receiver=jobseeker,
                    content=initial_message
                )
                return Response({
                    'status': 'Conversation started',
                    'conversation_id': conversation.id,
                    'message': MessageSerializer(message).data
                }, status=status.HTTP_201_CREATED)
       
        return Response({
            'status': 'Conversation exists',
            'conversation_id': conversation.id
        })    
   

@api_view(["POST"])
def chat_api(request):
    user_message = request.data.get("message")
 
    if not user_message:
        return Response({"error": "Message is required"}, status=400)
 
    user_msg = ChatMessage.objects.create(
        sender="user",
        message=user_message
    )
 
    bot_reply_text = generate_bot_reply(user_message)
 
    bot_msg = ChatMessage.objects.create(
        sender="bot",
        message=bot_reply_text
    )
 
    return Response({
        "user": ChatMessageSerializer(user_msg).data,
        "bot": ChatMessageSerializer(bot_msg).data
    })


def generate_bot_reply(user_text):
    text = user_text.lower()
 
    login_responses = [
        "You can log in as a jobseeker by clicking Login → Jobseeker and entering your registered email and password.",
        "To access your account, go to the Login page and choose the Jobseeker option.",
        "Simply click on Login, select your role, and enter your credentials to continue.",
        "Use your registered email and password in the Login section to access your dashboard."
    ]
 
    job_responses = [
        "You can browse available jobs from the Jobs section on your dashboard.",
        "Head over to the Jobs tab to explore current openings.",
        "All listed opportunities are available under the Jobs section.",
        "Visit the dashboard and click on Jobs to see matching positions."
    ]
 
    register_responses = [
        "Click on Register and fill in your details to create an account.",
        "To get started, select Register and complete the signup form.",
        "Choose Register, provide your information, and submit the form.",
        "You can create a new account by clicking the Register button."
    ]
 
    default_responses = [
        "Could you please provide more details so I can assist you better?",
        "I'm here to help. Can you clarify your question?",
        "Let me know a bit more information so I can guide you properly.",
        "Can you explain your concern in more detail?"
    ]
 
    if "login" in text:
        return random.choice(login_responses)
    elif "job" in text:
        return random.choice(job_responses)
    elif "register" in text:
        return random.choice(register_responses)
 
    return random.choice(default_responses)


# ============ HELP & TICKET VIEWS ============

@api_view(['GET'])
def help_topics(request):
    topics = HelpTopic.objects.all().order_by('-id')
    serializer = HelpTopicSerializer(topics, many=True)
    return Response({
        "status": True,
        "message": "Help topics fetched successfully",
        "data": serializer.data
    })
 

class RaiseTicketCreateView(APIView):
    def get(self, request):
        return Response({
            "status": True,
            "message": "Raise Ticket API Working"
        })
 
    def post(self, request):
        serializer = RaiseTicketSerializer(data=request.data)
 
        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": True,
                "message": "Ticket submitted successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
 
        return Response({
            "status": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
 

# ============ PASSWORD MANAGEMENT ============

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data, context={'request': request})
       
        if serializer.is_valid():
            user = serializer.context['user']
           
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()
                     
            token = generate_token()
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=24)
            )
           
            try:
                send_password_reset_email(user, token, request)
                return Response({
                    "message": "Password reset instructions have been sent to your email."
                }, status=status.HTTP_200_OK)
            except Exception as e:
                reset_token.delete()
                return Response({
                    "error": "Failed to send email. Please try again."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
       
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
           
            try:
                reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
               
                if not reset_token.is_valid():
                    return Response({
                        "error": "Token has expired."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user = reset_token.user
                user.set_password(new_password)
                user.save()
               
                reset_token.is_used = True
                reset_token.save()
               
                refresh = RefreshToken.for_user(user)
               
                return Response({
                    "message": "Password has been reset successfully.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=status.HTTP_200_OK)
               
            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired token."
                }, status=status.HTTP_400_BAD_REQUEST)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class CreatePasswordView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        serializer = CreatePasswordSerializer(data=request.data)
       
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
           
            try:
                reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
               
                if not reset_token.is_valid():
                    return Response({
                        "error": "Token has expired."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user = reset_token.user
               
                if user.password and not user.password.startswith('!'):
                    return Response({
                        "error": "Password already set. Please use forgot password if you need to reset it."
                    }, status=status.HTTP_400_BAD_REQUEST)
               
                user.set_password(new_password)
                user.save()
               
                reset_token.is_used = True
                reset_token.save()
               
                refresh = RefreshToken.for_user(user)
               
                return Response({
                    "message": "Password created successfully.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh)
                }, status=status.HTTP_200_OK)
               
            except PasswordResetToken.DoesNotExist:
                return Response({
                    "error": "Invalid or expired token."
                }, status=status.HTTP_400_BAD_REQUEST)
       
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 

class ValidateResetTokenView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        token = request.data.get('token')
       
        if not token:
            return Response({
                "valid": False,
                "error": "Token is required."
            }, status=status.HTTP_400_BAD_REQUEST)
       
        try:
            reset_token = PasswordResetToken.objects.get(token=token, is_used=False)
           
            if reset_token.is_valid():
                return Response({
                    "valid": True,
                    "message": "Token is valid."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "valid": False,
                    "message": "Token has expired."
                }, status=status.HTTP_200_OK)
               
        except PasswordResetToken.DoesNotExist:
            return Response({
                "valid": False,
                "message": "Invalid token."
            }, status=status.HTTP_200_OK)
 

class AdminCreatePasswordTokenView(APIView):
    permission_classes = [IsAdminUser]
 
    def post(self, request):
        user_id = request.data.get('user_id')
       
        if not user_id:
            return Response({
                "error": "user_id is required."
            }, status=status.HTTP_400_BAD_REQUEST)
       
        try:
            user = User.objects.get(id=user_id)
           
            PasswordResetToken.objects.filter(user=user, is_used=False).delete()
           
            token = generate_token()
            reset_token = PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(days=7)  
            )
           
            setup_link = f"{request.scheme}://{request.get_host()}/create-password?token={token}"
           
            return Response({
                "message": "Password creation token generated successfully.",
                "token": token,
                "setup_link": setup_link
            }, status=status.HTTP_200_OK)
           
        except User.DoesNotExist:
            return Response({
                "error": "User not found."
            }, status=status.HTTP_404_NOT_FOUND)    
       

# ============ CONTACT US ============

class ContactMessageCreateAPIView(APIView):
    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Message sent successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
               

# ============ NEWSLETTER ============

class NewsletterSubscribeAPIView(APIView):
    def post(self, request):
        email = request.data.get("email")
        print(request.data)
 
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        if NewsletterSubscriber.objects.filter(email=email).exists():
            return Response(
                {"message": "Email already subscribed"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        serializer = NewsletterSubscriberSerializer(data={"email": email})
 
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Subscribed successfully"},
                status=status.HTTP_201_CREATED
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ COMPANY VERIFICATION ============

class SubmitCompanyVerification(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        if request.user.user_type != "employer":
            return Response(
                {"error": "Only employers can submit company verification"},
                status=status.HTTP_403_FORBIDDEN
            )
 
        if CompanyVerification.objects.filter(employer=request.user).exists():
            return Response({
                "error": "You already submitted verification"
            })
 
        # ✅ Pass the request context to serializer
        serializer = CompanyVerificationSerializer(
            data=request.data,
            context={'request': request}
        )
 
        if serializer.is_valid():
            serializer.save(employer=request.user)
 
            return Response({
                "message": "Verification submitted successfully",
                "status": "pending"
            })
 
        return Response(serializer.errors)
   

class CompanyVerificationAction(APIView):
    permission_classes = [IsAdminUser]
 
    def patch(self, request, pk):
        try:
            verification = CompanyVerification.objects.get(id=pk)
        except CompanyVerification.DoesNotExist:
            return Response({"error": "Verification not found"}, status=404)
 
        status_value = request.data.get("status")
 
        if status_value not in ["approved", "rejected"]:
            return Response({"error": "Invalid status"})
 
        verification.status = status_value
        verification.save()
 
        return Response({
            "message": f"Company {status_value} successfully"
        })

# ============ COMPANY PROFILE VIEWS ============
 
class CompanyProfileCreateView(APIView):
    permission_classes = [IsEmployerOrAdmin]

    def post(self, request):
        # Check if employer already has a company
        if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
            return Response(
                {"error": "You are already linked to a company"}, 
                status=400
            )

        # Check for duplicate company name
        company_name = request.data.get('company_name')
        existing_company = CompanyProfile.objects.filter(company_name__iexact=company_name).first()

        if existing_company:
            # ✅ Return 400 error to trigger popup in frontend
            return Response(
                {"error": f"A company with the name '{company_name}' already exists. Please use a different name."}, 
                status=400
            )

        # Create new company
        serializer = CompanyProfileSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            company = serializer.save()

            if hasattr(request.user, 'employer_profile'):
                request.user.employer_profile.company = company
                request.user.employer_profile.save()

            return Response({
                "message": "Company profile created successfully",
                "company_id": company.id,
                "company_name": company.company_name,
                "is_existing": False
            }, status=201)

        return Response(serializer.errors, status=400)
 
class CompanyProfileDetailView(APIView):

    permission_classes = [IsEmployerOrAdmin]
 
    def get(self, request):

        # ✅ Get company through employer profile instead of user field

        if not hasattr(request.user, 'employer_profile'):

            return Response({"error": "Employer profile not found"}, status=404)

        company = request.user.employer_profile.company

        if not company:

            return Response({"error": "No company linked to this employer"}, status=404)
 
        serializer = CompanyProfileSerializer(

            company,

            context={'request': request}

        )
 
        return Response(serializer.data)

 
class CompanyProfileUpdateView(APIView):

    permission_classes = [IsEmployerOrAdmin]

    def patch(self, request):

        # ✅ Get company through employer profile

        if not hasattr(request.user, 'employer_profile'):

            return Response({"error": "Employer profile not found"}, status=404)

        company = request.user.employer_profile.company

        if not company:

            return Response({"error": "No company linked to this employer"}, status=404)

        serializer = CompanyProfileSerializer(

            company,

            data=request.data,

            partial=True,

            context={'request': request}

        )
 
        if serializer.is_valid():

            serializer.save()

            return Response({

                "message": "Profile updated successfully",

                "data": serializer.data

            }, status=200)

        return Response(serializer.errors, status=400)

 
class CompanyProfileListView(APIView):
    permission_classes = [AllowAny]
 
    def get(self, request):
        companies = CompanyProfile.objects.all().order_by('-created_at')

        serializer = CompanyProfileSerializer(
            companies,
            many=True,
            context={'request': request}
        )

        return Response(serializer.data, status=200)
 
 
 
 
class CompanyProfileByIdView(APIView):
    permission_classes = [AllowAny]
 
    def get(self, request, company_id):
        try:
            company = CompanyProfile.objects.get(id=company_id)
 
            serializer = CompanyProfileSerializer(
                company,
                context={'request': request}
            )
 
            return Response(serializer.data, status=200)
 
        except CompanyProfile.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=404
            )
 
        
class LinkToExistingCompanyView(APIView):
    permission_classes = [IsEmployerOrAdmin]
    
    def post(self, request):
        company_name = request.data.get('company_name')
        
        if not company_name:
            return Response({"error": "Company name is required"}, status=400)
        
        # Find existing company (case-insensitive)
        company = CompanyProfile.objects.filter(company_name__iexact=company_name).first()
        
        if not company:
            return Response({"error": "Company not found. Please create a new company."}, status=404)
        
        # Check if employer already has a company
        if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
            return Response({
                "error": f"You are already linked to company: {request.user.employer_profile.company.company_name}"
            }, status=400)
        
        # Link employer to existing company
        if hasattr(request.user, 'employer_profile'):
            request.user.employer_profile.company = company
            request.user.employer_profile.save()
            
            return Response({
                "message": f"Successfully linked to existing company: {company.company_name}",
                "company_id": company.id,
                "company_name": company.company_name,
                "is_existing": True
            }, status=200)
        
        return Response({"error": "Employer profile not found"}, status=400)        
 
    

# ============ OTP VIEWS ============

class SendEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered"}, status=400)

        otp = generate_otp()

        EmailOTP.objects.create(
            email=email,
            otp=otp,
            purpose="email_verification",
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        send_email_otp(email, otp, "signup")

        return Response({"message": "OTP sent to email"})


class VerifyEmailOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        otp_obj = EmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose="email_verification",
            is_verified=False
        ).last()

        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)

        otp_obj.is_verified = True
        otp_obj.save()

        return Response({"message": "Email verified successfully"})


class SendLoginOTPView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        email = request.data.get("email")
 
        if not email:
            return Response({"error": "Email is required"}, status=400)
 
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found. Please sign up first."}, status=404)
 
        EmailOTP.objects.filter(email=email, purpose="login").delete()
 
        otp = generate_4digit_otp()
 
        EmailOTP.objects.create(
            email=email,
            otp=otp,
            purpose="login",
            expires_at=timezone.now() + timedelta(minutes=5)
        )
 
        send_email_otp(email, otp, "login")
 
        print(f"🔐 Login OTP for {email}: {otp}")
 
        return Response({"message": "OTP sent successfully"})
 

class VerifyLoginOTPView(APIView):
    permission_classes = [AllowAny]
 
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
 
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)
 
        if len(otp) != 4:
            return Response({"error": "OTP must be 4 digits"}, status=400)
 
        otp_obj = EmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose="login",
            is_verified=False
        ).last()
 
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)
 
        otp_obj.is_verified = True
        otp_obj.save()
 
        user = User.objects.get(email=email)
        refresh = RefreshToken.for_user(user)
        from django.utils import timezone
        user.login_time = timezone.now()
        user.save(update_fields=["login_time"])
 
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "user_type": user.user_type
            }
        })
 

# ============ REPORT A JOB ============

class SubmitComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsJobSeeker]
 
    def post(self, request):
        serializer = ComplaintSerializer(data=request.data, context={'request': request})
 
        if serializer.is_valid():
            serializer.save(user=request.user)
 
            return Response(
                {"message": "Complaint submitted successfully"},
                status=status.HTTP_201_CREATED
            )
 
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyVerificationStatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get verification status for the logged-in employer
        Returns: { status: 'pending'/'approved'/'rejected'/'not_submitted', is_verified: true/false }
        """
        # Only employers can access this
        if request.user.user_type != 'employer':
            return Response(
                {"error": "Only employers can access verification status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Check if employer has submitted verification
            verification = CompanyVerification.objects.get(employer=request.user)
            
            return Response({
                "status": verification.status,  # 'pending', 'approved', 'rejected'
                "is_verified": verification.status == "approved",
                "legal_name": verification.legal_name,
                "submitted_at": verification.created_at,
                "message": f"Your verification is {verification.status}"
            }, status=status.HTTP_200_OK)
            
        except CompanyVerification.DoesNotExist:
            # No verification submitted yet
            return Response({
                "status": "not_submitted",
                "is_verified": False,
                "message": "No verification request found. Please submit company verification."
            }, status=status.HTTP_200_OK)

class AdminComplaintListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        complaints = Complaint.objects.all().order_by('-created_at')
 
        status_filter = request.GET.get("status")
        if status_filter:
            complaints = complaints.filter(status=status_filter)
 
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
 

class AdminUpdateComplaintView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request, pk):
        try:
            complaint = Complaint.objects.get(id=pk)
        except Complaint.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
 
        complaint.status = request.data.get("status", complaint.status)
        complaint.save()
 
        return Response({"message": "Status updated"})
    
# ============ BILLING VIEWS ============

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.utils.timezone import now
from datetime import timedelta
import razorpay
from decimal import Decimal
import random
import string
from datetime import datetime
 
from .models import *
from .serializers import *
from .services import create_order
from .utils import calculate_gst, generate_invoice_number, generate_invoice_pdf
 
client = razorpay.Client(auth=(settings.RAZORPAY_KEY, settings.RAZORPAY_SECRET))
 
 
from decimal import Decimal
 
class PlanListView(APIView):
    permission_classes = [IsAuthenticated]
   
    def get(self, request):
        plans = Plan.objects.all()
        duration = request.query_params.get('duration', 'monthly')
       
        data = []
        for plan in plans:
            pricing = self.calculate_pricing_with_discount(plan, duration)
           
            plan_data = {
                'id': plan.id,
                'name': plan.name,
                'monthly_price': float(plan.monthly_price),
                'duration_days': plan.duration_days,
                'pricing': pricing
            }
            data.append(plan_data)
       
        return Response(data)
   
    def calculate_pricing_with_discount(self, plan, duration):
        # Convert to Decimal
        monthly_price = Decimal(str(plan.monthly_price))
       
        if duration == 'monthly':
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
            duration_text = 'Monthly'
           
        elif duration == '6_months':
            multiplier = Decimal('6')
            discount_percent = Decimal('10')
            duration_days = 180
            duration_text = '6 Months'
           
        elif duration == 'yearly':
            multiplier = Decimal('12')
            discount_percent = Decimal('15')
            duration_days = 365
            duration_text = 'Yearly'
           
        else:
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
            duration_text = 'Monthly'
       
        # All calculations using Decimal
        original_price = monthly_price * multiplier
        discount_amount = original_price * (discount_percent / Decimal('100'))
        subtotal = original_price - discount_amount
       
        cgst = subtotal * Decimal('0.09')
        sgst = subtotal * Decimal('0.09')
        total = subtotal + cgst + sgst
       
        return {
            'duration': duration_text,
            'duration_days': duration_days,
            'monthly_price': float(round(monthly_price, 2)),
            'original_price': float(round(original_price, 2)),
            'discount_percent': int(discount_percent),
            'discount_amount': float(round(discount_amount, 2)),
            'subtotal': float(round(subtotal, 2)),
            'cgst': float(round(cgst, 2)),
            'sgst': float(round(sgst, 2)),
            'total': float(round(total, 2)),
            'savings': float(round(original_price - subtotal, 2)) if discount_percent > 0 else None
        }
   
 
from decimal import Decimal
 
class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        plan_id = request.data.get("plan_id")
        duration = request.data.get("duration", "monthly")
       
        plan = get_object_or_404(Plan, id=plan_id)
        pricing = self.calculate_discounted_price(plan, duration)
       
        order = client.order.create({
            "amount": int(pricing['total'] * 100),
            "currency": "INR",
            "payment_capture": 1,
        })
 
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            razorpay_order_id=order["id"],
            amount=Decimal(str(pricing['total'])),
            status="pending",
        )
 
        return Response({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "payment_db_id": payment.id,
            "razorpay_key": settings.RAZORPAY_KEY,
            "duration": duration,
            "duration_days": pricing['duration_days'],
            "pricing": pricing
        })
   
    def calculate_discounted_price(self, plan, duration):
        # Convert to Decimal - THIS IS KEY
        monthly_price = Decimal(str(plan.monthly_price))
       
        if duration == 'monthly':
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
           
        elif duration == '6_months':
            multiplier = Decimal('6')
            discount_percent = Decimal('10')
            duration_days = 180
           
        elif duration == 'yearly':
            multiplier = Decimal('12')
            discount_percent = Decimal('15')
            duration_days = 365
           
        else:
            multiplier = Decimal('1')
            discount_percent = Decimal('0')
            duration_days = plan.duration_days
       
        # All calculations using Decimal
        original_price = monthly_price * multiplier
        discount_amount = original_price * (discount_percent / Decimal('100'))
        subtotal = original_price - discount_amount
       
        cgst = subtotal * Decimal('0.09')
        sgst = subtotal * Decimal('0.09')
        total = subtotal + cgst + sgst
       
        return {
            'duration': duration,
            'duration_days': duration_days,
            'monthly_price': float(round(monthly_price, 2)),
            'original_price': float(round(original_price, 2)),
            'discount_percent': int(discount_percent),
            'discount_amount': float(round(discount_amount, 2)),
            'subtotal': float(round(subtotal, 2)),
            'cgst': float(round(cgst, 2)),
            'sgst': float(round(sgst, 2)),
            'total': float(round(total, 2)),
        }
 
class CurrentSubscriptionView(APIView):

    permission_classes = [IsAuthenticated]
 
    def get(self, request):

        # first sees active after sees cancelled

        sub = Subscription.objects.filter(

            user=request.user,

            status='active'

        ).order_by('-start_date').first()

        # shows active or cancelled

        if not sub:

            sub = Subscription.objects.filter(

                user=request.user,

                status='cancelled'

            ).order_by('-start_date').first()

        return Response(SubscriptionSerializer(sub).data if sub else {})
 
 
class CancelSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        sub = Subscription.objects.filter(user=request.user, status='active').first()
        if sub:
            sub.status = "cancelled"
            sub.save()
        return Response({"message": "Cancelled"})
    
    def patch(self, request):
        sub = Subscription.objects.filter(
            user=request.user,
            status='cancelled'
        ).order_by('-start_date').first()
        if sub:
            sub.status = 'active'
            sub.save()
        return Response({"message": "Reactivated"})
 
 
class InvoiceListView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        invoices = Invoice.objects.filter(user=request.user)
        return Response(InvoiceSerializer(invoices, many=True).data)
 
 
class InvoiceDownloadView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request, pk):
        invoice = Invoice.objects.get(id=pk, user=request.user)
        file_path = generate_invoice_pdf(invoice)
        return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
 
 
class PaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        methods = PaymentMethod.objects.filter(user=request.user)
        serializer = PaymentMethodSerializer(methods, many=True)
        return Response(serializer.data)
 
    def post(self, request):
        serializer = PaymentMethodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
   
    def patch(self, request, pk):
        try:
            payment_method = PaymentMethod.objects.get(id=pk, user=request.user)
        except PaymentMethod.DoesNotExist:
            return Response({"error": "Payment method not found"}, status=404)
       
        serializer = PaymentMethodSerializer(payment_method, data=request.data, partial=True)
        if serializer.is_valid():
            if request.data.get('is_default') == True:
                PaymentMethod.objects.filter(user=request.user).exclude(id=pk).update(is_default=False)
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
   
    def delete(self, request, pk):
        try:
            payment_method = PaymentMethod.objects.get(id=pk, user=request.user)
            payment_method.delete()
            return Response({"message": "Deleted successfully"})
        except PaymentMethod.DoesNotExist:
            return Response({"error": "Payment method not found"}, status=404)
 
 
class DeletePaymentMethodView(APIView):
    permission_classes = [IsAuthenticated]
 
    def delete(self, request, pk):
        PaymentMethod.objects.filter(id=pk, user=request.user).delete()
        return Response({"message": "Deleted"})
 
 
class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        data = request.data
 
        try:
            razorpay_order_id = data.get('razorpay_order_id')
            razorpay_payment_id = data.get('razorpay_payment_id')
            razorpay_signature = data.get('razorpay_signature')
            duration = data.get('duration', 'monthly')
            duration_days = data.get('duration_days', 30)
            payment_method = data.get('payment_method', 'card')
 
            # Verify payment signature
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
 
            client.utility.verify_payment_signature(params_dict)
 
            # Get the payment record
            payment = Payment.objects.get(
                razorpay_order_id=razorpay_order_id,
                user=request.user
            )
 
            # Update payment details
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = "success"
            payment.payment_method = payment_method
            payment.save()
 
            # Cancel any existing active subscriptions
            Subscription.objects.filter(
                user=request.user,
                status='active'
            ).update(status='cancelled')
 
            # Calculate end date based on duration
            if duration == 'monthly':
                end_date = now() + timedelta(days=30)
            elif duration == '6_months':
                end_date = now() + timedelta(days=180)
            elif duration == 'yearly':
                end_date = now() + timedelta(days=365)
            else:
                end_date = now() + timedelta(days=30)
 
            # Create new subscription
            subscription = Subscription.objects.create(
                user=request.user,
                plan=payment.plan,
                status='active',
                end_date=end_date
            )
 
            # Calculate GST (18%) - payment.amount already includes tax
            subtotal = payment.amount / Decimal('1.18')
            gst = payment.amount - subtotal
 
            # Format duration text
            if duration == 'monthly':
                duration_text = '1 Month'
            elif duration == '6_months':
                duration_text = '6 Months'
            elif duration == 'yearly':
                duration_text = '1 Year'
            else:
                duration_text = '1 Month'
 
            #  FIXED: Get company details through EmployerProfile
            company_name = request.user.username
            company_email = request.user.email
            company_phone = ''
           
            try:
                if hasattr(request.user, 'employer_profile'):
                    employer_profile = request.user.employer_profile
                    if employer_profile.company:
                        company = employer_profile.company
                        company_name = company.company_name
                        company_email = company.company_email
                        company_phone = company.contact_number
                        print(f" Found company: {company_name}, Email: {company_email}, Phone: {company_phone}")
                    else:
                        print(f" Employer has no company linked")
                else:
                    print(f" User is not an employer")
            except Exception as e:
                print(f" Error getting company: {e}")
 
            # Create invoice with CORRECT company details
            invoice = Invoice.objects.create(
                user=request.user,
                invoice_number=self.generate_invoice_number(),
                company_name=company_name,      #  Now this will be actual company name
                email=company_email,             #  Now this will be actual company email
                phone=company_phone,             #  Now this will be actual company phone
                payment_method=payment_method.upper(),
                transaction_id=razorpay_payment_id,
                payment_status="Paid",
                subtotal=round(subtotal, 2),
                gst=round(gst, 2),
                total=payment.amount,
                plan_name=payment.plan.name,
                duration=duration_text,
                start_date=now(),
                end_date=end_date
            )
 
            return Response({
                "message": "Payment verified successfully",
                "subscription_id": subscription.id,
                "invoice_number": invoice.invoice_number,
                "plan_name": payment.plan.name,
                "duration": duration_text,
                "amount": payment.amount,
                "end_date": end_date
            })
 
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)
       
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Invalid payment signature"}, status=400)
       
        except Exception as e:
            return Response({"error": str(e)}, status=400)
 
    def generate_invoice_number(self):
        """Generate unique invoice number"""
        date_part = datetime.now().strftime('%Y%m%d')
        random_part = ''.join(random.choices(string.digits, k=4))
        invoice_number = f"INV-{date_part}-{random_part}"
       
        while Invoice.objects.filter(invoice_number=invoice_number).exists():
            random_part = ''.join(random.choices(string.digits, k=4))
            invoice_number = f"INV-{date_part}-{random_part}"
       
        return invoice_number
 
    
# ============ COMPANY EMAIL OTP VIEWS ============

class SendCompanyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get("email")
        company_name = request.data.get("company_name")
        
        if not email:
            return Response({"error": "Email is required"}, status=400)
        
        if not company_name:
            return Response({"error": "Company name is required"}, status=400)
        
        # Check if email is already used by another company
        if CompanyProfile.objects.filter(company_email=email).exists():
            # If updating existing company, check if it's the same company
            if hasattr(request.user, 'employer_profile') and request.user.employer_profile.company:
                existing_company = request.user.employer_profile.company
                if existing_company.company_email != email:
                    return Response(
                        {"error": "This email is already used by another company"}, 
                        status=400
                    )
            else:
                return Response(
                    {"error": "This email is already registered with another company"}, 
                    status=400
                )
        
        # Delete existing OTPs for this email
        CompanyEmailOTP.objects.filter(
            email=email,
            purpose='company_verification',
            is_verified=False
        ).delete()
        
        otp = generate_company_otp()
        
        CompanyEmailOTP.objects.create(
            company_name=company_name,
            email=email,
            otp=otp,
            purpose='company_verification',
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Send OTP email
        try:
            send_company_email_otp(email, otp, company_name)
            print(f"📧 Company OTP sent to {email}: {otp}")  # For testing
            return Response({
                "message": "OTP sent to company email successfully",
                "email": email
            }, status=200)
        except Exception as e:
            return Response({
                "error": f"Failed to send OTP: {str(e)}"
            }, status=500)


class VerifyCompanyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=400)
        
        otp_obj = CompanyEmailOTP.objects.filter(
            email=email,
            otp=otp,
            purpose='company_verification',
            is_verified=False
        ).last()
        
        if not otp_obj or not otp_obj.is_valid():
            return Response({"error": "Invalid or expired OTP"}, status=400)
        
        # Mark OTP as verified
        otp_obj.is_verified = True
        otp_obj.save()
        
        return Response({
            "message": "Email verified successfully",
            "verified": True
        }, status=200)    

class EmployerOnboardingStatusView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        user = request.user
 
        if user.user_type != "employer":
            return Response(
                {"error": "Only employers allowed"},
                status=403
            )
 
        # ==================================
        # CORRECT COMPANY PROFILE CHECK
        # ==================================
        has_company_profile = False
 
        if hasattr(user, "employer_profile"):
            has_company_profile = (
                user.employer_profile.company is not None
            )
 
        # ==================================
        # VERIFICATION CHECK
        # ==================================
        verification = CompanyVerification.objects.filter(
            employer=user
        ).order_by("-id").first()
 
        has_verification = verification is not None
 
        verification_status = (
            verification.status
            if verification
            else None
        )
 
        return Response({
            "has_company_profile": has_company_profile,
            "has_verification": has_verification,
            "verification_status": verification_status
        })
    
# Google Login    
 
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
 
from .models import User, JobSeekerProfile, EmployerProfile
 
 
# Update your GoogleLoginView to this:
 
class GoogleLoginView(APIView):
    """
    Google Signup/Login API
    POST /api/google-login/
 
    Request body:
    {
        "token": "google_id_token"
    }
    """
 
    permission_classes = [AllowAny]
 
    def post(self, request):
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from django.conf import settings
        from rest_framework_simplejwt.tokens import RefreshToken
 
        # Accept token from multiple field names
        id_token_str = (
            request.data.get("credential")
            or request.data.get("id_token")
            or request.data.get("token")
            or request.data.get("access_token")
        )
 
        if not id_token_str:
            return Response(
                {
                    "error": "Google token required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        try:
            # Google Client ID
            google_client_id = getattr(
                settings,
                "GOOGLE_CLIENT_ID",
                None
            )
 
            if not google_client_id:
                return Response(
                    {
                        "error": "GOOGLE_CLIENT_ID not configured"
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
 
            # Verify token
            info = id_token.verify_oauth2_token(
                id_token_str,
                google_requests.Request(),
                google_client_id
            )
 
            # Google user info
            email = info.get("email")
            name = info.get("name", "")
            picture = info.get("picture", "")
 
            if not email:
                return Response(
                    {
                        "error": "Email not provided by Google"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # --------------------------------------------------
            # EXISTING EMAIL VALIDATION
            # --------------------------------------------------
 
            user = User.objects.filter(email=email).first()
 
            # If email already exists -> block signup
            if user:
                return Response(
                    {
                        "error": "Email already registered. Please login."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # --------------------------------------------------
            # CREATE NEW USER
            # --------------------------------------------------
 
            username = email.split("@")[0]
            base_username = username
            counter = 1
 
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
 
            user = User.objects.create(
                username=username,
                email=email,
                user_type=User.UserType.JOBSEEKER,
                is_active=True
            )
 
            user.set_unusable_password()
            user.save()
 
            # --------------------------------------------------
            # CREATE JOBSEEKER PROFILE
            # --------------------------------------------------
 
            try:
                JobSeekerProfile.objects.create(
                    user=user,
                    full_name=name
                )
            except Exception as e:
                print("Profile creation error:", e)
 
            # --------------------------------------------------
            # JWT TOKENS
            # --------------------------------------------------
 
            refresh = RefreshToken.for_user(user)

            from django.utils import timezone
            user.login_time = timezone.now()
            user.save(update_fields=["login_time"])
 
            return Response(
                {
                    "success": True,
                    "message": "Google signup successful",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "username": user.username,
                        "user_type": user.user_type,
                        "profile_image": picture
                    },
                    "is_new_user": True
                },
                status=status.HTTP_201_CREATED
            )
 
        except ValueError as e:
            return Response(
                {
                    "error": f"Invalid Google token: {str(e)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        except Exception as e:
            return Response(
                {
                    "error": f"Authentication failed: {str(e)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
class AdminLoginView(APIView):

    permission_classes = [AllowAny]
 
    def post(self, request):

        print("REQUEST DATA:", request.data)  # ← indented correctly

        email = request.data.get('email') or request.data.get('username') or ''

        email = email.strip()

        password = request.data.get('password', '').strip()

        print("EMAIL:", email)

        print("PASSWORD:", password)
 
        # ── Field-level validation ──────────────────────────

        errors = {}

        if not email:

            errors['email'] = 'Email is required.'

        if not password:

            errors['password'] = 'Password is required.'

        if errors:

            return Response({'success': False, 'errors': errors},

                            status=status.HTTP_400_BAD_REQUEST)
 
        # ── Find user by email ──────────────────────────────

        try:

            user = User.objects.get(email__iexact=email)

        except User.DoesNotExist:

            return Response(

                {'success': False, 'errors': {'email': 'No account found with this email.'}},

                status=status.HTTP_401_UNAUTHORIZED

            )
 
        if user.user_type != 'admin':

            return Response(

                {'success': False, 'errors': {'email': 'This account does not have admin access.'}},

                status=status.HTTP_403_FORBIDDEN

            )
 
        if not user.check_password(password):

            return Response(

                {'success': False, 'errors': {'password': 'Incorrect password.'}},

                status=status.HTTP_401_UNAUTHORIZED

            )
 
        if not user.is_active:

            return Response(

                {'success': False, 'errors': {'email': 'This account is disabled.'}},

                status=status.HTTP_403_FORBIDDEN

            )
 
        refresh = RefreshToken.for_user(user)

        from django.utils import timezone
        user.login_time = timezone.now()
        user.save(update_fields=["login_time"])
 
        return Response({

            'success': True,

            'message': 'Admin login successful.',

            'access':  str(refresh.access_token),

            'refresh': str(refresh),

            'user': {

                'id':        user.id,

                'email':     user.email,

                'username':  user.username,

                'user_type': user.user_type,

            }

        }, status=status.HTTP_200_OK)
 


class DashboardView(APIView):
 
    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
        last_2_days = today - timedelta(days=2)
        last_month = today - timedelta(days=30)
 
       
        user_stats = User.objects.aggregate(
            new_today=Count('id', filter=Q(date_joined__date=today)),
            new_week=Count('id', filter=Q(date_joined__date__gte=week_start)),
 
            active_today = Count(
            'id',
            filter=Q(user_type="employer", login_time__date=today)
        ),
 
        active_week = Count(
            'id',
            filter=Q(user_type="employer", login_time__date__gte=week_start)
        ),
            
 
            login_today=Count("id", filter=Q(login_time__date=today)),
 
            new_employers=Count('id', filter=Q(user_type="employer", date_joined__date=today)),
        )
 
       
        job_stats = PostAJob.objects.aggregate(
            total=Count('id'),
            today=Count('id', filter=Q(created_at__date=today)),
            week=Count('id', filter=Q(created_at__date__gte=week_start)),
 
            rejected=Count(
                'id',
                filter=Q(approval_status="rejected")
            ),
            approved=Count(

                'id',

                filter=Q(approval_status="approved")

            ),
 
            highlighted=Count('id', filter=Q(is_highlighted=True)),
 
            
        )

        expired_jobs = JobHistory.objects.count()
 
       
        app_stats = JobApplication.objects.aggregate(
            total=Count('id'),
            today=Count('id', filter=Q(applied_date__date=today)),
            week=Count('id', filter=Q(applied_date__date__gte=week_start)),
 
            last_2_days=Count('id', filter=Q(applied_date__date__gte=last_2_days)),
            last_month=Count('id', filter=Q(applied_date__date__gte=last_month)),
 
            shortlisted=Count('id', filter=Q(status="shortlisted")),
            interviews=Count('id', filter=Q(status="interview_called")),
            rejected=Count('id', filter=Q(status="rejected")),
        )
 
       
        profile_update = (
            JobSeekerProfile.objects.filter(updated_at__date=today).count()
            + EmployerProfile.objects.filter(updated_at__date=today).count()
            + AdminProfile.objects.filter(updated_at__date=today).count()
        )
 
        suspicious_activity = Complaint.objects.filter(
    status=Complaint.Status.INVESTIGATING
).count()
 
        messages_sent = Message.objects.count()
        support_tickets = RaiseTicket.objects.count()
        emails_sent = EmailOTP.objects.count() + CompanyEmailOTP.objects.count()
 
       
        return Response({
            "admin_activity_monitoring": {
                "new_user_registrations": {
                    "today": user_stats["new_today"],
                    "this_week": user_stats["new_week"],
                },
                "job_posted": {
                    "today": job_stats["today"],
                    "this_week": job_stats["week"],
                },
                "total_applications": {
                    "today": app_stats["today"],
                    "this_week": app_stats["week"],
                },
                "active_employers": {
                    "today": user_stats["active_today"],
                    "this_week": user_stats["active_week"],
                },
            },
            "platform_activity_overview": {
                "user_activity": {
                    "login_today": user_stats["login_today"],
                    "profile_update": profile_update,
                    "suspicious_activity": suspicious_activity,
                },
                "application_status": {
                    "total_application": app_stats["total"],
                    "shortlisted": app_stats["shortlisted"],
                    "interviews": app_stats["interviews"],
                    "rejections": app_stats["rejected"],
                },
                "employer_activity": {
                    "new_employers": user_stats["new_employers"],
                    "job_postings": job_stats["total"],
                    # "rejected_jobs": job_stats["rejected"],
                    "highlighted_jobs": job_stats["highlighted"],
                },
            },
            "job_communication": {
                "job_tracking": {
                    "job_posted": job_stats["total"],
                    "job_approved": job_stats["approved"],
                    "expired_jobs": expired_jobs,
                },
                "communication_logs": {
                    "messages_sent": messages_sent,
                    "support_tickets": support_tickets,
                    "emails_sent": emails_sent,
                },
                "employer_activity": {
                    "applications_last_2_days": app_stats["last_2_days"],
                    "applications_last_week": app_stats["week"],
                    "applications_last_month": app_stats["last_month"],
                },
            },
        })

class AdminCompanyListView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType] enable in prod
    def get(self, request):
        queryset = CompanyVerification.objects.select_related('employer')
        serializer = AdminCompanySerializer(queryset, many=True)
        return Response(serializer.data)
 
 
class UpdateCompanyStatusView(APIView):
 
    STATUS_TRANSITIONS = {
        "Pending": ["Verified", "Reject", "Hold"],
        "Hold": ["Verified", "Reject","Pending"],
        "Reject": ["Pending","Hold","Verified"],
        "Verified": []
    }
 
    def patch(self, request, pk):
        try:
            obj = CompanyVerification.objects.get(id=pk)
        except CompanyVerification.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=status.HTTP_404_NOT_FOUND
            )
 
        # 🔹 Only status allowed
        if set(request.data.keys()) != {"status"}:
            return Response(
                {"error": "Only 'status' field is allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        new_status = request.data.get("status")
 
        valid_values = [choice[0] for choice in CompanyVerification.STATUS_CHOICES]
 
        # Validate value
        if new_status not in valid_values:
            return Response(
                {"error": f"Invalid value. Allowed: {valid_values}"},
                status=status.HTTP_400_BAD_REQUEST
            )
 
        #  Transition check
        allowed = self.STATUS_TRANSITIONS.get(obj.status, [])
 
        if new_status not in allowed:
            return Response(
                {
                    "error": f"Cannot change from {obj.status} to {new_status}",
                    "allowed": allowed
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
        previous = obj.status
        obj.status = new_status
        obj.save()
 
        return Response({
            "message": "Updated successfully",
            "previous": previous,
            "current": obj.status
        })


#user management
 
 
class UserListView(APIView):
 
    def get(self, request):
        search = request.query_params.get('search', '').strip().lower()
 
        # 🔹 Base queryset
        users = User.objects.exclude(
            user_type=User.UserType.ADMIN
        ).select_related(
            'jobseeker_profile',
            'employer_profile'
        ).order_by('-date_joined')
 
        if search:
       
            users_name = users.filter(
                Q(jobseeker_profile__full_name__icontains=search) |
                Q(employer_profile__full_name__icontains=search)
            )
 
            if users_name.exists():
                users = users_name
 
            else:
               
                users_email = users.filter(email__icontains=search)
 
                if users_email.exists():
                    users = users_email
 
                else:
                   
                    if search in ["candidate", "jobseeker"]:
                        users = users.filter(user_type=User.UserType.JOBSEEKER)
 
                    elif search == "employer":
                        users = users.filter(user_type=User.UserType.EMPLOYER)
 
                    else:
                        users = users.none()  # nothing found
 
       
        serializer = UserListSerializer(users, many=True)
 
        return Response(serializer.data, status=status.HTTP_200_OK)
   
 
class UserStatusUpdateView(APIView):
 
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def patch(self, request, pk):
        try:
            user = get_object_or_404(User, pk=pk)
 
           
            if 'status' not in request.data:
                return Response(
                    {"error": "Status field is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            serializer = UserStatusUpdateSerializer(
                user, data=request.data, partial=True
            )
          #two option only show
            if serializer.is_valid():
                serializer.save()
 
                return Response(
                    {
                        "message": f"User status updated to '{serializer.validated_data.get('status')}'",
                        "id": user.id,
                        "status": serializer.validated_data.get('status')
                    },
                    status=status.HTTP_200_OK
                )
 
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
        except Exception as e:
            return Response(
                {
                    "error": "Something went wrong",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
 
 
 
class UserStatsView(APIView):
   
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        all_users = User.objects.all()
 
        stats = all_users.aggregate(
                totalUsers=Count('id'),
                activeNow=Count('id', filter=Q(status=User.AccountStatus.ACTIVE)),
                candidates=Count('id', filter=Q(user_type=User.UserType.JOBSEEKER)),
                employers=Count('id', filter=Q(user_type=User.UserType.EMPLOYER)),
            )
        return Response(stats, status=status.HTTP_200_OK)
 
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AJob
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AJob

class AJobListView(APIView):
    permission_classes = [IsAdminUserType]
    def get(self, request):
        jobs = AJob.objects.all().order_by('-created_at')
 
        job_data = []
        
        for job in jobs:
            job_data.append({
                "title": job.title,
                "company": job.company.name,
                "new": 100,      # replace later with real logic
                "waiting": 20,
                "total": 200
            })
        
        return Response(job_data, status=status.HTTP_200_OK)
# job monitoring
class AdminJobListView(APIView):
    """Admin view to get all jobs with approval & verification status"""
    permission_classes = [IsAdminUserType]
 
    def get(self, request):
        # 🔍 Optional filters
        approval_status = request.query_params.get("status")   # pending / approved / rejected
        search = request.query_params.get("search")
 
        jobs = PostAJob.objects.all().select_related('employer').order_by('-created_at')
 
        # Filter by approval status
        if approval_status:
            jobs = jobs.filter(approval_status=approval_status)
 
        # Search by job title
        if search:
            jobs = jobs.filter(job_title__icontains=search)
 
        job_data = []
 
        for job in jobs:
 
            # Safe company name
            company_name = "N/A"
            if hasattr(job.employer, "employer_profile") and job.employer.employer_profile.company:
                company_name = job.employer.employer_profile.company.company_name
 
            # Get company verification status safely
            verification = CompanyVerification.objects.filter(
                employer=job.employer
            ).first()
 
            verification_status = verification.status if verification else "Not Verified"
 
            job_data.append({
                "id": job.id,
                "job_title": job.job_title,
                "company_name": company_name,
 
                # NEW IMPORTANT FIELD
                "approval_status": job.approval_status,
 
                "job_status": job.job_status,
                "is_published": job.is_published,
                "flagged": job.flagged,
 
                "created_at": job.created_at,
                "location": job.location,
                "experience": job.experience,
                "salary": job.salary,
                "work_type": job.work_type,
                "openings": job.openings,
                "key_skills": job.key_skills,
 
                "applicants_count": job.applications.count(),
 
                "company_verification_status": verification_status,
 
                "employer_email": job.employer.email,
                "employer_username": job.employer.username,
                "job_highlights":job.job_highlights,
                "job_description":job.job_description,
                "responsibilities":job.responsibilities,
                "is_highlighted": job.is_highlighted,          
                "highlighted_at": job.highlighted_at,
            })
 
        return Response({
            "total_jobs": jobs.count(),
            "jobs": job_data
        }, status=status.HTTP_200_OK)
 
 
class AdminJobApproveView(APIView):
    """Admin approve a job (make it live)"""
    permission_classes = [IsAdminUserType]
 
    def patch(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
 
        # Check company verification
        verification = CompanyVerification.objects.filter(
            employer=job.employer,
            status__iexact='Verified'   # safer than 'Verified'
        ).exists()
 
        if not verification:
            return Response({
                "error": "Cannot approve job. Company is not verified."
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # Prevent duplicate approval
        if job.approval_status == PostAJob.ApprovalStatus.APPROVED:
            return Response({
                "message": "Job is already approved"
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # MAIN APPROVAL LOGIC
        job.approval_status = PostAJob.ApprovalStatus.APPROVED
        job.is_published = True
        job.approved_by = request.user
        job.approved_at = timezone.now()
        job.save()
 
        # NOTIFY EMPLOYER
        Notification.objects.create(
            user=job.employer,
            message=f"Your job '{job.job_title}' has been approved and is now live.",
            notification_type="job_approved",
            job=job
        )
 
        return Response({
            "message": "Job approved successfully",
            "job_id": job.id,
            "status": "approved",
            "is_published": job.is_published
        }, status=status.HTTP_200_OK)
 
 
 
class AdminJobRejectView(APIView):
    """Admin reject a job (hide it from job seekers)"""
    permission_classes = [IsAdminUserType]
 
    def patch(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
 
        # Get reject reason
        reason = request.data.get(
            'reason',
            'Job posting does not meet our guidelines.'
        )
 
        # Prevent duplicate rejection
        if job.approval_status == PostAJob.ApprovalStatus.REJECTED:
            return Response({
                "message": "Job is already rejected"
            }, status=status.HTTP_400_BAD_REQUEST)
 
        # MAIN REJECTION LOGIC
        job.approval_status = PostAJob.ApprovalStatus.REJECTED
        job.is_published = False
        job.save()
 
        # NOTIFY EMPLOYER
        Notification.objects.create(
            user=job.employer,
            message=f"Your job '{job.job_title}' was rejected. Reason: {reason}",
            notification_type="job_rejected",
            job=job
        )
 
        return Response({
            "message": "Job rejected successfully",
            "job_id": job.id,
            "status": "rejected",
            "is_published": job.is_published,
            "reason": reason
        }, status=status.HTTP_200_OK)
 
 
class AdminJobFlagView(APIView):
    """Admin flag/unflag a job for review"""
    permission_classes = [IsAdminUserType]
   
    def patch(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
       
        # Toggle flagged status
        job.flagged = not job.flagged
        job.save()
       
        # If flagged, notify employer
        if job.flagged:
            Notification.objects.create(
                user=job.employer,
                message=f"Your job '{job.job_title}' has been flagged for review by admin.",
                notification_type='system'
            )
       
        return Response({
            "message": f"Job {'flagged' if job.flagged else 'unflagged'} successfully",
            "job_id": job.id,
            "flagged": job.flagged
        }, status=status.HTTP_200_OK)
 
 
class AdminJobDeleteView(APIView):
    """Admin permanently delete a job"""
    permission_classes = [IsAdminUserType]
   
    def delete(self, request, pk):
        job = get_object_or_404(PostAJob, pk=pk)
        job_title = job.job_title
       
        # Notify employer before deletion
        Notification.objects.create(
            user=job.employer,
            message=f"Your job '{job_title}' has been permanently deleted by admin.",
            notification_type='system'
        )
       
        job.delete()
       
        return Response({
            "message": f"Job '{job_title}' deleted successfully"
        }, status=status.HTTP_200_OK)
 
 
class AdminJobStatsView(APIView):
    """Get job statistics for admin dashboard"""
    permission_classes = [IsAdminUserType]
   
    def get(self, request):
        today = timezone.now().date()
        week_start = today - timedelta(days=7)
       
        stats = {
            'total_jobs': PostAJob.objects.count(),
            'published_jobs': PostAJob.objects.filter(is_published=True).count(),
            'draft_jobs': PostAJob.objects.filter(is_published=False).count(),
            'flagged_jobs': PostAJob.objects.filter(flagged=True).count(),
            'jobs_today': PostAJob.objects.filter(created_at__date=today).count(),
            'jobs_this_week': PostAJob.objects.filter(created_at__date__gte=week_start).count(),
            'jobs_by_status': {
                'hiring_in_progress': PostAJob.objects.filter(job_status='Hiring in Progress').count(),
                'reviewing_application': PostAJob.objects.filter(job_status='Reviewing Application').count(),
                'hiring_done': PostAJob.objects.filter(job_status='Hiring Done').count(),
            }
        }
       
        return Response(stats, status=status.HTTP_200_OK)  

class JobHighlightLimitView(APIView):
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        user = request.user
 
        print("Logged in user:", user.email)
 
        subscription = Subscription.objects.filter(
            user=user,
            status='active'
        ).select_related('plan').first()
 
        print("Subscription:", subscription)
 
        if not subscription:
            return Response({
                "plan": "No Plan",
                "total": 0,
                "used": 0,
                "remaining": 0,
                "message": "No active subscription plan"
            })
 
        total_limit = subscription.plan.highlight_limit
 
        used_highlights = PostAJob.objects.filter(
            employer=user,
            is_highlighted=True
        ).count()
 
        remaining = total_limit - used_highlights
 
        return Response({
            "plan": subscription.plan.name,
            "total": total_limit,
            "used": used_highlights,
            "remaining": max(0, remaining)
        })      
    
class AdminDashboardStats(APIView):
    permission_classes = [IsAdminUserType]
 
    def get(self, request):
        data = {
            "total_jobs": PostAJob.objects.count(),
            "total_companies": CompanyProfile.objects.count(),
            "total_employers": User.objects.filter(user_type='employer').count(),
            "total_jobseekers": User.objects.filter(user_type='jobseeker').count(),
            "total_applications": JobApplication.objects.count(),
            "pending_verifications": CompanyVerification.objects.filter(status='Pending').count(),
        }
        return Response(data)

# ============ ADMIN DASHBOARD WIDGETS ============

class AdminDashboardOverviewView(APIView):
    """
    Powers two widgets on the Admin Dashboard:
    1. Top Experience Levels  — applicants bucketed by years of experience
    2. Total Overview         — donut chart of application pipeline stages
    """
    permission_classes = [IsAdminUserType]

    def get(self, request):

        # ── 1. TOTAL OVERVIEW (donut chart) ──────────────────────────────────
        # Map your JobApplication.Status values to the frontend labels
        from django.db.models import Count

        application_counts = JobApplication.objects.aggregate(
            applicants   = Count('id', filter=Q(status=JobApplication.Status.APPLIED)),
            recommended  = Count('id', filter=Q(status=JobApplication.Status.RECRUITER_REVIEW)),
            shortlisted  = Count('id', filter=Q(status=JobApplication.Status.SHORTLISTED)),
            interview    = Count('id', filter=Q(status=JobApplication.Status.INTERVIEW_CALLED)),
            rejected     = Count('id', filter=Q(status=JobApplication.Status.REJECTED)),
            hired        = Count('id', filter=Q(status=JobApplication.Status.HIRED)),
        )

        total_candidates = sum(application_counts.values())

        total_overview = {
            "total_candidates": total_candidates,
            "recommended": application_counts["recommended"],
            "shortlisted": application_counts["shortlisted"],
            "applicants":  application_counts["applicants"],
            "interview":   application_counts["interview"],
            "rejected":    application_counts["rejected"],
            "hired":       application_counts["hired"],
        }

        # ── 2. TOP EXPERIENCE LEVELS (bar chart) ─────────────────────────────
        # Uses total_experience_years on JobSeekerProfile
        # Buckets:  Entry (0–1), Junior (1–3), Mid (3–6), Senior (6+)

        from .models import JobSeekerProfile

        profiles = JobSeekerProfile.objects.filter(
            total_experience_years__isnull=False
        ).values_list('total_experience_years', flat=True)

        entry  = sum(1 for y in profiles if float(y) <= 1)
        junior = sum(1 for y in profiles if 1 < float(y) <= 3)
        mid    = sum(1 for y in profiles if 3 < float(y) <= 6)
        senior = sum(1 for y in profiles if float(y) > 6)

        max_count = max(entry, junior, mid, senior, 1)  # avoid div-by-zero

        experience_levels = [
            {
                "label":      "Entry Level",
                "count":      entry,
                "percentage": round((entry / max_count) * 100),
            },
            {
                "label":      "Junior Level",
                "count":      junior,
                "percentage": round((junior / max_count) * 100),
            },
            {
                "label":      "Mid Level",
                "count":      mid,
                "percentage": round((mid / max_count) * 100),
            },
            {
                "label":      "Senior Level",
                "count":      senior,
                "percentage": round((senior / max_count) * 100),
            },
        ]

        return Response({
            "experience_levels": experience_levels,
            "total_overview":    total_overview,
        }, status=status.HTTP_200_OK)
    
 
class JobApplicationReportView(APIView):
    #permission_classes = [IsAuthenticated, IsAdminUserType]
 
    def get(self, request):
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        one_year_ago = now - timedelta(days=365)
 
 
 
#for stats
 
 
        # LIVE JOBS
        live_now = PostAJob.objects.filter(
            is_published=True
        ).exclude(
            job_status=PostAJob.JobStatus.HIRING_DONE
        ).count()
 
        live_ly = PostAJob.objects.filter(
            is_published=True,
            created_at__lte=one_year_ago
        ).exclude(
            job_status=PostAJob.JobStatus.HIRING_DONE
        ).count()
 
 
        # CLOSED JOBS (using created_at)
        closed_30d = PostAJob.objects.filter(
            job_status=PostAJob.JobStatus.HIRING_DONE,
            created_at__gte=last_30_days
        ).count()
 
        closed_30d_ly = PostAJob.objects.filter(
            job_status=PostAJob.JobStatus.HIRING_DONE,
            created_at__gte=(last_30_days - timedelta(days=365)),
            created_at__lte=(now - timedelta(days=365))
        ).count()
 
 
        # APPLICATIONS
        apps_now = JobApplication.objects.count()
 
        apps_ly = JobApplication.objects.filter(
            applied_date__lte=one_year_ago
        ).count()
 
 
        # HELPERS INLINE
        def pct_change(current, previous):
            if previous == 0:
                return None
            return round((current - previous) / previous * 100, 1)
 
        '''def trend(pct):
            if pct is None or pct == 0:
                return "neutral"
            return "up" if pct > 0 else "down"'''
 
        def display(pct):
            if pct is None:
                return "N/A"
            if pct > 0:
                return f"+{pct}% vs LY"
            if pct < 0:
                return f"{pct}% vs LY"
            return "Neutral"
 
 
        # CALCULATE
        live_pct = pct_change(live_now, live_ly)
        closed_pct = pct_change(closed_30d, closed_30d_ly)
        apps_pct = pct_change(apps_now, apps_ly)
 
 
# for offer_conversion_rate
 
        offered = JobApplication.objects.filter(
            status__in=["offered", "hired"]
        ).count()
 
        total_apps = JobApplication.objects.count()
 
        rate = round((offered / total_apps) * 100, 1) if total_apps else 0
 
        # LABEL LOGIC
        if rate >= 50:
            label = "Very High"
        elif rate >= 25 :
            label = "High"
        elif rate >= 10:
            label = "Moderate"
        else:
            label = "Low"
 
 
#table_data need to confirm
 
       
 
 #  FLAGGED APPLICATIONS TABLE
 
        flags = ApplicationFlag.objects.select_related(
            "application__user",
            "application__job"
        ).order_by("-created_at")
 
        table_data = [
    {
        "flagId": f.id,  
        "id": f"#USR-{f.application.user.id}" if f.application.user else "#USR-0000",
        "jobId": f"#JOB-{f.application.job.id}" if f.application.job else "#JOB-0000",
        "reason": f.flag_reason.replace("_", " ").upper(),
        "method": f.detected_method,
        "risk": f.risk_level.upper(),
        "isRead": f.is_reviewed
    }
    for f in flags
]
 #  NEW FLAGS COUNT
       
        new_flags = ApplicationFlag.objects.filter(
            is_reviewed=False
        ).count()
 
 
 
#catogoeries
       
 
        SUPPORTED_ICONS =  {
                "fullstack": "Fullstack Dev",
                "fullstack dev": "Fullstack Dev",
                "fullstack developer": "Fullstack Dev",
 
                "cloud architect": "Cloud Architect",
                "cloud_architect": "Cloud Architect",
 
                "product design": "Product Design",
                "product_design": "Product Design",
            }
 
        categories_qs = PostAJob.objects.values("job_category").annotate(
            count=Count("id")
        )
 
        total_jobs = PostAJob.objects.count()
 
        categories_data = []
 
        for index, item in enumerate(categories_qs, start=1):
 
            raw_name = str(item["job_category"] or "").strip()
 
            normalized_key = raw_name.lower()
 
            icon_key = SUPPORTED_ICONS.get(
                normalized_key,
                "Other"
            )
 
            percentage = (
                round((item["count"] / total_jobs) * 100)
                if total_jobs else 0
            )
 
            categories_data.append({
                "id": index,
                "name": icon_key,          
                "other_name": raw_name,   # safe for debug  
                "percentage": percentage,
            })
 
 
       
 # FUNNEL DATA
       
 
        applied_statuses = {
            "applied",
            "resume_screening",
            "recruiter_review"
        }
 
        funnel_buckets = {}
 
        # only fetch required fields
        applications_for_funnel = JobApplication.objects.values(
            "status",
            "job__department"
        )
 
       
       
 
        for app in applications_for_funnel:
 
            department_raw = app.get("job__department")
 
            # if department stored as list
            if isinstance(department_raw, list) and department_raw:
                primary_department = department_raw[0]
            else:
                primary_department = department_raw
 
            # fallback
            department_display = (
                str(primary_department).strip()
                if primary_department
                else "Other"
            )
 
            # frontend style
            department_key = department_display.upper()
 
            # create bucket if not exists
            if department_key not in funnel_buckets:
                funnel_buckets[department_key] = {
                    "department": department_key,
                    "departmentDisplay": department_display,
                    "total": 0,
                    "applied": 0,
                    "interviewed": 0,
                    "offered": 0,
                }
 
            bucket = funnel_buckets[department_key]
 
            # total applications
            bucket["total"] += 1
 
            status_value = app.get("status")
 
           
 
            if status_value in applied_statuses:
                bucket["applied"] += 1
 
 
            if status_value == "interview_called":
                bucket["interviewed"] += 1
 
           
 
            if status_value in {"offered", "hired"}:
                bucket["offered"] += 1
 
 
 
 
        funnel_data = []
 
        for bucket in sorted(
            funnel_buckets.values(),
            key=lambda item: (-item["total"], item["department"])
        ):
 
            total = bucket["total"]
 
            if not total:
                continue
 
            funnel_data.append({
                "department": bucket["department"],
                #"departmentDisplay": bucket["departmentDisplay"],  # no needed for integration
                "totalApps": f"{total:,}",
                #"totalAppsCount": total, # no needed for integration
                "appliedPct": round(
                    (bucket["applied"] / total) * 100
                ),
                "interviewedPct": round(
                    (bucket["interviewed"] / total) * 100
                ),
                "offeredPct": round(
                    (bucket["offered"] / total) * 100
                ),
            })
 
 
        return Response({
    "stats": [
        {
            "label": "Live Job Postings",
            "value": f"{live_now:,}",
            "change": display(live_pct)
        },
        {
            "label": "Closed (Last 30d)",
            "value": f"{closed_30d:,}",
            "change": display(closed_pct)
        },
        {
            "label": "Applications Submitted",
            "value": f"{apps_now:,}",
            "change": display(apps_pct)
        }
    ],
    "offer_conversion_rate": {
        "value": rate,
        "label": label
    },
    "tableData": table_data,
    "newFlags": new_flags,
    "categories": categories_data,
    "funnelData": funnel_data
   
    })
           
 
 # for changing is read
 
 
class ApplicationFlagReadStatusView(APIView):
 
    def patch(self, request, flag_id):
 
        try:
            flag = ApplicationFlag.objects.get(id=flag_id)
 
        except ApplicationFlag.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Flag not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )
 
       
        if flag.is_reviewed:
            return Response(
                {
                    "success": False,
                    "message": "Flag already marked as read",
                    "data": {
                        "flagId": flag.id,
                        "isRead": True
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )
 
       
        flag.is_reviewed = True
        flag.save(update_fields=["is_reviewed"])
 
        return Response(
            {
                "success": True,
                "message": "Flag marked as read successfully",
                "data": {
                    "flagId": flag.id,
                    "isRead": True
                }
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# ADD THESE TO THE BOTTOM OF YOUR EXISTING views.py
# Also add Role, Module, Permission to your models import line
# Also add RoleSerializer, PermissionSerializer, EmployerRoleSerializer
# to your serializers import line
# ============================================================

from .models import Role, Module, Permission
from .serializers import RoleSerializer, PermissionSerializer, EmployerRoleSerializer


# ── GET all roles (with live user_count + permissions) ──────────────────────
class RoleListView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request):
        roles = Role.objects.prefetch_related('permissions__module').all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── CREATE a new role (also auto-creates permission rows for all modules) ────
class RoleCreateView(APIView):
    permission_classes = [IsAdminUserType]

    def post(self, request):
        name        = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()

        if not name:
            return Response(
                {"error": "Role name is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Role.objects.filter(name__iexact=name).exists():
            return Response(
                {"error": f"Role '{name}' already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        role = Role.objects.create(name=name, description=description)

        # Auto-create a default permission row (all False) for every module
        modules = Module.objects.all()
        for module in modules:
            Permission.objects.create(
                role=role,
                module=module,
                read=False, create=False, update=False, delete=False
            )

        serializer = RoleSerializer(role)
        return Response(
            {"message": f"Role '{name}' created successfully.", "role": serializer.data},
            status=status.HTTP_201_CREATED
        )


# ── DELETE a role ────────────────────────────────────────────────────────────
class RoleDeleteView(APIView):
    permission_classes = [IsAdminUserType]

    def delete(self, request, role_id):
        role = get_object_or_404(Role, id=role_id)

        # Prevent deleting built-in roles
        if role.name.lower() in ['candidate', 'employer']:
            return Response(
                {"error": "Built-in roles cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        role.delete()
        return Response(
            {"message": f"Role deleted successfully."},
            status=status.HTTP_200_OK
        )


# ── GET permissions for a specific role ──────────────────────────────────────
class RolePermissionView(APIView):
    permission_classes = [IsAdminUserType]

    def get(self, request, role_id):
        role = get_object_or_404(Role, id=role_id)
        permissions = Permission.objects.filter(role=role).select_related('module')
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── UPDATE a single permission row (toggle read/create/update/delete) ────────
class UpdatePermissionView(APIView):
    permission_classes = [IsAdminUserType]

    def patch(self, request, permission_id):
        # get_object_or_404 — safe, no DoesNotExist crash
        permission = get_object_or_404(Permission, id=permission_id)

        serializer = PermissionSerializer(
            permission,
            data=request.data,
            partial=True   # allows sending only the fields you want to change
        )

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Permission updated successfully.", "permission": serializer.data},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ── BULK UPDATE all permissions for a role (from the Save button) ────────────
class BulkUpdatePermissionsView(APIView):
    """
    Frontend sends the entire permission table state on 'Edit Permissions' click.

    Expected body:
    {
        "permissions": [
            { "id": 1, "read": true, "create": false, "update": true, "delete": false },
            { "id": 2, "read": false, "create": true, "update": false, "delete": false },
            ...
        ]
    }
    """
    permission_classes = [IsAdminUserType]

    def patch(self, request, role_id):
        get_object_or_404(Role, id=role_id)  # confirm role exists

        permissions_data = request.data.get('permissions', [])

        if not permissions_data:
            return Response(
                {"error": "No permissions data provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        updated = []
        errors  = []

        for item in permissions_data:
            perm_id = item.get('id')
            perm = Permission.objects.filter(id=perm_id, role_id=role_id).first()

            if not perm:
                errors.append(f"Permission id={perm_id} not found for this role.")
                continue

            perm.read   = item.get('read',   perm.read)
            perm.create = item.get('create', perm.create)
            perm.update = item.get('update', perm.update)
            perm.delete = item.get('delete', perm.delete)
            perm.save()
            updated.append(perm_id)

        return Response({
            "message": f"{len(updated)} permissions updated.",
            "updated": updated,
            "errors":  errors
        }, status=status.HTTP_200_OK)


# ── GET employer list for RoleManagement (reads REAL data) ───────────────────
class EmployerRoleListView(APIView):
    """
    Returns real employer users with their company, subscription status,
    and join date. Used by the Employers table inside Role Management.
    """
    permission_classes = [IsAdminUserType]

    def get(self, request):
        employers = User.objects.filter(
            user_type='employer'
        ).select_related(
            'employer_profile__company'
        ).prefetch_related(
            'subscription_set'
        ).order_by('-date_joined')

        serializer = EmployerRoleSerializer(employers, many=True)
        return Response({
            "total": employers.count(),
            "employers": serializer.data
        }, status=status.HTTP_200_OK)


# ── DELETE an employer user (from the trash button) ──────────────────────────
class EmployerRoleDeleteView(APIView):
    permission_classes = [IsAdminUserType]

    def delete(self, request, pk):
        employer = get_object_or_404(User, id=pk, user_type='employer')
        employer.delete()
        return Response(
            {"message": "Employer deleted successfully."},
            status=status.HTTP_200_OK
        )