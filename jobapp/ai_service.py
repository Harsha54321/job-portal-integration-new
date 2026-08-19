# jobapp/ai_service.py

import random
from .utils import get_best_faq_match

# Fallback responses for when FAQ doesn't match
FALLBACK_RESPONSES = [
    "I understand you're asking about this. Please check our Help Center for detailed information.",
    "Good question! For the best guidance, please visit our FAQ section or raise a support ticket.",
    "I don't have that specific information right now. Our support team would be happy to help!",
    "That's a great question! Please look for this topic in our Help Center under the relevant category.",
    "Could you please provide more details so I can assist you better?",
    "I'm here to help. Can you clarify your question a bit more?"
]

def get_ai_response(user_message):
    """
    Get response based on FAQ database first, then fallback to common responses
    """
    user_message = user_message.strip()
    
    if not user_message:
        return "Please ask a question so I can help you."
    
    # Try to find matching FAQ
    faq = get_best_faq_match(user_message)
    if faq:
        return faq.answer
    
    # No match found - return fallback response
    return random.choice(FALLBACK_RESPONSES)