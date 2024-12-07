from flask import jsonify, request
from app.models import User, Contract 
from extensions import db

def register_basics_routes(app):
    # Create All tables in the database
    @app.route('/load_db', methods=['POST'])
    def load_db():
        if (app.config['SQLALCHEMY_DATABASE_URI'] is None):
            return jsonify({"status": "error", "message": "No database URL found"}), 500

        with app.app_context():
            db.create_all()
        return jsonify({"status": "Tables created"}), 200

    # Health Check
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "ok"}), 200