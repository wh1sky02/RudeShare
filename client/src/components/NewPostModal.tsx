import { useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface NewPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewPostModal({ open, onOpenChange }: NewPostModalProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<{url: string, type: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use FormData directly with fetch since apiRequest doesn't support it
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Add this to match apiRequest configuration
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedMedia({ url: data.url, type: data.type });
      setSelectedFile(null);
      toast({
        title: "File uploaded",
        description: "Your media has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setSelectedFile(null);
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; mediaUrl?: string; mediaType?: string }) => {
      await apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setContent("");
      setUploadedMedia(null);
      setSelectedFile(null);
      onOpenChange(false);
      toast({
        title: "Post created",
        description: "Your anonymous post has been shared successfully.",
      });
    },
    onError: (error: any) => {
      let title = "Failed to create post";
      let description = error.message || "Please try again.";
      
      if (error.message && error.message.includes("BANNED FOR BEING TOO POLITE")) {
        title = "🚫 POLITENESS VIOLATION";
        description = error.message.replace("BANNED FOR BEING TOO POLITE: ", "");
      } else if (error.message && error.message.includes("death threats")) {
        title = "Content Banned";
        description = "Death threats and harassment are not allowed.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type and size - images only
      const isImage = file.type.startsWith('image/');
      
      if (!isImage) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file only.",
          variant: "destructive",
        });
        return;
      }
      
      const maxImageSize = 10 * 1024 * 1024; // 10MB
      
      if (file.size > maxImageSize) {
        toast({
          title: "Image too large",
          description: "Images must be under 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      // Automatically upload the file when selected
      uploadFileMutation.mutate(file);
    }
  };


  const handleRemoveMedia = () => {
    setUploadedMedia(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length === 0 && !uploadedMedia) {
      toast({
        title: "Empty post",
        description: "Please enter some content or upload media before posting.",
        variant: "destructive",
      });
      return;
    }
    
    const postData: { content: string; mediaUrl?: string; mediaType?: string } = {
      content: content.trim(),
    };
    
    if (uploadedMedia) {
      postData.mediaUrl = uploadedMedia.url;
      postData.mediaType = uploadedMedia.type;
    }
    
    createPostMutation.mutate(postData);
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 2000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto glass border-border/50 mx-4 sm:mx-auto">
        <DialogHeader>
<DialogTitle className="text-xl sm:text-2xl font-bold gradient-text">
  <i className="fas fa-fire mr-2 sm:mr-3 text-primary"></i>
  Unleash Your Savage Rant
</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
<Textarea
  placeholder="What's grinding your gears? Rip into it, no holding back. Polite garbage gets you banned!"
  value={content}
  onChange={(e) => setContent(e.target.value)}
  className="min-h-32 sm:min-h-40 resize-none bg-card border-border/50 focus:border-primary/50 transition-all duration-200 text-base sm:text-lg"
  maxLength={2000}
/>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 space-y-2 sm:space-y-0 text-sm">
              <span className="text-muted-foreground font-medium">
                <i className="fas fa-user-secret mr-2"></i>
                Your post will remain anonymous
              </span>
              <span className={`font-mono px-2 py-1 rounded-full self-end sm:self-auto ${isOverLimit ? "text-red-400 bg-red-500/10" : "text-muted-foreground bg-accent/30"}`}>
                {characterCount}/2000
              </span>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="glass border border-border/50 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h4 className="font-semibold text-foreground text-base sm:text-lg">
                <i className="fas fa-image mr-2 text-primary"></i>
                Add Media
              </h4>
              <div className="text-xs text-muted-foreground font-mono bg-accent/30 px-3 py-1 rounded-full self-start sm:self-auto">
                Images only: max 10MB
              </div>
            </div>
            
            {/* File Input */}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mb-3"
            />
            
            {/* Upload Status */}
            {uploadFileMutation.isPending && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin text-blue-600 mr-2"></i>
                  <span className="text-sm font-medium text-blue-800">Uploading image...</span>
                </div>
              </div>
            )}
            
            {/* Uploaded Media Preview */}
            {uploadedMedia && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <i className={`fas ${uploadedMedia.type === 'image' ? 'fa-image' : 'fa-video'} text-green-600`}></i>
                    <span className="text-sm font-medium text-green-800">Media uploaded successfully</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMedia}
                    className="text-red-600 hover:text-red-700 self-start sm:self-auto"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
                
                {/* Media Preview */}
                <div className="mt-2">
                  {uploadedMedia.type === 'image' ? (
                    <img
                      src={uploadedMedia.url}
                      alt="Uploaded preview"
                      className="max-w-full h-auto rounded border border-green-300"
                      style={{ maxHeight: '200px' }}
                    />
                  ) : (
                    <video
                      src={uploadedMedia.url}
                      controls
                      className="max-w-full h-auto rounded border border-green-300"
                      style={{ maxHeight: '200px' }}
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
<Button
  type="submit"
  disabled={createPostMutation.isPending || isOverLimit || (content.trim().length === 0 && !uploadedMedia)}
  className="bg-red-600 hover:bg-red-700 order-1 sm:order-2 touch-manipulation"
>
  {createPostMutation.isPending ? "Posting..." : "Blast Your Hate"}
</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
