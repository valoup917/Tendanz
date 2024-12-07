from flask import request, jsonify
from flask_jwt_extended import create_access_token
from extensions import db
from app.models import User
from datetime import datetime

def register_auth_routes(app):

    @app.route('/register', methods=['POST'])
    def register():
        data = request.json

        required_fields = ['name', 'firstname', 'email', 'birthdate', 'password']

        if not all(key in data for key in ('name', 'firstname', 'email', 'birthdate', 'password')):
            return jsonify({"error": "Missing required fields"}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email is already in use"}), 400

        new_user = User(
            name = data['name'],
            firstname = data['firstname'],
            email = data['email'],
            birthdate =  datetime.strptime(data['birthdate'], '%Y-%m-%d'),
        )
        new_user.set_password(data['password'])

        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id), additional_claims={"id": new_user.id, "role": "user"})
        return jsonify({"access_token": access_token}), 201

    @app.route('/login', methods=['POST'])
    def login():
        data = request.json

        if not data.get('email'):
            return jsonify({"error": "Email is required"}), 400

        if not data.get('password'):
            return jsonify({"error": "Password is required"}), 400

        user = User.query.filter_by(email=data['email']).first()

        if not user or not user.check_password(data['password']):
            return jsonify({"error": "Invalid email or password"}), 401

        access_token = create_access_token(identity=str(user.id), additional_claims={"id": user.id, "role": user.role})
        return jsonify({"message": "Login successful", "access_token": access_token}), 200