import secrets
from django.core.mail import send_mail
from django.conf import settings
 
def generate_token():
    """Generate a secure token"""
    return secrets.token_urlsafe(32)
 
def send_password_reset_email(user, token, request):
    """Send password reset email with different links based on user type"""
   
    frontend_url = settings.FRONTEND_URL
   
    if user.user_type == 'employer':
        reset_page = f"{frontend_url}/Job-portal/employer/login/forgotpassword/createpassword?token={token}"
    elif user.user_type == 'jobseeker':
        reset_page = f"{frontend_url}/Job-portal/jobseeker/login/forgotpassword/createpassword?token={token}"
    else:
       
        reset_page = f"{frontend_url}/Job-portal/login/forgotpassword/createpassword"
   
    subject = f'Password Reset Request - {user.get_user_type_display()} Account'
    message = f"""
Hello {user.username},
 
We received a request to reset your password for your {user.get_user_type_display()} account: {user.email}
 
Please visit this link:
{reset_page}
 
And enter this token on the page:
{token}
 
This token will expire in 24 hours.
 
If you didn't request this, please ignore this email.
"""   
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )