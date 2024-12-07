from enum import Enum
from datetime import datetime

from app.models import InsuranceTypeEnum

def calculate_annual_premium(insurance_type: InsuranceTypeEnum, start: datetime, end: datetime) -> float:
    """
    Calculate the annual premium based on the insurance type and contract duration.
    
    :param insurance_type: Type of insurance (enum).
    :param start_date: Start date of the contract in "YYYY-MM-DD" format.
    :param end_date: End date of the contract in "YYYY-MM-DD" format.
    :return: The calculated annual premium as a float.
    """
    # Base premium rates for each insurance type
    base_rates = {
        InsuranceTypeEnum.HEALTH: 500.0,  # Base annual premium for health insurance
        InsuranceTypeEnum.AUTO: 800.0,   # Base annual premium for auto insurance
        InsuranceTypeEnum.HOME: 300.0    # Base annual premium for home insurance
    }
    
    # Calculate duration in years
    duration_in_days = (end - start).days
    if duration_in_days <= 0:
        raise ValueError("End date must be after start date")
    
    # Adjust premium based on duration
    duration_in_years = duration_in_days / 365.0
    base_premium = base_rates[insurance_type]
    total_premium = base_premium * duration_in_years

    # Apply additional rules (example)
    if insurance_type == InsuranceTypeEnum.AUTO and duration_in_years < 1:
        total_premium *= 1.1  # Increase for short-term auto insurance
    elif insurance_type == InsuranceTypeEnum.HEALTH and duration_in_years > 5:
        total_premium *= 0.9  # Discount for long-term health insurance

    return round(total_premium, 2)
