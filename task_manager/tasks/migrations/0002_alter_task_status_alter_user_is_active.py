# Generated by Django 5.1.6 on 2025-02-28 01:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(choices=[('ToDo', 'ToDo'), ('InProgress', 'InProgress'), ('Completed', 'Completed'), ('Archive', 'Archive')], default='pending', max_length=20),
        ),
        migrations.AlterField(
            model_name='user',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
