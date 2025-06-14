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
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
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
      // Check file type and size
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file.",
          variant: "destructive",
        });
        return;
      }
      
      const maxImageSize = 10 * 1024 * 1024; // 10MB
      const maxVideoSize = 50 * 1024 * 1024; // 50MB
      
      if (isImage && file.size > maxImageSize) {
        toast({
          title: "File too large",
          description: "Images must be under 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      if (isVideo && file.size > maxVideoSize) {
        toast({
          title: "File too large",
          description: "Videos must be under 50MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Thoughts</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="What's pissing you off today? Be brutal, be honest, be rude. No nice crap allowed..."
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

          {/* File Upload Section */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-800">Add Media</h4>
              <div className="text-xs text-slate-500">
                Images: max 10MB • Videos: max 50MB
              </div>
            </div>
            
            {/* File Input */}
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="mb-3"
            />
            
            {/* Selected File Preview */}
            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className={`fas ${selectedFile.type.startsWith('image/') ? 'fa-image' : 'fa-video'} text-blue-600`}></i>
                    <div>
                      <div className="text-sm font-medium text-blue-800">{selectedFile.name}</div>
                      <div className="text-xs text-blue-600">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploadFileMutation.isPending}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {uploadFileMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Uploaded Media Preview */}
            {uploadedMedia && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <i className={`fas ${uploadedMedia.type === 'image' ? 'fa-image' : 'fa-video'} text-green-600`}></i>
                    <span className="text-sm font-medium text-green-800">Media uploaded successfully</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMedia}
                    className="text-red-600 hover:text-red-700"
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
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <i className="fas fa-exclamation-triangle text-red-600 mt-0.5"></i>
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">RudeShare Rules:</p>
                <ul className="space-y-1 text-xs">
                  <li>• BE RUDE - politeness gets you banned</li>
                  <li>• Savage criticism and brutal honesty only</li>
                  <li>• Death threats still banned (legal reasons)</li>
                  <li>• Posts are permanent - own your rudeness</li>
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
              disabled={createPostMutation.isPending || isOverLimit || (content.trim().length === 0 && !uploadedMedia)}
              className="bg-red-600 hover:bg-red-700"
            >
              {createPostMutation.isPending ? "Posting..." : "Post Your Rant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
