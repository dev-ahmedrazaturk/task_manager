# Task Management System (TMS)

A **Task Management System** built using **Django & Django REST Framework (DRF)** and **Angular Js**  
This system allows **admins and regular users** to manage **projects, tasks, comments and users**.

## Features
- **User Authentication**: Supports JWT-based authentication.
- **User Roles**:
  - **Admin**: Can create, update, and delete projects and tasks.
  - **Regular Users**: Can view/add & work on assigned tasks and comment on them.
- **Projects Management**: Admins can create projects and assign users.
- **Tasks Management**: Tasks can be assigned to multiple users.
- **Commenting System**: Task assignees and admins can comment on tasks.

## **Tech Stack**
- **Backend**: Django, Django REST Framework (DRF)
- **Frontend**: Angular Js
- **Authentication**: JWT (JSON Web Token)
- **Database**: SQLite (default), PostgreSQL/MySQL (optional)
- **Dependencies**: `djangorestframework`, `djangorestframework-simplejwt`

## **Installation & Setup**

### ** Clone the Repository**
https://github.com/dev-ahmedrazaturk/task_manager.git

### **For Backend Django Setup**

cd task_manager

## Create & Activate Virtual Environment

python -m venv venv
./venv/Scripts/activate


## Install Dependencies

pip install -r requirements.txt


## Apply Migrations

python manage.py makemigrations
python manage.py migrate


## Run the Server

python manage.py runserver

### **For Frontend Setup**

cd task-manager-frontend

npm install

ng serve --open


Here is the list of the users admin and simple users

1. Admin User 
Username -- john
password -- 123456

2. Simple Users

Username -- ahmed
password -- 123456

Username -- ali
password -- 123456
