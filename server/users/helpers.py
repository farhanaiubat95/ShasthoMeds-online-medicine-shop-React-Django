# users/helpers.py
from datetime import datetime, timedelta
from .models import Appointment

def get_available_time_slots(doctor, date, interval_minutes=20):
    """
    Returns available small slots for a doctor on a date.
    """
    booked_slots = Appointment.objects.filter(
        doctor=doctor,
        date=date,
        status__in=["pending", "confirmed"]
    ).values_list("time_slot", flat=True)

    small_slots = []
    for time_range in doctor.available_time:
        start_str, end_str = time_range.split("-")
        start = datetime.strptime(start_str, "%H:%M")
        end = datetime.strptime(end_str, "%H:%M")
        current = start
        while current < end:
            slot_str = current.strftime("%H:%M")
            if slot_str not in booked_slots:
                small_slots.append(slot_str)
            current += timedelta(minutes=interval_minutes)

    return small_slots
