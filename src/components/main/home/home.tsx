import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RecentSessions } from "@/components/main/home/recent-sessions";
import { RecentFiles } from "@/components/main/home/recent-files";
import { Folder, FilePlus2, History, House, Settings2 } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function Home() {
  return (
    <div className="flex flex-col space-y-4 p-6">
      <div className="text-xl font-bold flex items-center space-x-2">
        <House />
        <span>Home</span>
      </div>
      <Command className="border rounded shadow-sm max-h-[308px]">
        <CommandInput placeholder="Where do you want to start a new terminal?" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            <CommandItem>
              <Folder className="w-4 h-4 ml-1 mr-3" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>Components</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CommandItem>
            <CommandItem>
              <Folder className="w-4 h-4 ml-1 mr-3" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>Components</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb 2</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CommandItem>
            <CommandItem>
              <Folder className="w-4 h-4 ml-1 mr-3" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>Components</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb 3</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CommandItem>
            <CommandItem>
              <Folder className="w-4 h-4 ml-1 mr-3" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbPage>Home</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>Components</BreadcrumbPage>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Breadcrumb 4</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <Separator />
      <div className="text-xl font-bold">Resume recent session</div>
      <RecentSessions />
      <Separator />
      <div className="text-xl font-bold">Reopen recent file</div>
      <RecentFiles />
    </div>
  );
}
