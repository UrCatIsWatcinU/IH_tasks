from app import db

db.reflect()

# начал описывать модели, отношения надо прописывать руками, а так было бы здорово автоматизировать, а то как-то грустно перечислять
class Comand(db.Model):
    __tablename__ = 'Comands'
    members = db.relationship('ComandMember', backref='comand', lazy='dynamic')

# привет наследование, в модели это выглядит как связь по id с id
class Group(Comand):
    __tablename__ = 'Groupes'

class CustomComand(Comand):
    __tablename__ = 'CustomComands'

class ComandMember(db.Model):
    __tablename__ = 'ComandsMembers'

class User(db.Model):
    __tablename__ = 'Users'
    memberships = db.relationship('ComandMember', backref='member', lazy='dynamic')

class Admin(User):
    __tablename__ = 'Admins'

