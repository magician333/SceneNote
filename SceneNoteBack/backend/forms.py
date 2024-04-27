from django import forms


class ProjectForm(forms.Form):
    projectname = forms.CharField(max_length=50)
    videofile = forms.FileField()