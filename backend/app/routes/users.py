from flask import jsonify, request
from app.models import User, Contract
from extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

def register_users_routes(app):

    # ----------------------------------------------------------------------
    # Route: GET /users
    # Description: Retrieve all users from the database or one user with the id.
    # ----------------------------------------------------------------------
    @app.route('/users', methods=['GET'])
    def get_users():
        app.logger.info("get all users route called")
        args = request.args

        user_id = args.get('id')

        if (user_id is not None):
            users = User.query.get_or_404(user_id)
            return jsonify({
                "id": users.id,
                "name": users.name,
                "firstname": users.firstname,
                "email": users.email,
                "birthdate": users.birthdate.isoformat(),
                "created_at": users.created_at.isoformat()
            }), 200
        else:
            users = User.query.all()
        
            results = []

            for user in users:
                user_data = {
                    "id": user.id,
                    "name": user.name,
                    "firstname": user.firstname,
                    "email": user.email,
                    "birthdate": user.birthdate.isoformat(),
                    "created_at": user.created_at.isoformat()
                }
                results.append(user_data)
            
            return jsonify(results), 200

    # ----------------------------------------------------------------------
    # Route: PUT /users
    # Description: Update a user's information. Requires authentication.
    # ----------------------------------------------------------------------
    @app.route('/users', methods=['PUT'])
    @jwt_required()
    def update_user():
        app.logger.info("modify user route called")
        current_user_id = get_jwt_identity()

        args = request.args
        user_id = args.get('id')

        if (user_id is None):
            return jsonify({"error": "Missing user_id field"}), 400

        user = User.query.get_or_404(user_id)
        data = request.json

        # Authorization check: only allow the user to update their own account
        if (str(user_id) != str(current_user_id)):
            return jsonify({"error": "Unauthorized"}), 401
    
        if 'name' in data:
            user.name = data['name']
        if 'firstname' in data:
            user.firstname = data['firstname']
        if 'email' in data:
            user.email = data['email']
        if 'birthdate' in data:
            user.birthdate = data['birthdate']
        if 'password' in data:
            user.set_password(data['password'])

        db.session.commit()
        return jsonify({"message": "User updated", "id": user.id}), 200

    # ----------------------------------------------------------------------
    # Route: DELETE /users
    # Description: Delete a user and all their associated contracts. Requires authentication.
    # ----------------------------------------------------------------------
    @app.route('/users', methods=['DELETE'])
    @jwt_required()
    def delete_user():
        current_user_id = get_jwt_identity()
        app.logger.info("delete user route called")

        args = request.args
        user_id = args.get('id')

        if (user_id is None):
            return jsonify({"error": "Missing user_id field"}), 400

        user = User.query.get_or_404(user_id)

        # Authorization check: only allow the user to delete their own account
        if (str(user_id) != str(current_user_id)):
            return jsonify({"error": "Unauthorized"}), 401

        # Delete all contracts owned by the user
        contracts = Contract.query.filter_by(owner_id=user.id).all()
        for contract in contracts:
            db.session.delete(contract)

        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"message": "User deleted", "id": user.id}), 200