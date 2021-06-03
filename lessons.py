from app import app, db

from app.models import User, Admin

@app.shell_context_processor
def make_shell_context(): 
    return {'db': db, 'U': User, 'Adm': Admin}