
from django.shortcuts import redirect
from sslcommerz_lib import SSLCOMMERZ
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.core.mail import send_mail

from django.conf import settings

EMAIL_HOST_USER = settings.EMAIL_HOST_USER

from .models import Order

# === SSLCommerz Config ===
# SSL Credentials

sslcz_settings = {
    'store_id': "flipk67f7ec9513427",         # sandbox store_id
    'store_pass': "flipk67f7ec9513427@ssl", # sandbox password
    'issandbox': True,       # False in production
}


# === Create Payment Session ===
def create_payment_session(amount, tran_id, success_url, fail_url, cancel_url,
                           customer_name, customer_email, customer_phone,
                           product_name, product_category):
    """
    Create a payment session with SSLCommerz.
    """
    sslcz = SSLCOMMERZ(sslcz_settings)

    post_body = {
        'total_amount': amount,
        'currency': "BDT",
        'tran_id': tran_id,  # must be unique
        'success_url': success_url,
        'fail_url': fail_url,
        'cancel_url': cancel_url,
        'emi_option': 0,

        # Customer Info
        'cus_name': customer_name,
        'cus_email': customer_email,
        'cus_phone': customer_phone,
        'cus_add1': "Dhaka",
        'cus_city': "Dhaka",
        'cus_country': "Bangladesh",

        # Product Info
        'shipping_method': "NO",
        'multi_card_name': "",
        'num_of_item': 1,
        'product_name': product_name,
        'product_category': product_category,
        'product_profile': "general",
    }

    return sslcz.createSession(post_body)


# === Success / Fail / Cancel Handlers ===
@csrf_exempt
def payment_success(request):
    data = request.POST.dict()
    tran_id = data.get("tran_id")

    if not tran_id:
        return JsonResponse({"status": "failed", "message": "tran_id missing"})

    try:
        order = Order.objects.get(tran_id=tran_id)
        order.payment_status = "paid"
        order.status = "pending"
        order.save()

        

        # Optional: send confirmation email
        send_mail(
            subject=f"Payment Received - Order #{order.id}",
            message=f"Dear {order.name},\n\nWe have received your payment.\n\nThank you!",
            from_email=EMAIL_HOST_USER,
            recipient_list=[order.email],
        )

        return redirect(f"https://shasthomeds-online.onrender.com/payment-success?tran_id={tran_id}")
    
    except Order.DoesNotExist:
        return JsonResponse({"status": "failed", "message": "Order not found"})



# ================== Failed ==================
@csrf_exempt
def payment_fail(request):
    data = request.POST.dict()
    tran_id = data.get("tran_id")

    if not tran_id:
        return JsonResponse({"status": "failed", "message": "tran_id missing"})

    try:
        order = Order.objects.get(tran_id=tran_id)
        order.payment_status = "failed"
        order.status = "pending"
        order.save()

        # Optional: notify customer about failed payment
        send_mail(
            subject=f"Payment Failed - Order #{order.id}",
            message=f"Dear {order.name},\n\nYour payment could not be processed.\nPlease try again.",
            from_email=EMAIL_HOST_USER,
            recipient_list=[order.email],
        )

        return JsonResponse({"status": "failed", "message": "Payment failed"})
    except Order.DoesNotExist:
        return JsonResponse({"status": "failed", "message": "Order not found"})


# ================== Cancelled ==================
@csrf_exempt
def payment_cancel(request):
    data = request.POST.dict()
    tran_id = data.get("tran_id")

    if not tran_id:
        return JsonResponse({"status": "failed", "message": "tran_id missing"})

    try:
        order = Order.objects.get(tran_id=tran_id)
        order.payment_status = "pending"
        order.status = "pending"
        order.save()

        # Optional: notify customer about cancelled payment
        send_mail(
            subject=f"Payment Cancelled - Order #{order.id}",
            message=f"Dear {order.name},\n\nYour payment has been cancelled.\nIf this was a mistake, please place the order again.",
            from_email=EMAIL_HOST_USER,
            recipient_list=[order.email],
        )

        return JsonResponse({"status": "cancelled", "message": "Payment cancelled"})
    except Order.DoesNotExist:
        return JsonResponse({"status": "failed", "message": "Order not found"})
