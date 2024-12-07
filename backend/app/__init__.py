from flask import Flask
from extensions import db, migrate, jwt, swagger_ui_blueprint, SWAGGER_URL
from config import Config
import logging
from flask_cors import CORS

def create_app():
    # Flask Config Init
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"*": {"origins": "*"}})

    # Logger Init
    configure_logger(app)

    # Extensions Init
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    app.register_blueprint(swagger_ui_blueprint, url_prefix=SWAGGER_URL)

    # Route Import
    # BASICS
    from app.routes.basics import register_basics_routes
    register_basics_routes(app)
    # USERS
    from app.routes.users import register_users_routes
    register_users_routes(app)
    # CONTRACTS
    from app.routes.contracts import register_contracts_routes
    register_contracts_routes(app)
    # AUTH
    from app.routes.auth import register_auth_routes
    register_auth_routes(app)

    return app


def configure_logger(app):
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)

    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    handler.setFormatter(formatter)

    app.logger.addHandler(handler)