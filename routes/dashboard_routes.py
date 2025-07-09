from flask import Blueprint
from controllers.dashboard_controller import (
    get_top_active_students,
    get_ratings_distribution,
    get_appointments_status,
    get_treatment_orders_by_month,
    treatment_forecast,
    analyze_feedback
)

dashboard_bp = Blueprint('dashboard_bp', __name__)

dashboard_bp.route('/top_active_students', methods=['GET'])(get_top_active_students)
dashboard_bp.route('/ratings_distribution', methods=['GET'])(get_ratings_distribution)
dashboard_bp.route('/appointments_status', methods=['GET'])(get_appointments_status)
dashboard_bp.route('/treatment_orders_by_month', methods=['GET'])(get_treatment_orders_by_month)
