# users/helpers.py
from datetime import datetime, timedelta
from .models import Appointment
import math

def get_available_time_slots(doctor, date):
    """
    Returns available small slots for a doctor on a date based on max_patients_per_day.
    Minimum 10 minutes per slot. Skips slots that would be less than 10 minutes.
    """
    booked_slots = Appointment.objects.filter(
        doctor=doctor,
        date=date,
        status__in=["pending", "confirmed"]
    ).values_list("time_slot", flat=True)

    small_slots = []

    # Calculate total minutes of all ranges
    total_minutes = 0
    time_ranges = []
    for time_range in doctor.available_time:
        start_str, end_str = time_range.split("-")
        start = datetime.strptime(start_str, "%H:%M")
        end = datetime.strptime(end_str, "%H:%M")
        minutes = int((end - start).total_seconds() // 60)
        total_minutes += minutes
        time_ranges.append((start, end, minutes))

    if total_minutes == 0 or doctor.max_patients_per_day == 0:
        return []

    # Determine interval per patient
    interval = max(10, math.floor(total_minutes / doctor.max_patients_per_day))  # at least 10 min

    slots_count = 0
    for start, end, minutes in time_ranges:
        current = start
        while current + timedelta(minutes=interval) <= end and slots_count < doctor.max_patients_per_day:
            slot_str = current.strftime("%H:%M")
            if slot_str not in booked_slots:
                small_slots.append(slot_str)
                slots_count += 1
            current += timedelta(minutes=interval)

    return small_slots
