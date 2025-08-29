from sslcommerz_lib import SSLCOMMERZ
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# === SSLCommerz Config ===
# SSL Credentials
SSL_STORE_ID = "flipk67f7ec9513427"
SSL_STORE_PASS = "flipk67f7ec9513427@ssl"
ISSANDBOX=True


sslcz_settings = {
    'store_id': SSL_STORE_ID,         # sandbox store_id
    'store_passwd': SSL_STORE_PASS, # sandbox password
    'issandbox': ISSANDBOX,       # False in production
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
    return JsonResponse({"status": "success", "data": data})


@csrf_exempt
def payment_fail(request):
    data = request.POST.dict()
    return JsonResponse({"status": "failed", "data": data})


@csrf_exempt
def payment_cancel(request):
    data = request.POST.dict()
    return JsonResponse({"status": "cancelled", "data": data})
