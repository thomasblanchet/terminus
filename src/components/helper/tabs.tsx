import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderTree, BotMessageSquare } from "lucide-react";
import { FileExplorer } from "@/components/helper/file-explorer";
import { Assistant } from "@/components/helper/assistant";

export function HelperTabs() {
  return (
    <Tabs
      defaultValue="file-explorer"
      className="w-[500px] pt-1 pb-4 pr-4 pl-4 bg-slate-50 dark:bg-slate-900"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="file-explorer">
          <FolderTree className="mr-2 h-4 w-4" /> File Explorer
        </TabsTrigger>
        <TabsTrigger value="assistant">
          <BotMessageSquare className="mr-2 h-4 w-4" /> Assistant
        </TabsTrigger>
      </TabsList>
      <TabsContent value="file-explorer" className="h-[calc(100vh-64px)]">
        <FileExplorer />
      </TabsContent>
      <TabsContent value="assistant" className="h-[calc(100vh-64px)]">
        <Assistant />
      </TabsContent>
    </Tabs>
  );
}
