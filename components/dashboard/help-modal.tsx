"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  Search,
} from "lucide-react";
import { useState } from "react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I create a new project?",
      answer:
        "Navigate to the Projects page and click the 'Add Project' button. Fill in the required information including project name, location, and phase details.",
    },
    {
      question: "How do I invite team members?",
      answer:
        "Go to the Members page and click 'Invite Member'. Enter their email address and select their role. They'll receive an invitation email to join your workspace.",
    },
    {
      question: "What are the different project phases?",
      answer:
        "Projects have three main phases: Pre-Construction (planning and permits), Construction (active building), and Post-Construction (completion and handover).",
    },
    {
      question: "How do I generate ESG reports?",
      answer:
        "In your project details, navigate to the ESG section. Click 'Generate Report' to create comprehensive environmental, social, and governance reports based on your project data.",
    },
    {
      question: "Can I export project data?",
      answer:
        "Yes, you can export project data from the Reports page. Select the projects you want to export and choose your preferred format (PDF, CSV, or Excel).",
    },
    {
      question: "How do I update my profile information?",
      answer:
        "Click on your profile icon in the top right corner and select 'Settings'. You can update your personal information, change your password, and manage notification preferences.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-emerald-500/5 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">Help & Support</DialogTitle>
          <DialogDescription>
            Find answers to common questions or get in touch with our team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-emerald-500/10 shadow-lg transition-colors"
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Documentation</div>
                <div className="text-xs text-muted-foreground">
                  View full guides
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-emerald-500/10 shadow-lg transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Live Chat</div>
                <div className="text-xs text-muted-foreground">
                  Chat with support
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start p-4 gap-2 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-emerald-500/10 shadow-lg transition-colors"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div className="text-left">
                <div className="font-semibold">Email Support</div>
                <div className="text-xs text-muted-foreground">
                  support@verdepm.com
                </div>
              </div>
            </Button>
          </div>

          <Separator className="bg-emerald-100/70 dark:bg-emerald-900/30" />

          {/* FAQs */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No results found for "{searchQuery}"
              </p>
            )}
          </div>

          <Separator className="bg-emerald-100/70 dark:bg-emerald-900/30" />

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-between"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <span>Getting Started Guide</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <span>Video Tutorials</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <span>API Documentation</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-between"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <span>Community Forum</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-emerald-100/70 dark:border-emerald-900/40">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
