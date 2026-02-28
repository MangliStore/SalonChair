"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Mail } from "lucide-react";

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
}

export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");
  // Using the verified admin email from project context
  const adminEmail = "citimobilesknr@gmail.com"; 

  const handleSubmit = () => {
    const subject = encodeURIComponent("Salon Chair - Complain/Suggestion");
    const body = encodeURIComponent(feedback);
    // Standard mailto link to open user's default email client (Gmail/Outlook/etc)
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
            <MessageSquarePlus className="h-4 w-4" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Share your Feedback</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            To maintain privacy, please refrain from sharing contact details and visit us directly at the salon. Feel free to share your ideas or any problems you faced.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Type your suggestion or complaint here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[150px] rounded-2xl border-primary/20 focus-visible:ring-primary resize-none"
          />
        </div>
        <DialogFooter>
          <Button 
            className="w-full h-12 rounded-xl text-lg font-bold gap-2 shadow-lg shadow-primary/10" 
            onClick={handleSubmit}
            disabled={!feedback.trim()}
          >
            <Mail className="h-5 w-5" />
            Send to Admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
