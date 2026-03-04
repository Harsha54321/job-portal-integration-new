# views.py (only user + profile)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    JobSeekerRegistrationSerializer,
    EmployerRegistrationSerializer,
    JobSeekerProfileReadSerializer,
    JobSeekerProfileWriteSerializer,
    EmployerProfileReadSerializer,
    EmployerProfileWriteSerializer,
    UserReadSerializer  ,
    JobApplicationDetailSerializer,
    NotificationSerializer ,CustomTokenObtainPairSerializer
)


class JobSeekerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = JobSeekerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Jobseeker registered successfully",
                "user": UserReadSerializer(user).data  
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployerRegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmployerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Employer registered successfully",
                "user": UserReadSerializer(user).data  
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

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


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from jobapp.models import JobSeekerProfile
from jobapp.serializers import (
    JobSeekerProfileReadSerializer,
    JobSeekerProfileWriteSerializer
)

class JobSeekerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JobSeekerProfileReadSerializer
        return JobSeekerProfileWriteSerializer

    def get_object(self):
        """
        Safely get or create JobSeekerProfile.
        NEVER use hasattr() for OneToOne fields.
        """

        profile, created = JobSeekerProfile.objects.get_or_create(
            user=self.request.user
        )

        # Optional: block employers explicitly
        if not hasattr(self.request.user, 'jobseeker'):
            # remove this if you don't have a separate role system
            pass

        return profile

    
    


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
    

    
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Company, Job, JobApplication, SavedJob, Notification
from .serializers import (
    CompanySerializer, JobReadSerializer, JobWriteSerializer,
    JobApplicationWriteSerializer, SavedJobSerializer,
    JobApplicationEmployerSerializer, JobApplicationListSerializer ,JobUpdateSerializer
)



# Company Views

class CompanyListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CompanySerializer

    def get_queryset(self):
        # Public only sees active companies
        return Company.objects.filter(is_active=True)


class CompanyDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = CompanySerializer
    queryset = Company.objects.filter(is_active=True)


class CompanyCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'employer_profile'):
            raise PermissionDenied("Only employers can create companies.")
        company = serializer.save()
        # Auto-link to employer profile
        employer_profile = self.request.user.employer_profile
        employer_profile.company = company
        employer_profile.save()


class CompanyLinkView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer

    def get_object(self):
        if not hasattr(self.request.user, 'employer_profile'):
            raise PermissionDenied("Only employers can link companies.")
        return self.request.user.employer_profile

    def perform_update(self, serializer):
        company_id = self.request.data.get('company_id')
        if not company_id:
            raise ValidationError({"company_id": "This field is required to link a company."})

        try:
            company = Company.objects.get(id=company_id, is_active=True)
        except Company.DoesNotExist:
            raise ValidationError({"company_id": "Company not found or inactive."})

        serializer.instance.company = company
        serializer.instance.save()


# Employer can edit their own company details


class CompanyEditView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanySerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return Company.objects.none()
        # Only allow editing the company linked to this employer
        employer_company = user.employer_profile.company
        if not employer_company:
            return Company.objects.none()
        return Company.objects.filter(id=employer_company.id)

    def perform_update(self, serializer):
        # Optional: extra permission check (already handled by queryset)
        serializer.save()


# Admin: Disable/Enable Company
class AdminCompanyToggleActiveView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CompanySerializer
    queryset = Company.objects.all()

    def perform_update(self, serializer):
        company = serializer.instance
        company.is_active = not company.is_active
        company.save()
        serializer.save()



# Job Views

from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.db.models import Q
from .models import Job
from .serializers import JobReadSerializer


class JobListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = JobReadSerializer

    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True)

        search = self.request.query_params.get("search")
        location = self.request.query_params.get("location")
        experience = self.request.query_params.get("experience")
        company_id = self.request.query_params.get("company")

        if company_id:
            queryset = queryset.filter(company_id=company_id)

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company__name__icontains=search)
            )

        if location:
            queryset = queryset.filter(location__icontains=location)

        if experience:
            queryset = queryset.filter(experience_required__icontains=experience)

        return queryset





class JobDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = JobReadSerializer
    queryset = Job.objects.filter(is_active=True)


class JobCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobWriteSerializer

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'employer_profile'):
            raise PermissionDenied("Only employers can post jobs.")
        employer_profile = self.request.user.employer_profile
        if not employer_profile.company:
            raise PermissionDenied("You must link a company before posting jobs.")
        serializer.save(posted_by=self.request.user, company=employer_profile.company)


class JobUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobUpdateSerializer 

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)


class JobDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobReadSerializer

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)


class JobToggleActiveView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobWriteSerializer

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)

    def perform_update(self, serializer):
        job = serializer.instance
        job.is_active = not job.is_active
        job.save()
        serializer.save()


# Job Application & Saved Jobs

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser


from .models import JobApplication, Notification
from .serializers import (
    JobApplicationWriteSerializer,
    JobApplicationDetailSerializer
)


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

        # Notify the employer 
        job = instance.job
        if job.posted_by and hasattr(job.posted_by, 'employer_profile'):
            Notification.objects.create(
                user=job.posted_by,
                message=f"New application received for '{job.title}' from {request.user.email}"
            )

        # Use the FULL detail serializer for response
        detail_serializer = JobApplicationDetailSerializer(instance)
        headers = self.get_success_headers(serializer.data)
        
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class AppliedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationListSerializer

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

