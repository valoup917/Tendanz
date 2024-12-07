from flask import jsonify, request
from app.models import Contract, InsuranceTypeEnum
from extensions import db
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.lib import calculate_annual_premium

def register_contracts_routes(app):

    # ----------------------------------------------------------------------
    # Route: POST /contracts
    # Description: Create a new contract. Requires authentication.
    # ----------------------------------------------------------------------
    @app.route('/contracts', methods=['POST'])
    @jwt_required()
    def create_contract():
        current_user_id = get_jwt_identity()
        data = request.json
        required_fields = ['insurance_type', 'start_date', 'end_date']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        if data['insurance_type'] not in InsuranceTypeEnum.__members__:
            return jsonify({"error": "Invalid insurance_type"}), 400

        insurance_type = InsuranceTypeEnum[data['insurance_type']]


        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')

        new_contract = Contract(
            insurance_type=InsuranceTypeEnum[data['insurance_type']],
            start_date=start_date,
            end_date=end_date,
            annual_premium=calculate_annual_premium(insurance_type, start_date, end_date),
            owner_id=current_user_id
        )
        db.session.add(new_contract)
        db.session.commit()

        return jsonify({"message": "Contract created", "id": new_contract.id}), 201


    # ----------------------------------------------------------------------
    # Route: GET /contracts
    # Description: Retrieve all contracts owned by a specific user.
    # ----------------------------------------------------------------------
    @app.route('/contracts', methods=['GET'])
    def get_contracts():
        args = request.args
        owner_id = args.get('owner_id')
        contract_id = args.get('contract_id')

        if (contract_id is not None):
            contracts = Contract.query.get_or_404(contract_id)
            return jsonify({
                "id": contracts.id,
                "insurance_type": contracts.insurance_type.value,
                "start_date": contracts.start_date,
                "end_date": contracts.end_date,
                "annual_premium": contracts.annual_premium,
                "owner_id": contracts.owner_id,
            }), 200
        elif (owner_id is not None):
            contracts = Contract.query.filter_by(owner_id=owner_id).all()
        elif (owner_id is None and contract_id is None):
            contracts = Contract.query.all()
    
        results = []

        for contract in contracts:
            contract_data = {
                "id": contract.id,
                "insurance_type": contract.insurance_type.value,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "annual_premium": contract.annual_premium,
                "owner_id": contract.owner_id,
            }
            results.append(contract_data)
        
        return jsonify(results), 200

    # ----------------------------------------------------------------------
    # Route: PUT /contracts
    # Description: Update an existing contract. Requires authentication.
    # ----------------------------------------------------------------------
    @app.route('/contracts', methods=['PUT'])
    @jwt_required()
    def update_contract():
        current_user_id = get_jwt_identity()
        data = request.json
        args = request.args

        contract_id = args.get('id')

        if (contract_id is None):
            return jsonify({"error": "Missing id field"}), 400

        contract = Contract.query.get_or_404(contract_id)

        if (str(contract.owner_id) != str(current_user_id)):
            return jsonify({"error": "Unauthorized"}), 401

        if 'start_date' in data:
            contract.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        if 'end_date' in data:
            contract.end_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        if 'insurance_type' in data:
            if data['insurance_type'] not in InsuranceTypeEnum.__members__:
                return jsonify({"error": "Invalid insurance_type"}), 400
            contract.insurance_type = InsuranceTypeEnum[data['insurance_type']]

        db.session.commit()
        return jsonify({"message": "Contract updated", "id": contract.id}), 200

    # ----------------------------------------------------------------------
    # Route: DELETE /contracts
    # Description: Delete a contract by ID. Requires authentication.
    # ----------------------------------------------------------------------
    @app.route('/contracts', methods=['DELETE'])
    @jwt_required()
    def delete_contract():
        current_user_id = get_jwt_identity()
        args = request.args
        contract_id = args.get('id')
        
        if (contract_id is None):
            return jsonify({"error": "Missing id field"}), 400

        contract = Contract.query.get_or_404(contract_id)

        if (str(contract.owner_id) != str(current_user_id)):
            return jsonify({"error": "Unauthorized"}), 401

        db.session.delete(contract)
        db.session.commit()
        
        return jsonify({"message": "Contract deleted", "id": contract.id }), 200