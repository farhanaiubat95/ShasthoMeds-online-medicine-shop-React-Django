# reports/signals.py
from django.db.models import Sum, F
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import make_aware
from datetime import datetime
from .models import MonthlyReport, Order, OrderItem, YearlyReport


@receiver(post_save, sender=Order)
def update_reports(sender, instance, **kwargs):
    if instance.payment_status != "paid":
        return

    # === Monthly Report ===
    month_start = datetime(instance.created_at.year, instance.created_at.month, 1)
    month_start = make_aware(month_start)

    report, _ = MonthlyReport.objects.get_or_create(month=month_start)

    paid_orders = Order.objects.filter(
        payment_status="paid",
        created_at__year=month_start.year,
        created_at__month=month_start.month,
    )
    items = OrderItem.objects.filter(order__in=paid_orders)

    total_income = items.aggregate(total=Sum("subtotal"))["total"] or 0
    total_profit = sum([(i.price - i.actual_price) * i.quantity for i in items])
    total_orders = paid_orders.count()
    total_products_sold = items.aggregate(total=Sum("quantity"))["total"] or 0

    # Top-selling product
    top_item = (
        items.values("product_name")
        .annotate(total=Sum("quantity"))
        .order_by("-total")
        .first()
    )
    top_product = top_item["product_name"] if top_item else None

    # Products details
    products_details = []
    grouped = (
        items.values("product_name")
        .annotate(
            total_qty=Sum("quantity"),
            total_income=Sum("subtotal"),
            total_actual=Sum(F("actual_price") * F("quantity")),
        )
    )
    for g in grouped:
        profit = g["total_income"] - g["total_actual"]
        products_details.append({
            "product": g["product_name"],
            "quantity": g["total_qty"],
            "income": float(g["total_income"]),
            "profit": float(profit),
        })

    report.total_income = total_income
    report.total_profit = total_profit
    report.total_orders = total_orders
    report.total_products_sold = total_products_sold
    report.top_product = top_product
    report.products_details = products_details
    report.save()

    # === Yearly Report ===
    year = instance.created_at.year
    y_report, _ = YearlyReport.objects.get_or_create(year=year)

    paid_orders_year = Order.objects.filter(payment_status="paid", created_at__year=year)
    items_year = OrderItem.objects.filter(order__in=paid_orders_year)

    total_income_year = items_year.aggregate(total=Sum("subtotal"))["total"] or 0
    total_profit_year = sum([(i.price - i.actual_price) * i.quantity for i in items_year])
    total_orders_year = paid_orders_year.count()
    total_products_sold_year = items_year.aggregate(total=Sum("quantity"))["total"] or 0

    top_item_year = (
        items_year.values("product_name")
        .annotate(total=Sum("quantity"))
        .order_by("-total")
        .first()
    )
    top_product_year = top_item_year["product_name"] if top_item_year else None

    # Products details yearly
    products_details_year = []
    grouped_year = (
        items_year.values("product_name")
        .annotate(
            total_qty=Sum("quantity"),
            total_income=Sum("subtotal"),
            total_actual=Sum(F("actual_price") * F("quantity")),
        )
    )
    for g in grouped_year:
        profit = g["total_income"] - g["total_actual"]
        products_details_year.append({
            "product": g["product_name"],
            "quantity": g["total_qty"],
            "income": float(g["total_income"]),
            "profit": float(profit),
        })

    y_report.total_income = total_income_year
    y_report.total_profit = total_profit_year
    y_report.total_orders = total_orders_year
    y_report.total_products_sold = total_products_sold_year
    y_report.top_product = top_product_year
    y_report.products_details = products_details_year
    y_report.save()
