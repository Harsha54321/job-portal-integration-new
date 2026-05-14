import random
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
        reset_page = f"{frontend_url}/Job-portal/login/forgotpassword/createpassword?token={token}"
   
    subject = f'Password Reset Request - {user.get_user_type_display()} Account'
    message = f"""
Hello {user.username},
 
We received a request to reset your password for your {user.get_user_type_display()} account: {user.email}
 
Please visit this link:
{reset_page}
 
And enter this token on the page:
 
 
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

def generate_company_otp():
    """Generate a 6-digit OTP for company email verification"""
    import random
    return str(random.randint(100000, 999999))

def send_company_email_otp(email, otp, company_name):
    """Send OTP to company email for verification"""
    from django.core.mail import send_mail
    from django.conf import settings
    
    subject = f"Verify your company email - {company_name}"
    message = f"""
Hello,

Your OTP for verifying company email {email} is: {otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.

Thank you,
Job Portal Team
"""
    
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )    
 
# OTP Functions
 
def generate_otp():
    """Generate a 6-digit OTP for signup"""
    return str(random.randint(100000, 999999))
 
def generate_4digit_otp():
    """Generate a 4-digit OTP for login"""
    return str(random.randint(1000, 9999))
 
def send_email_otp(email, otp, purpose="signup"):
    """Send OTP email based on purpose"""
   
    if purpose == "signup" or purpose == "email_verification":
        subject = "Email Verification OTP"
        expiry = "10 minutes"
        digits = "6-digit"
        message = f"""
Hello,
 
Your {digits} OTP for email verification is: {otp}
 
This OTP will expire in {expiry}.
 
If you didn't request this, please ignore this email.
"""
    elif purpose == "login":
        subject = "Login OTP"
        expiry = "5 minutes"
        digits = "4-digit"
        message = f"""
Hello,
 
Your {digits} OTP for login is: {otp}
 
This OTP will expire in {expiry}.
 
If you didn't request this, please ignore this email.
"""
    else:
        subject = "OTP Verification"
        expiry = "10 minutes"
        message = f"""
Hello,
 
Your OTP is: {otp}
 
This OTP will expire in {expiry}.
"""
 
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

# Billing
# jobapp/utils.py
import uuid
import os
from decimal import Decimal
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.pagesizes import letter

def generate_invoice_number():
    """Generate a unique invoice number"""
    return f"INV-{uuid.uuid4().hex[:6].upper()}"

def calculate_gst(amount):
    """Calculate 18% GST on amount"""
    # Convert to Decimal if needed
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))
    
    gst_rate = Decimal('0.18')
    gst = amount * gst_rate
    total = amount + gst
    return round(gst, 2), round(total, 2)

def generate_invoice_pdf(invoice):
    """Generate PDF invoice"""
    directory = "media/invoices"
    
    # Create folder
    os.makedirs(directory, exist_ok=True)
    
    file_path = os.path.join(directory, f"{invoice.invoice_number}.pdf")
    
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    
    elements = [
        Paragraph(f"Invoice: {invoice.invoice_number}", None),
        Paragraph(f"Customer: {invoice.company_name}", None),
        Paragraph(f"Total: ₹{invoice.total}", None),
    ]
    
    doc.build(elements)
    return file_path