from .models import SavedJob
from .serializers import SavedJobSerializer


class SaveJobView(APIView):
    permission_classes = [IsAuthenticated]

    # SAVE JOB
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

    # REMOVE SAVED JOB
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



from jobapp.models import SavedJob, JobApplication


class SavedJobsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedJobSerializer

    def get_queryset(self):
        return (
            SavedJob.objects
            .filter(user=self.request.user)
            .select_related("job", "job__company")
            .order_by("-saved_date")
        )


class WithdrawApplicationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationDetailSerializer  # ← use full serializer
    queryset = JobApplication.objects.all()

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        application = serializer.instance
        if application.status == JobApplication.Status.WITHDRAWN:
            raise ValidationError("Application is already withdrawn.")
        
        application.status = JobApplication.Status.WITHDRAWN
        application.save()
        
        # Return full updated details
        return Response(JobApplicationDetailSerializer(application).data)

# Employer: Applications for their jobs

class EmployerApplicationsListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
        # Jobs posted by this employer
        jobs = Job.objects.filter(posted_by=user)
        return JobApplication.objects.filter(job__in=jobs)
    
# Employer: Change application status
class EmployerApplicationStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationEmployerSerializer

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'employer_profile'):
            return JobApplication.objects.none()
        
        employer_company = user.employer_profile.company
        if not employer_company:
            return JobApplication.objects.none()
        
        # All applications for jobs in this company
        jobs = Job.objects.filter(company=employer_company)
        return JobApplication.objects.filter(job__in=jobs)

    def perform_update(self, serializer):
        application = serializer.instance
        old_status = application.status
        
        # Get new status from request data
        new_status = self.request.data.get('status')
        if not new_status:
            raise ValidationError({"status": "This field is required to update status."})
        
        if new_status not in [choice[0] for choice in JobApplication.Status.choices]:
            raise ValidationError({"status": f"Invalid status. Valid choices: {', '.join([c[0] for c in JobApplication.Status.choices])}"})
        
        # Prevent changing to same status (optional)
        if new_status == old_status:
            raise ValidationError({"status": "Application is already in this status."})
        
        # Update status
        application.status = new_status
        application.save()

        # Create notification for jobseeker
        Notification.objects.create(
            user=application.user,
            message=f"Your application for '{application.job.title}' has been updated to: {new_status.replace('_', ' ').title()}"
        )

        # Return full updated application
        return Response(JobApplicationEmployerSerializer(application).data)

# Notifications


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

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserSettings
from .serializers import UserSettingsSerializer


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

from rest_framework.generics import RetrieveAPIView
from .serializers import JobApplicationListSerializer



class JobApplicationDetailView(RetrieveAPIView):
    serializer_class = JobApplicationListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)



from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Conversation, Message
from .serializers import (
    ConversationSerializer, 
    MessageSerializer, 
    SendMessageSerializer,
    ChatUserSerializer
)

User = get_user_model()

# ============ CHAT CONVERSATIONS ============

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
        
        messages = conversation.messages.all()[:50]
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

# ============ CHAT MESSAGES ============

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

# ============ CHAT USERS ============

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
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ChatMessage
from .serializers import ChatMessageSerializer
import random

def generate_bot_reply(user_text):
    """
    Enhanced rule-based bot with dynamic responses
    """
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
 
 
@api_view(["POST"])
def chat_api(request):
    user_message = request.data.get("message")
 
    if not user_message:
        return Response({"error": "Message is required"}, status=400)
 
    # Save user message
    user_msg = ChatMessage.objects.create(
        sender="user",
        message=user_message
    )
 
    # Generate bot reply
    bot_reply_text = generate_bot_reply(user_message)
 
    # Save bot reply
    bot_msg = ChatMessage.objects.create(
        sender="bot",
        message=bot_reply_text
    )
 
    return Response({
        "user": ChatMessageSerializer(user_msg).data,
        "bot": ChatMessageSerializer(bot_msg).data
    })
 




 
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
 
from .models import HelpTopic, RaiseTicket 
from .serializers import HelpTopicSerializer, RaiseTicketSerializer
 
 
# Help Topics List API
@api_view(['GET'])
def help_topics(request):
    topics = HelpTopic.objects.all().order_by('-id')
    serializer = HelpTopicSerializer(topics, many=True)
    return Response({
        "status": True,
        "message": "Help topics fetched successfully",
        "data": serializer.data
    })
 
 
#  Raise Ticket Create API
class RaiseTicketCreateView(APIView):
 
 
    def get(self, request):
        return Response({
            "status": True,
            "message": "Raise Ticket API Working"
        })
 
    # Ticket Create
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


# Password
 
from django.utils import timezone
from datetime import timedelta
from .models import PasswordResetToken
from .utils import generate_token, send_password_reset_email
from .serializers import (
    ForgotPasswordSerializer, ResetPasswordConfirmSerializer,
    CreatePasswordSerializer
)
 
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
