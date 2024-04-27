from django.http import HttpResponse,JsonResponse
# from .forms import ProjectForm
from django.views.decorators.csrf import csrf_exempt
from .models import Project
import os
import json

# Create your views here.
@csrf_exempt
def create_project(request):
    if request.method == "POST":
        projectname = request.POST.get("projectname")
        videofile = request.FILES.get("videofile")
        
        # directory = os.path.join("VideoData", projectname)
        # os.makedirs(directory, exist_ok=True)
        # file_path = os.path.join(directory, videofile.name)
        # with open(file_path,"wb") as f:
        #     f.write(videofile.read())
        project = Project(project_name=projectname,video_file=videofile)
        project.save()
        return HttpResponse(videofile.name)
    
@csrf_exempt
def del_project(request):
    if request.method == "POST":
        del_project_id = request.POST.get("del_project_id")
        del_data = Project.objects.get(id=del_project_id)
        del_data.delete()
    
def get_projects(request):
    projects = Project.objects.all().values()
    return JsonResponse({"project":json.dumps(list(projects))}, content_type='application/json')




def index(request):
    return HttpResponse("aaa")
        