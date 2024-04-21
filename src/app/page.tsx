"use client"
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProjectData {
  videoname: string
  videourl: string
}

export default function Home() {

  const [projectList, setprojectList] = useState<ProjectData[]>([])
  const getProjectName = useRef<HTMLInputElement>(null)
  const getVideoUrl = useRef<HTMLInputElement>(null)
  const [drawerStatus, setdrawerStatus] = useState<boolean>()

  const project = projectList.map(({ videoname, videourl }, index) => (
    <Link href={{
      pathname: "/notes/",
      query: { "videoname": videoname, "videourl": videourl }
    }} key={index}>
      <div className="w-[16rem] h-[9rem] bg-zinc-100 rounded flex justify-center items-center">
        <p>{videoname}</p>
      </div>
    </Link>
  ));

  function newProject() {
    const projectname = getProjectName.current!.value
    const videourl = getVideoUrl.current!.value
    if (projectname === "" || videourl === "") {
      const noContentWarning = () => {
        toast({
          title: "Warning",
          description: "Project Name or Video Url requires content",
          action: (
            <ToastAction altText="Ok">Ok</ToastAction>
          ),
        })
      }
      noContentWarning()
      return
    }
    const data: ProjectData = {
      "videoname": projectname,
      "videourl": videourl
    }
    setprojectList([...projectList, data])
    setdrawerStatus(false)
  }
  function handleDrawer() {
    setdrawerStatus(true)
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
          {project}
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
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="projectname">Project Name</Label>
                  <Input id="projectname" placeholder="Please type the project name" ref={getProjectName}></Input>
                  <Label htmlFor="videourl">Video Url</Label>
                  <Input id="videourl" ref={getVideoUrl} type="url"></Input>
                </div>
                <DrawerFooter>
                  <Button onClick={newProject}>Submit</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <Toaster />
    </>
  );
}
