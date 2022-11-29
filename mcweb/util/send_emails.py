import threading
from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str, DjangoUnicodeDecodeError
from django.contrib.sites.shortcuts import get_current_site
from util.token_generator import generate_token

class EmailThread(threading.Thread):

    def __init__(self, email):
        self.email = email
        threading.Thread.__init__(self)
    
    def run(self):
        self.email.send()

def send_email(mail_params):
    subject, body, from_email, recepient = mail_params
    print(mail_params)
    try:
        send_mail(subject, body, from_email, [recepient], fail_silently=False)
    except Exception as e: 
        print(e)

def send_signup_email(user, request):
    current_site = get_current_site
    email_body = render_to_string('authentication/activate.html', {
        'user': user,
        'domain': current_site,
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': generate_token.make_token(user)
    })
    email = EmailMessage(subject = '[Media Cloud] Activate your Media Cloud account',
                body = email_body,
                from_email = 'noreply@mediacloud.org',
                to = [user.email])
    try: 
        EmailThread(email).start()
    except Exception as e:
        print(e)

def send_source_upload_email(mail_params):
    subject, body, recepient = mail_params 
    try:
        send_mail(subject, body, 'system@mediacloud.org', [recepient], fail_silently=False)
    except Exception as e:
        print(e)