import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface NewPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewPostModal({ open, onOpenChange }: NewPostModalProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string }) => {
      await apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setContent("");
      onOpenChange(false);
      toast({
        title: "Post created",
        description: "Your anonymous post has been shared successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0) {
      toast({
        title: "Empty post",
        description: "Please enter some content before posting.",
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate({ content: content.trim() });
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 2000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Thoughts</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="What's on your mind? Remember to be respectful and follow community guidelines..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
              <span>Your post will remain anonymous</span>
              <span className={isOverLimit ? "text-red-500" : ""}>
                {characterCount}/2000
              </span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Posting Guidelines:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Be respectful and constructive</li>
                  <li>• No harassment, hate speech, or spam</li>
                  <li>• No personal information sharing</li>
                  <li>• Posts are permanent and cannot be edited</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPostMutation.isPending || isOverLimit || content.trim().length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPostMutation.isPending ? "Posting..." : "Post Anonymously"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
