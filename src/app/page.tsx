"use client"
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useRef, useState } from "react";


export default function Home() {
  const getProjectName = useRef<HTMLInputElement>(null)
  const getVideoFile = useRef<HTMLInputElement>(null)
  const [drawerStatus, setdrawerStatus] = useState<boolean>()
  const [projectElement, setprojectElement] = useState(null)





  function handleDrawer() {
    setdrawerStatus(true)
  }

  async function handleDelete(projectID: any) {
    // event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("del_project_id", projectID);

      const response = await fetch("http://localhost:8000/del_project/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

    } catch (error) {
      console.error(error);
    }
    window.location.reload();
  }


  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/get_projects/");
        if (!response.ok) {
          throw new Error("Can't get ProjectData");
        }
        const data = await response.json();
        const projectData = JSON.parse(data.project);

        const projects = projectData.map((project: { id: Key | null | undefined; project_name: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; video_file: string | undefined; }) => (
          <ContextMenu>
            <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
              <div key={project.id} className="w-[16rem] h-[9rem] bg-zinc-100 rounded flex flex-col justify-center items-center space-y-5">
                <h2>{project.project_name}</h2>
                <img src={project.video_file} alt="Video" />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem inset>
                Open
              </ContextMenuItem>

              <ContextMenuItem inset onClick={() => handleDelete(project.id)}>
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>


        ));

        setprojectElement(projects);
      } catch (error) {
        console.error(error);
      }
    };

    getProjects();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("projectname", getProjectName.current?.value || "");
      formData.append("videofile", getVideoFile.current?.files?.[0] || "");

      const response = await fetch("http://localhost:8000/create_project/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <>
      <div className="flex justify-between  border-b border-border/40 items-center pr-5 pl-5 pt-3 pb-3">
        <img src="/SceneNote.svg" alt="Logo" className="w-48" />
        <div className="space-x-3 flex">
          <Avatar>
            <AvatarImage src="/SceneNote.svg" />
          </Avatar>
          <Button>Sign in</Button>
          <Button variant="outline">Sign up</Button>
        </div>
      </div>
      <div className="flex justify-center pt-10 bg-zinc-100 w-screen">
        <div className="grid gap-10 grid-cols-4 grid-rows-3 bg-white pr-10 pl-10 pt-5 rounded h-screen">
          {projectElement}
          <Drawer open={drawerStatus}>
            <DrawerTrigger asChild>
              <div className="w-[16rem] h-[9rem] bg-zinc-100 rounded flex flex-col justify-center items-center space-y-5" onClick={handleDrawer}>
                <PlusIcon className="w-[12rem]" />
                <h2 className="font-medium">New Project</h2>
              </div>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className="p-0 pb-5 pt-5">
                  <DrawerTitle>Create New Project</DrawerTitle>
                  <DrawerDescription>Enter a project name and set video url to create a project.</DrawerDescription>
                </DrawerHeader>
                <div >
                  <form action="http://localhost:8000/create_project/" encType="multipart/form-data" method="POST" className="flex flex-col mt-3 justify-center items-center" onSubmit={handleSubmit}>
                    <div className="flex flex-col space-y-3 mb-3">
                      <Label htmlFor="projectname">Project Name</Label>
                      <Input id="projectname" placeholder="Please type the project name" ref={getProjectName} name="projectname" required></Input>
                      <Label htmlFor="videofile">Video File</Label>
                      <Input id="videofile" ref={getVideoFile} type="file" name="videofile" accept="video/*" required></Input>
                    </div>
                    <Button className="w-11/12"><input type="submit" value="Submit" /></Button>
                  </form>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild className="w-full">
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div >
      <Toaster />
    </>
  )
}
