"use client";

import { cn } from "@/lib/utils";
import {
  CodeIcon,
  DownloadIcon,
  GripVertical,
  MoreHorizontalIcon,
  Trash2Icon,
  Trash2,
  ReplaceIcon,
  Redo2Icon,
  RotateCwIcon,
  Sparkles,
  Send,
  Wand2,
  Wand2Icon,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type PropsType = {
  title: string;
  isSelected?: boolean;
  disabled?: boolean;
  isDownloading: boolean;
  scale?: number;
  isRegenerating?: boolean;
  isDeleting?: boolean;
  onOpenHtmlDialog: () => void;
  onDownloadPng?: () => void;
  onRegenerate?: (prompt: string) => void;
  onDeleteFrame?: () => void;
};
const DeviceFrameToolbar = ({
  title,
  isSelected,
  disabled,
  scale = 1.7,
  isDownloading,
  isRegenerating = false,
  isDeleting = false,
  onOpenHtmlDialog,
  onDownloadPng,
  onRegenerate,
  onDeleteFrame,
}: PropsType) => {
  const [promptValue, setPromptValue] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleRegenerate = () => {
    if (promptValue.trim()) {
      onRegenerate?.(promptValue);
      setPromptValue("");
      setIsPopoverOpen(false);
    }
  };
  return (
    <div
      className={cn(
        `absolute -mt-2 flex items-center justify-between gap-2 rounded-full z-50
        `,
        isSelected
          ? `left-1/2 -translate-x-1/2 border bg-card
            dark:bg-muted pl-2 py-1 shadown-sm
            min-w-[260px] h-[35px]
          `
          : "w-[150px h-auto] left-10 "
      )}
      style={{
        top: isSelected ? "-70px" : "-38px",
        transformOrigin: "center top",
        transform: `scale(${scale})`,
      }}
    >
      <div
        role="button"
        className="flex flex-1 cursor-grab items-center
        justify-start gap-1.5 active:cursor-grabbing h-full
        "
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <div
          className={cn(
            `min-w-20 font-medium text-sm
           mx-px truncate mt-0.5
          `,
            isSelected && "w-[100px]"
          )}
        >
          {title}
        </div>
      </div>

      {isSelected && (
        <>
          <Separator orientation="vertical" className="h-5! bg-border" />
          <ButtonGroup className="gap-px! justify-end pr-2! h-full ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled}
                    size="icon-xs"
                    variant="ghost"
                    className="rounded-full!"
                    onClick={onOpenHtmlDialog}
                  >
                    <CodeIcon className="size-3.5! stroke-1.5! mt-px" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View HTML</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled || isDownloading}
                    size="icon-xs"
                    className="rounded-full!"
                    variant="ghost"
                    onClick={onDownloadPng}
                  >
                    {isDownloading ? (
                      <Spinner />
                    ) : (
                      <DownloadIcon className="size-3.5! stroke-1.5!" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PNG</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={disabled}
                        size="icon-xs"
                        className="rounded-full!"
                        variant="ghost"
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5!" />
                        ) : (
                          <Wand2 className="size-3.5! stroke-1.5!" />
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>AI Regenerate</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent align="end" className="w-80 p-1! rounded-lg!">
                <div className="space-y-2">
                  <InputGroup className="bg-transparent! border-0! shadow-none! ring-0! px-0!">
                    <InputGroupAddon>
                      <Wand2Icon />
                    </InputGroupAddon>
                    <Input
                      placeholder="Edit with AI..."
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      className="ring-0! border-0!  shadow-none! bg-transparent! "
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRegenerate();
                        }
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        size="icon-sm"
                        disabled={!promptValue.trim() || isRegenerating}
                        onClick={handleRegenerate}
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5!" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-full!"
                      >
                        <MoreHorizontalIcon className=" mb-px size-3.5! stroke-1.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-32 rounded-md p-0!">
                <DropdownMenuItem
                  disabled={disabled || isDeleting}
                  onClick={onDeleteFrame}
                  className="cursor-pointer"
                >
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <>
                      <Trash2Icon className="size-4" />
                      Delete
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </>
      )}
    </div>
  );
};

export default DeviceFrameToolbar;
