from app import db

db.reflect()

# сущности
class Comand(db.Model):
    __tablename__ = 'Comands'
    members = db.relationship('ComandMember', backref='comand', lazy='dynamic')
    activities = db.relationship('ComandActivity', backref='comand', lazy='dynamic')
    tasks = db.relationship('ComandTask', backref='comand', lazy='dynamic')

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
    created_commands_taks = db.relationship('ComandTask', backref='creator', lazy='dynamic')
    created_commands_activities = db.relationship('ComandActivity', backref='creator', lazy='dynamic')

class Admin(User):
    __tablename__ = 'Admins'

class Student(User):
    __tablename__ = 'Students'
    activities = db.relationship('StudentActivity', backref='executor', lazy='dynamic')
    tasks = db.relationship('StudentTask', backref='executor', lazy='dynamic')

class Teacher(User):
    __tablename__ = 'Teachers'
    lessons = db.relationship('Lesson', backref='teacher', lazy='dynamic')
    homeworks = db.relationship('Homework', backref='teacher', lazy='dynamic')

class Activity(db.Model):
    __tablename__ = 'Activities'

class StudentActivity(Activity):
    __tablename__ = 'StudentsActivities'

class CustomStudentActivity(StudentActivity):
    __tablename__ = 'CustomStudentsActivities'

class ActivityFromTask(StudentActivity):
    __tablename__ = 'ActivitiesFromTasks'

class ComandActivity(Activity):
    __tablename__ = 'ComandsActivities'

class Lesson(ComandActivity):
    __tablename__ = 'Lessons'

class CustomComandActivity(ComandActivity):
    __tablename__ = 'CustomComandsActivities'

class Task(db.Model):
    __tablename__ = 'Tasks'

class StudentTask(Task):
    __tablename__ = 'StudentsTasks'
    activity_from_task = db.relationship('ActivityFromTask', backref='task', lazy='select', uselist=False)

class Homework(StudentTask):
    __tablename__ = 'Homeworks'

class CustomStudentTask(StudentTask):
    __tablename__ = 'CustomStudentsTasks'

class ComandTask(Task):
    __tablename__ = 'ComandsTasks'




# справочники
class Place(db.Model):
    # ВДНХ или Курская
    __tablename__ = 'Places'
    auds = db.relationship('Aud', backref='place', lazy='dynamic')

class Aud(db.Model):
    # айдитория
    __tablename__ = 'Auds'
    lessons = db.relationship('Lesson', backref='aud', lazy='dynamic')

class Subject(db.Model):
    # предмет, например математика, русский язык и т.д.
    __tablename__ = 'Subjects'
    lessons = db.relationship('Lesson', backref='subject', lazy='dynamic')
    homeworks = db.relationship('Homework', backref='subject', lazy='dynamic')

class Direction(db.Model):
    # эта таблица про направление группы (разработчики, программисты и так далее)
    __tablename__ = 'Directions'
    groupes = db.relationship('Group', backref='direction', lazy='dynamic')

class ComandsMemberRole(db.Model):
    __tablename__ = 'ComandsMembersRoles'
    members = db.relationship('ComandMember', backref='command_role', lazy='dynamic')

class AdminRole(db.Model):
    __tablename__ = 'AdminsRoles'
    admins = db.relationship('Admin', backref='role', lazy='dynamic')

class TaskStatus(db.Model):
    __tablename__ = 'TasksStatuses'
    tasks = db.relationship('Task', backref='status', lazy='dynamic')


print(Activity.starttime.of_type)