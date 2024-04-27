from django.db import models


# Create your models here.

class Project(models.Model):
    project_name = models.CharField(verbose_name="Project name",max_length=200)
    video_file = models.FileField(verbose_name="Video File")
    def __str__(self):
        return self.name