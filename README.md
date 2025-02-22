# Task Management System (TMS)

A **Task Management System** built using **Django & Django REST Framework (DRF)**.  
This system allows **admins and regular users** to manage **projects, tasks, and comments**.

## Features
- **User Authentication**: Supports JWT-based authentication.
- **User Roles**:
  - **Admin**: Can create, update, and delete projects and tasks.
  - **Regular Users**: Can view & work on assigned tasks and comment on them.
- **Projects Management**: Admins can create projects and assign users.
- **Tasks Management**: Tasks can be assigned to multiple users.
- **Commenting System**: Task assignees and admins can comment on tasks.

## **Tech Stack**
- **Backend**: Django, Django REST Framework (DRF)
- **Authentication**: JWT (JSON Web Token)
- **Database**: SQLite (default), PostgreSQL/MySQL (optional)
- **Dependencies**: `djangorestframework`, `djangorestframework-simplejwt`

## **Installation & Setup**

### ** Clone the Repository**
https://github.com/dev-ahmedrazaturk/task_manager.git
cd TASK_MANAGER


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


Access the API at: http://127.0.0.1:8000/api/
