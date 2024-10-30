import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Laptop } from "lucide-react";

import { clsx } from "clsx";

interface PathDisplayProps {
  pathComponents: string[];
}

export function PathDisplay({ pathComponents }: PathDisplayProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="mx-0 my-2 flex-nowrap flex-row-reverse justify-center overflow-x-scroll bar no-scrollbar">
        {pathComponents.toReversed().map((path, index) => {
          if (index === 0) {
            return (
              <BreadcrumbItem key={index} className="mr-4">
                <BreadcrumbPage>{path}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }
          return (
            <BreadcrumbItem key={index}>
              <BreadcrumbLink href="#">{path}</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          );
        })}
        <BreadcrumbItem className="ml-4">
          <BreadcrumbLink href="#">
            <Laptop size={16} />
          </BreadcrumbLink>
          <BreadcrumbSeparator />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
