from __future__ import annotations
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
    # Remove trailing slash if present
    frontend_url = frontend_url.rstrip('/')
   
    if user.user_type == 'employer':
        reset_page = f"{frontend_url}/Job-portal/employer/login/forgotpassword/createpassword?token={token}"
    elif user.user_type == 'jobseeker':
        reset_page = f"{frontend_url}/Job-portal/jobseeker/login/forgotpassword/createpassword?token={token}"
    elif user.user_type == 'admin':
        reset_page = f"{frontend_url}/Job-portal/admin/login/forgotpassword/createpassword?token={token}"
    else:
        reset_page = f"{frontend_url}/Job-portal/login/forgotpassword/createpassword?token={token}"
   
    subject = f'Password Reset Request - {user.get_user_type_display()} Account'
    message = f"""
Hello {user.username},
 
We received a request to reset your password for your {user.get_user_type_display()} account: {user.email}
 
Please click the link below to reset your password:
{reset_page}
 
This link will expire in 24 hours.
 
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
        message = f"Hello,\n\nYour {digits} OTP for email verification is: {otp}\n\nThis OTP will expire in {expiry}.\n\nIf you didn't request this, please ignore this email."
    elif purpose == "login":
        subject = "Login OTP"
        expiry = "5 minutes"
        digits = "4-digit"
        message = f"Hello,\n\nYour {digits} OTP for login is: {otp}\n\nThis OTP will expire in {expiry}.\n\nIf you didn't request this, please ignore this email."
    elif purpose in ["admin_2fa", "jobseeker_2fa"]:
        subject = "Your 2FA Verification Code"
        expiry = "5 minutes"
        digits = "6-digit"
        message = f"Hello,\n\nYour {digits} OTP for two-factor authentication is: {otp}\n\nThis OTP will expire in {expiry}.\n\nIf you didn't request this, please secure your account immediately."
    else:
        subject = "OTP Verification"
        expiry = "10 minutes"
        message = f"Hello,\n\nYour OTP is: {otp}\n\nThis OTP will expire in {expiry}."

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
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


import hashlib
import math
from collections import Counter
from dataclasses import dataclass
from typing import Optional
 
import PyPDF2
import docx
import requests
 
from .models import ApplicationFlag, JobApplication, CompanyVerification
 
 
# =========================================================
# CONSTANTS
# =========================================================
 
GENERIC_PHRASES = {
    "i am a passionate": 4,
    "results-driven professional": 4,
    "dynamic and motivated": 4,
    "proven track record": 3,
    "seeking a challenging position": 3,
    "excellent communication skills": 3,
    "highly motivated": 3,
    "i am responsible for": 3,
    "responsible for": 2,
    "team player": 2,
    "detail-oriented": 2,
    "fast learner": 2,
}
 
METHODS = {
    "IP_SHARED": "Multiple accounts using same IP address",
    "RESUME_PATTERN": "Pattern detection in resume content",
    "RESUME_SHORT": "Insufficient resume content detected",
    "RESUME_DUPLICATE": "Same resume used across multiple accounts",
    "DUPLICATE_APPLY": "Multiple applications submitted for same job",
}
 
SHARED_IP_THRESHOLD = 3
MIN_RESUME_CHARS = 200
MIN_COVER_CHARS = 50
IP_API_TIMEOUT = 3
 
 
# =========================================================
# DATA CLASS (NOW WITH RISK)
# =========================================================
 
@dataclass
class FraudSignal:
    flag_reason: str
    detected_method: str
    score: int
    risk_level: str  
 
 
# =========================================================
# FILE UTILITIES
# =========================================================
 
def extract_resume_text(file):
    if not file:
        return ""
 
    text = ""
    name = getattr(file, "name", "").lower()
 
    try:
        file.seek(0)
 
        if name.endswith(".pdf"):
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() or ""
 
        elif name.endswith(".docx"):
            doc = docx.Document(file)
            text = " ".join(p.text for p in doc.paragraphs)
 
    except Exception:
        return ""
 
    return text.lower()
 
 
def compute_resume_hash(file):
    if not file:
        return None
 
    try:
        file.seek(0)
        hash_val = hashlib.sha256(file.read()).hexdigest()
        file.seek(0)
        return hash_val
    except:
        return None
 
 
# =========================================================
# TEXT ANALYSIS
# =========================================================
 
def text_score(text):
    words = text.split()
    if not words:
        return 0
 
    freq = Counter(words)
    total = len(words)
 
    entropy = -sum((c / total) * math.log2(c / total) for c in freq.values())
    diversity = len(set(words)) / total
 
    phrase_score = sum(text.count(p) * w for p, w in GENERIC_PHRASES.items())
 
    score = 0
 
    if entropy < 3.5:
        score += 20
 
    if diversity < 0.35:
        score += 20
 
    if phrase_score > 10:
        score += 20
 
    return score
 
 
# =========================================================
# IP LOCATION
# =========================================================
 
def get_ip_country(ip):
    if not ip:
        return None
 
    try:
        res = requests.get(f"http://ip-api.com/json/{ip}", timeout=IP_API_TIMEOUT)
        return res.json().get("country")
    except:
        return None
 
 
# =========================================================
# ANALYZERS
# =========================================================
 
def analyze_ip(instance, ip):
    signals = []
 
    if not ip:
        return signals
 
    shared_count = JobApplication.objects.filter(
        ip_address=ip
    ).exclude(user=instance.user).values("user").distinct().count()
 
    if shared_count >= SHARED_IP_THRESHOLD:
        signals.append(FraudSignal(
            "IP_CONFLICT",
            METHODS["IP_SHARED"],
            40,
            "CRITICAL"
        ))
 
    return signals
 
 
def analyze_duplicate_application(instance):
    signals = []
 
    if JobApplication.objects.filter(
        user=instance.user,
        job=instance.job
    ).exclude(id=instance.id).exists():
 
        signals.append(FraudSignal(
            "FRAUDULENT_CREDS",
            METHODS["DUPLICATE_APPLY"],
            50,
            "HIGH"
        ))
 
    return signals
 
 
def analyze_resume(instance):
    signals = []
    resume_file = instance.resume_version
 
    resume_hash = compute_resume_hash(resume_file)
 
    # SAVE HASH
    if resume_hash:
        instance.resume_hash = resume_hash
        instance.save(update_fields=["resume_hash"])
 
    # 🔴 CROSS USER ONLY
    if resume_hash and JobApplication.objects.filter(
        resume_hash=resume_hash
    ).exclude(user=instance.user).exists():
 
        signals.append(FraudSignal(
            "RESUME_BOT",
            METHODS["RESUME_DUPLICATE"],
            60,
            "HIGH"
        ))
 
    text = extract_resume_text(resume_file)
 
    if not text:
        signals.append(FraudSignal(
            "RESUME_BOT",
            "Unreadable resume",
            30,
            "HIGH"
        ))
        return signals
 
    if len(text) < MIN_RESUME_CHARS:
        signals.append(FraudSignal(
            "RESUME_BOT",
            METHODS["RESUME_SHORT"],
            25,
            "MODERATE"
        ))
        return signals
 
    if text_score(text) >= 20:
        signals.append(FraudSignal(
            "RESUME_BOT",
            METHODS["RESUME_PATTERN"],
            20,
            "MODERATE"
        ))
 
    return signals
 
 
def analyze_cover_letter(instance):
    signals = []
    cover = (instance.cover_letter or "").lower()
 
    if not cover:
        return signals
 
    if len(cover) < MIN_COVER_CHARS:
        signals.append(FraudSignal(
            "RESUME_BOT",
            "Insufficient cover letter",
            15,
            "LOW"
        ))
 
    elif JobApplication.objects.filter(
        cover_letter=instance.cover_letter
    ).exclude(id=instance.id).exists():
 
        signals.append(FraudSignal(
            "RESUME_BOT",
            "Duplicate cover letter",
            40,
            "HIGH"
        ))
 
    return signals
 
 
def analyze_company(instance):
    signals = []
 
    try:
        employer = instance.job.employer
 
        if not CompanyVerification.objects.filter(
            employer=employer,
            status="Verified"
        ).exists():
 
            signals.append(FraudSignal(
                "FRAUDULENT_CREDS",
                "Company not verified",
                30,
                "HIGH"
            ))
    except:
        pass
 
    return signals
 
 
# =========================================================
# MAIN FUNCTION
# =========================================================
 
def run_application_flag_checks(instance, request):
 
    ip = request.META.get("REMOTE_ADDR")
 
    instance.ip_address = ip
    instance.save(update_fields=["ip_address"])
 
    signals = []
 
    signals += analyze_ip(instance, ip)
    signals += analyze_duplicate_application(instance)
    signals += analyze_resume(instance)
    signals += analyze_cover_letter(instance)
    signals += analyze_company(instance)
 
    # REMOVE DUPLICATES
    seen = set()
    unique_signals = []
 
    for s in signals:
        key = (s.flag_reason, s.detected_method)
        if key not in seen:
            seen.add(key)
            unique_signals.append(s)
 
    # SAVE FLAGS (PER-SIGNAL RISK)
    for s in unique_signals:
        ApplicationFlag.objects.get_or_create(
            application=instance,
            flag_reason=s.flag_reason,
            detected_method=s.detected_method,
            defaults={"risk_level": s.risk_level}
        )
 
 
# for admin escalation job priority
 
import re
 
 
HIGH_PRIORITY_KEYWORDS = [
 
    # Fraud / Scam
    'fake',
    'fraud',
    'scam',
    'illegal',
    'cheat',
    'cheating',
    'money scam',
    'financial fraud',
 
    # Abuse / Harassment
    'abuse',
    'harassment',
    'harass',
    'bully',
    'bullying',
 
    # Threat / Violence
    'threat',
    'threatening',
    'violence',
    'violent',
    'attack',
 
    # Criminal
    'criminal',
    'crime',
    'blackmail',
    'extortion',
 
    # Exploitation
    'exploit',
    'exploiting',
    'forced work',
    'unsafe',
 
    # Deceptive
    'deceptive',
    'deception',
    'mislead',
    'misleading salary',
    'fake company',
]
 
 
MEDIUM_PRIORITY_KEYWORDS = [
 
    # Spam
    'spam',
    'spamming',
    'spammer',
 
    # Wrong / Duplicate
    'duplicate',
    'repeated',
    'irrelevant',
    'wrong',
    'incorrect',
    'false information',
 
    # Quality Issues
    'missing details',
    'unclear',
    'confusing',
    'bad experience',
 
    # Content
    'outdated',
    'expired',
    'inactive',
]
 
 
LOW_PRIORITY_KEYWORDS = [
 
    # General Complaints
    'salary not mentioned',
    'location issue',
    'timing issue',
    'minor issue',
    'not interested',
 
    # UI/UX
    'slow',
    'loading',
    'layout',
    'design',
]
 
 
def normalize_text(text):
 
    """
    Normalize text for matching.
    """
 
    if not text:
        return ""
 
    text = text.lower()
 
    text = re.sub(
        r'[^a-z0-9\s]',
        ' ',
        text
    )
 
    text = re.sub(
        r'\s+',
        ' ',
        text
    ).strip()
 
    return text
 
 
def contains_keyword(text, keywords):
 
    """
    Check keyword existence.
    """
 
    for keyword in keywords:
 
        if keyword in text:
            return True
 
    return False
 
 
def get_priority_from_reason(reason):
 
    """
    Determine complaint priority.
 
    Returns:
        High
        Medium
        Low
    """
 
    normalized_reason = normalize_text(
        reason
    )
 
    if not normalized_reason:
        return "Low"
 
    # High Priority
    if contains_keyword(
        normalized_reason,
        HIGH_PRIORITY_KEYWORDS
    ):
        return "High"
 
    # Medium Priority
    if contains_keyword(
        normalized_reason,
        MEDIUM_PRIORITY_KEYWORDS
    ):
        return "Medium"
 
    # Low Priority
    if contains_keyword(
        normalized_reason,
        LOW_PRIORITY_KEYWORDS
    ):
        return "Low"
 
    # Default fallback
    return "Low"

# jobapp/utils.py (FAQ Matching Functions)

import re
from .models import FAQ

def get_best_faq_match(user_message):
    """
    Find the best matching FAQ based on keywords
    """
    user_message = user_message.lower()
    
    # Remove common words and extract keywords
    stop_words = ['hi', 'hello', 'please', 'help', 'want', 'need', 'how', 'what', 
                  'where', 'when', 'why', 'is', 'are', 'am', 'the', 'a', 'an', 'for']
    words = re.findall(r'\b\w+\b', user_message)
    keywords = [word for word in words if word not in stop_words and len(word) > 2]
    
    if not keywords:
        return None
    
    # Find best match from FAQ
    all_faqs = FAQ.objects.all()
    best_match = None
    best_score = 0
    
    for faq in all_faqs:
        faq_keywords = faq.keywords.lower().split(',')
        faq_keywords = [k.strip() for k in faq_keywords]
        
        # Calculate match score
        score = 0
        for keyword in keywords:
            if keyword in ' '.join(faq_keywords):
                score += 2
            if keyword in faq.question.lower():
                score += 1
        
        if score > best_score:
            best_score = score
            best_match = faq
    
    # Return if score is significant (at least 2 matches)
    if best_score >= 2:
        return best_match
    
    return None

from django.core.mail import EmailMultiAlternatives


def _build_admin_reset_email_html(title, intro, username, email, reset_link):
    """Reusable HTML email template for admin password emails."""
    return f"""
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td style="background:#1E88E5;padding:22px 30px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;">Job Portal</span>
                    <span style="color:#cfe4ff;font-size:13px;margin-left:8px;">Admin Security</span>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:30px;">
                    <h2 style="margin:0 0 14px;font-size:20px;color:#032240;">{title}</h2>

                    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 14px;">
                      Hello <strong>{username}</strong>,
                    </p>

                    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 20px;">
                      {intro}
                    </p>

                    <p style="color:#666;font-size:14px;margin:0 0 24px;">
                      <strong>Account:</strong> {email}
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius:8px;" bgcolor="#1E88E5">
                          <a href="{reset_link}"
                             target="_blank"
                             style="display:inline-block;padding:14px 28px;font-size:15px;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">
                            Reset Admin Password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#888;font-size:13px;line-height:1.6;margin:26px 0 0;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>

                    <p style="color:#1E88E5;font-size:13px;word-break:break-all;margin:6px 0 0;">
                      {reset_link}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;padding:18px 30px;border-top:1px solid #eef1f4;">
                    <p style="color:#999;font-size:12px;margin:0;">
                      — Job Portal Security Team
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def send_admin_password_expiry_warning_email(user, days_left=1):
    """Send a warning email 24 hours before an admin password expires."""
    from django.conf import settings

    frontend_url = settings.FRONTEND_URL.rstrip('/')
    reset_link = f"{frontend_url}/Job-portal/admin/login/forgotpassword"

    subject = "⚠️ Your Admin Password Will Expire in 24 Hours"

    text_body = f"""
Hello {user.username},

Your Admin account password will expire in approximately {days_left} day (24 hours).

Account: {user.email}

Please reset your password before it expires to avoid being locked out:
{reset_link}

If you don't reset it in time, you will be required to reset your password
the next time you try to log in.

— Job Portal Security Team
"""

    html_body = _build_admin_reset_email_html(
        title="Your Admin Password Will Expire in 24 Hours",
        intro=(
            f"Your Admin account password will expire in approximately "
            f"{days_left} day (24 hours). Please reset it before then to "
            f"avoid being locked out."
        ),
        username=user.username,
        email=user.email,
        reset_link=reset_link,
    )

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)


def send_admin_password_expired_email(user):
    """Send a notification email the moment the admin password expires."""
    from django.conf import settings

    frontend_url = settings.FRONTEND_URL.rstrip('/')
    reset_link = f"{frontend_url}/Job-portal/admin/login/forgotpassword"

    subject = "Your Admin Password Has Expired"

    text_body = f"""
Hello {user.username},

Your Admin account password has expired. You will not be able to log in
until you reset it.

Account: {user.email}

Reset your password here:
{reset_link}

— Job Portal Security Team
"""

    html_body = _build_admin_reset_email_html(
        title="Your Admin Password Has Expired",
        intro=(
            "Your Admin account password has expired. You will not be able "
            "to log in until you reset it."
        ),
        username=user.username,
        email=user.email,
        reset_link=reset_link,
    )

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(html_body, "text/html")
    email.send(fail_silently=False)