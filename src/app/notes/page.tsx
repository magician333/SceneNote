
"use client"
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CheckIcon, CrossCircledIcon, FileTextIcon, HamburgerMenuIcon, Pencil2Icon, SizeIcon, TimerIcon, VideoIcon } from "@radix-ui/react-icons";
import ImgMarker, { EventType, MarkMode } from "img-marker";
import ExcelJS from 'exceljs';
import jsPDF from "jspdf";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname, useRouter, useSearchParams } from "next/navigation";






interface CommentData {
    index: number;
    screenshot: string;
    comment: string;
    markedTime: number;
    seq: number;
}


export default function NotePage() {

    const params = useSearchParams()
    const [videoName, setVideoName] = useState<string>("VideoName")
    const [videoUrl, setvideoUrl] = useState<string>("videoUrl")
    const [commentList, setCommentList] = useState<CommentData[]>([]);
    const getComment = useRef<HTMLInputElement>(null);
    const getVideo = useRef<HTMLVideoElement>(null);
    const getScreenShot = useRef<HTMLCanvasElement>(null)
    const getCommentCard = useRef<HTMLDivElement>(null)
    const [pdfCheck, setPdfCheck] = useState(false); // Checkbox state for PDF
    const [xlsCheck, setXlsCheck] = useState(false); // Checkbox state for Excel (XLS)
    const [commentsCardList, setCommentsList] = useState<JSX.Element[]>([]);
    const { toast } = useToast()
    const [index, setIndex] = useState(1);
    const [seq, setSeq] = useState(1);
    const [markedTimeList, setMarkedTimeList] = useState<any>([]);
    const [commentsNum, setCommentsNum] = useState(0);
    const [commentsTable, setcommentsTable] = useState<React.ReactElement<any, any> | null>(null)
    const [videoResolution, setvideoResolution] = useState('1920*1080')
    function submitComment(): void {

        const comment = getComment.current!.value;
        const markedTime = parseFloat(getVideo.current!.currentTime.toFixed(2));
        const screenshot = getScreenShot.current!.getContext("2d")
        getScreenShot.current!.width = getVideo.current!.videoWidth
        getScreenShot.current!.height = getVideo.current!.videoHeight
        screenshot?.drawImage(
            getVideo.current!,
            0,
            0,
            getVideo.current!.videoWidth,
            getVideo.current!.videoHeight,
            0,
            0,
            getVideo.current!.videoWidth,
            getVideo.current!.videoHeight,
        )

        if (comment.length === 0) {

            const noContentWarning = () => {
                toast({
                    title: "Warning",
                    description: "Input requires content",
                    action: (
                        <ToastAction altText="Ok">Ok</ToastAction>
                    ),
                })
            }
            noContentWarning()
            return
        }

        if (markedTime in markedTimeList) {
            const existsTimeWarning = () => {
                toast({
                    title: "Warning",
                    description: "Already tagged content at the same time",
                    action: (
                        <ToastAction altText="Ok">Ok</ToastAction>
                    ),
                })
            }
            existsTimeWarning()
            return
        }
        const data: CommentData = {
            index,
            screenshot: getScreenShot.current!.toDataURL(),
            comment,
            markedTime,
            seq: commentList.length + 1,
        };
        setIndex(prevIndex => prevIndex + 1)
        setCommentList([...commentList, data])
        setMarkedTimeList([...markedTimeList, markedTime])
        setSeq(prevSeq => prevSeq + 1)
        setCommentsNum(prevNum => prevNum + 1)
        getComment.current!.value = ""

    }

    function delComment(event: React.MouseEvent<HTMLButtonElement>, index: number): void {
        event.stopPropagation();
        const updatedCommentList = commentList.filter((item) => item.index !== index);
        setCommentList(updatedCommentList);

        const updatedCommentListWithSeq = updatedCommentList.map((item, idx) => ({
            ...item,
            seq: idx + 1,
        }));
        getComment.current!.value = ""
        setCommentList(updatedCommentListWithSeq);
        setCommentsNum(prevNum => prevNum - 1);

        if (getComment.current!.value === commentList.find(item => item.index === index)?.comment) {
            getComment.current!.value = "";
        }

    }

    function jumpto(time: number, comment: string): void {
        getVideo.current!.currentTime = time
        getComment.current!.value = comment
    }

    function focusInput(): void {
        getVideo.current!.pause()
    }


    useEffect(() => {
        setVideoName(params.get("videoname") as string)
        setvideoUrl(params.get("videourl") as string)
    })

    useEffect(() => {
        setCommentsList(
            commentList.map(({ index, markedTime, comment, screenshot, seq }) => (
                <Card key={index} className="commentCard mb-5" onClick={() => jumpto(markedTime, comment)} ref={getCommentCard} >
                    <CardHeader>
                        <CardTitle>
                            <div className="flex justify-between">No.{seq}
                                <button onClick={(event) => delComment(event, index)} className="border-0 bg-transparent">
                                    <CrossCircledIcon />
                                </button></div>
                            <CardDescription>Marked Time : {markedTime}</CardDescription>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="break-all">
                        <img src={screenshot} alt="" className="rounded mb-2" />
                        {comment}
                    </CardContent>
                </Card>
            ))
        );
    }, [commentList]);


    function showCommentTable() {
        setcommentsTable(
            <Table>
                <TableCaption>A list of your comments.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="">ID</TableHead>
                        <TableHead>Frame</TableHead>
                        <TableHead>MarkedTime</TableHead>
                        <TableHead className="text-right">Comment</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {commentList.map((item) => (
                        <TableRow key={item.seq} onClick={() => jumpto(item.markedTime, item.comment)}>
                            <TableCell className="font-medium">{item.seq}</TableCell>
                            <TableCell><img src={item.screenshot} alt="" className="rounded mb-2" /></TableCell>
                            <TableCell>{item.markedTime}</TableCell>
                            <TableCell className="break-all" >{item.comment}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>

                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{commentsNum}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        )
    }


    function exportFile(): void {
        setPdfCheck(true)
        setXlsCheck(false)
        if (pdfCheck) {
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text(videoName, 10, 10);

            let yOffset = 20;
            commentList.forEach((item) => {
                const imgData = item.screenshot;
                doc.addImage(imgData, "JPEG", 10, yOffset, 80, 45);
                doc.text(`Time: ${item.index} seconds`, 100, yOffset + 10);
                doc.text(`Comment: ${item.comment}`, 100, yOffset + 20);
                yOffset += 60;
            });

            doc.save(videoName + ".pdf");
        }
        else if (xlsCheck) {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Comments');
            sheet.getColumn("B").width = 15

            // 添加表头
            sheet.addRow(['ID', 'Screenshot', 'Marked Time', 'Comment']);

            // 添加数据行
            commentList.forEach((comment) => {
                sheet.addRow([comment.seq,
                    "",
                comment.markedTime,
                comment.comment]);
            });
            commentList.forEach((comment) => {
                const myBase64Image = comment.screenshot;
                const imageId = workbook.addImage({
                    base64: myBase64Image,
                    extension: 'png',
                });
                sheet.getRow(comment.seq + 1).height = 100
                sheet.addImage(imageId, "B" + (comment.seq + 1).toString() + ":B" + (comment.seq + 1).toString());
            });

            workbook.xlsx.writeBuffer().then((buffer) => {
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = videoName + '.xlsx';
                a.click();
                URL.revokeObjectURL(url);
            });
        }

    }


    return (
        <div className="flex justify-center pt-10 pb-0 space-x-5 h-screen bg-zinc-100">
            <Card className="w-[60%] h-[95%]">
                <CardHeader>
                    <CardTitle className="text-3xl font-black">
                        {videoName}
                    </CardTitle>
                    <CardDescription className="space-x-3">

                    </CardDescription>
                    <div className="space-x-3">
                        <Badge>
                            <SizeIcon className="mr-1" />
                            <span>Video Resolution: {videoResolution}</span>
                        </Badge>
                        <Badge>
                            <TimerIcon className="mr-1" />
                            <span>Total Time : 00:00</span>
                        </Badge>
                        <Badge>
                            <VideoIcon className="mr-1" />
                            <span>Frame Rate : 00fps</span>
                        </Badge>
                        <Badge>
                            <Pencil2Icon className="mr-1" />
                            <span>Last Modified : 00:00</span>
                        </Badge>
                    </div>

                </CardHeader>
                <CardContent>
                    {/* <canvas id="myCanvas" className="absolute top-0 left-0 z-10" ref={getScreenShot}></canvas> */}
                    <video src={videoUrl} className="w-full rounded" ref={getVideo} id="video" controls></video>
                    <canvas ref={getScreenShot} className="hidden"></canvas>
                    <div className="flex w-full  mt-5 space-x-5">
                        <Input placeholder="Please type the comment" ref={getComment} onFocus={focusInput}></Input>
                        <Button onClick={submitComment}><CheckIcon className="mr-1" /> Submit</Button>
                    </div>
                </CardContent>
            </Card>
            <div className="w-[20%]">
                <Card className="h-[95%]">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Comment Board
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon"><HamburgerMenuIcon onClick={showCommentTable} /></Button>
                                </SheetTrigger>
                                <SheetContent >
                                    <SheetHeader>
                                        <SheetTitle>Comments Table</SheetTitle>
                                        <SheetDescription>
                                            You can view a detailed form of comments here
                                        </SheetDescription>
                                    </SheetHeader>
                                    <ScrollArea className="h-[9b%]"><div>{commentsTable}</div></ScrollArea>
                                </SheetContent>
                            </Sheet>
                        </CardTitle>
                        <CardDescription className="flex items-center">{commentsNum} comment(s) in total</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[73.51%]">
                        <ScrollArea className="h-[108%]">
                            {commentsCardList}
                        </ScrollArea>
                    </CardContent>
                    <CardFooter>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full mt-11"><FileTextIcon className="mr-1" />Export Comment</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Export File</DialogTitle>
                                    <DialogDescription>
                                        You can choose to export in xls and pdf formats.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            FileName
                                        </Label>
                                        <Input id="name" value={videoName} className="col-span-3" onChange={(e) => setVideoName(e.target.value)} placeholder="Please type the export file name" />
                                    </div>
                                    {/* <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="filetype" className="text-right">
                                            FileType
                                        </Label>
                                        <div id="filetype" className="flex space-x-3 items-center">
                                            <div className="flex space-x-1 items-center">
                                                <Checkbox id="pdf" checked={pdfCheck} onChange={handlePdfCheckChange} />
                                                <Label htmlFor="pdf">PDF</Label>
                                            </div>
                                            <div className="flex space-x-1 items-center">
                                                <Checkbox id="xls" checked={xlsCheck} onChange={handleXlsCheckChange} />
                                                <Label htmlFor="xls">Excel</Label>
                                            </div>

                                        </div>
                                    </div> */}
                                </div>
                                <DialogFooter>
                                    <Button type="submit" onClick={exportFile}>Export File</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>


                    </CardFooter>
                </Card>

            </div>
            <Toaster />
        </div>
    )
}