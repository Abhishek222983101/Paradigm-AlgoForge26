"use client";

import React from 'react';
import { ActivityIcon, MenuIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function FloatingHeader() {
  const [open, setOpen] = React.useState(false);

  const links = [
    { label: 'Architecture', href: '#architecture' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
  ];

  return (
    <header
      className={cn(
        'sticky top-6 z-50',
        'mx-auto w-[95%] max-w-7xl border-clinical shadow-clinical',
        'bg-paper/95 backdrop-blur-sm transition-all duration-300'
      )}
    >
      <nav className="mx-auto flex items-center justify-between p-4 px-6 md:px-8">
        <Link href="/" className="hover:bg-cobalt/10 flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors border-2 border-transparent hover:border-charcoal">
          <ActivityIcon className="size-7 stroke-[2px] text-cobalt" />
          <p className="font-heading text-xl md:text-2xl font-bold uppercase tracking-tight text-charcoal">CogniStream</p>
        </Link>
        <div className="hidden items-center gap-3 lg:flex px-4">
          {links.map((link) => (
            <a
              key={link.label}
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'text-sm border-clinical shadow-clinical-sm hover:shadow-clinical h-11' })}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/simulator">
            <Button size="lg" variant="primary" className="hidden lg:flex text-sm h-12 px-6">Try Demo</Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setOpen(!open)}
              className="lg:hidden border-clinical shadow-clinical-sm h-10 w-10 hover:shadow-clinical"
            >
              <MenuIcon className="size-5" />
            </Button>
            <SheetContent
              side="left"
              className="p-0 gap-0 border-r-2 border-charcoal w-full sm:w-80 bg-paper"
              showClose={false}
            >
              <SheetHeader className="flex flex-row items-center justify-between border-clinical-b p-4">
                <SheetTitle className="font-heading font-bold uppercase tracking-tight">Menu</SheetTitle>
                <SheetClose className="border-clinical p-2 hover:bg-charcoal hover:text-white transition-colors">
                  <MenuIcon className="size-5" />
                </SheetClose>
              </SheetHeader>
              <div className="grid gap-y-2 overflow-y-auto px-6 py-10 flex-grow">
                {links.map((link) => (
                  <a
                    key={link.label}
                    className={buttonVariants({
                      variant: 'ghost',
                      className: 'justify-start text-lg border-b-2 border-transparent hover:border-charcoal hover:bg-transparent rounded-none',
                    })}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <SheetFooter className="gap-4 p-4 border-clinical-t">
                <Link href="/simulator" className="w-full" onClick={() => setOpen(false)}>
                  <Button variant="primary" className="w-full" size="lg">Run Live Demo</Button>
                </Link>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
