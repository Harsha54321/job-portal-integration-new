from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    JobSeekerRegistrationView,
    EmployerRegistrationView,
    LoginView,
    LogoutView,
    JobSeekerProfileView,
    EmployerProfileView,
    MarkNotificationUnreadView,
    DeleteNotificationView,
    ClearAllNotificationsView,
    UserSettingsView,
    SaveJobView,
    JobApplicationDetailView,
    ConversationListView,
    ConversationDetailView,
    ConversationMessagesView,
    MarkConversationReadView,
    SendMessageView,
    UnreadCountView,
    ConversationWithUserView,
    MarkMessageReadView,
    ChatUsersView,
    EmployerInitiateChatView,
    chat_api,
    ForgotPasswordView,
    ResetPasswordConfirmView,
    CreatePasswordView,
    ValidateResetTokenView,
    AdminCreatePasswordTokenView,
    help_topics, 
    RaiseTicketCreateView
)
from . import views 
 

urlpatterns = [
    # Registration (open to everyone)
    path('register/jobseeker/', JobSeekerRegistrationView.as_view(), name='jobseeker-register'),
    path('register/employer/', EmployerRegistrationView.as_view(), name='employer-register'),

    # JWT Auth
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile (only authenticated users)
    path('profile/jobseeker/', JobSeekerProfileView.as_view(), name='jobseeker-profile'),
    path('profile/employer/', EmployerProfileView.as_view(), name='employer-profile'),

    # Companies
    path('companies/', views.CompanyListView.as_view(), name='company-list'),
    path('companies/<int:pk>/', views.CompanyDetailView.as_view(), name='company-detail'),
    path('companies/create/', views.CompanyCreateView.as_view(), name='company-create'),
    path('companies/link/', views.CompanyLinkView.as_view(), name='company-link'),  # PATCH to link existing
    path('companies/<int:pk>/edit/', views.CompanyEditView.as_view(), name='company-edit'),
    path('admin/companies/<int:pk>/toggle-active/', views.AdminCompanyToggleActiveView.as_view(), name='admin-company-toggle'),

    # Jobs
    path('jobs/', views.JobListView.as_view(), name='job-list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job-detail'),
    path('jobs/create/', views.JobCreateView.as_view(), name='job-create'),
    path('jobs/<int:pk>/update/', views.JobUpdateView.as_view(), name='job-update'),
    path('jobs/<int:pk>/delete/', views.JobDeleteView.as_view(), name='job-delete'),
    path('jobs/<int:pk>/toggle-active/', views.JobToggleActiveView.as_view(), name='job-toggle-active'),

    # Applications & Saved
    path('jobs/apply/', views.ApplyJobView.as_view(), name='job-apply'),
    path('jobs/applied/', views.AppliedJobsListView.as_view(), name='applied-jobs'),
    path('jobs/save/', views.SaveJobView.as_view(), name='job-save'),
    path('jobs/saved/', views.SavedJobsListView.as_view(), name='saved-jobs'),

    #Withdraw application
    path('jobs/applications/<int:pk>/withdraw/', views.WithdrawApplicationView.as_view(), name='withdraw-application'),

    # Employer sees applications
    path('jobs/applications/', views.EmployerApplicationsListView.as_view(), name='employer-applications'),
    path('jobs/applications/<int:pk>/status/', views.EmployerApplicationStatusUpdateView.as_view(), name='employer-application-status-update'),

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),

    path('notifications/<int:pk>/unread/', MarkNotificationUnreadView.as_view()),
    path('notifications/<int:pk>/delete/', DeleteNotificationView.as_view()),
    path('notifications/clear-all/', ClearAllNotificationsView.as_view()),
    
    path("settings/", UserSettingsView.as_view(), name="user-settings"),
    path("jobs/save/", SaveJobView.as_view(), name="save-job"),
    path("jobs/save/<int:job_id>/", SaveJobView.as_view(), name="remove-saved-job"),
    path("jobs/applications/<int:pk>/", JobApplicationDetailView.as_view()),




    # Conversations
    path('chat/conversations/', ConversationListView.as_view(), name='chat-conversations'),
    path('chat/conversations/<int:pk>/', ConversationDetailView.as_view(), name='chat-conversation-detail'),
    path('chat/conversations/<int:pk>/messages/', ConversationMessagesView.as_view(), name='chat-conversation-messages'),
    path('chat/conversations/<int:pk>/mark-read/', MarkConversationReadView.as_view(), name='chat-conversation-mark-read'),
    path('chat/messages/send/', SendMessageView.as_view(), name='chat-send-message'),
    path('chat/messages/unread/', UnreadCountView.as_view(), name='chat-unread-count'),
    path('chat/messages/<int:pk>/read/', MarkMessageReadView.as_view(), name='chat-mark-message-read'),
    path('chat/with-user/', ConversationWithUserView.as_view(), name='chat-with-user'),
    path('chat/users/', ChatUsersView.as_view(), name='chat-users'),
    path('chat/employer/initiate/', EmployerInitiateChatView.as_view(), name='employer-initiate-chat'),
    path("chat/", chat_api, name="chat_api"),
    # Password
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password-confirm/', ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),
    path('auth/create-password/', CreatePasswordView.as_view(), name='create-password'),
    path('auth/validate-reset-token/', ValidateResetTokenView.as_view(), name='validate-reset-token'),
    path('admin/create-password-token/', AdminCreatePasswordTokenView.as_view(), name='admin-create-password-token'),
    path('help-topics/', help_topics, name='help-topics'),
    path('raise-ticket/', RaiseTicketCreateView.as_view(), name='raise-ticket'),

]
 