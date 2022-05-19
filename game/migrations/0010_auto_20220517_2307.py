# Generated by Django 3.2.8 on 2022-05-17 15:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0009_alter_record_win_probability'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='record',
            name='momentum',
        ),
        migrations.RemoveField(
            model_name='record',
            name='streak',
        ),
        migrations.AddField(
            model_name='player',
            name='momentum',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='player',
            name='streak',
            field=models.IntegerField(null=True),
        ),
    ]