import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GuidelinesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GuidelinesModal({ open, onOpenChange }: GuidelinesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Community Guidelines</DialogTitle>
        </DialogHeader>

        <div className="prose prose-slate max-w-none space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-green-800 font-medium mb-2">Our Mission</h4>
            <p className="text-green-700 text-sm">
              FreedomShare exists to provide a space for authentic expression without the constraints 
              of identity-based social networks. We believe in the power of ideas over personalities.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-3">What We Encourage:</h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Thoughtful discussions and diverse perspectives</li>
              <li>• Constructive criticism and helpful feedback</li>
              <li>• Sharing knowledge and experiences</li>
              <li>• Supporting the open-source community</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-3">What We Don't Allow:</h4>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Harassment, threats, or hate speech</li>
              <li>• Spam, advertising, or promotional content</li>
              <li>• Sharing personal information (yours or others')</li>
              <li>• Illegal content or activities</li>
              <li>• Deliberately misleading information</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-3">Moderation:</h4>
            <p className="text-sm text-slate-700 mb-2">
              Our moderation is community-driven and transparent:
            </p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Use the report button for problematic content</li>
              <li>• Community voting helps surface quality content</li>
              <li>• Moderation decisions are logged publicly</li>
              <li>• Appeals process available for disputed actions</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-800 mb-2">Technical Notes:</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Posts are stored with timestamps only</li>
              <li>• No IP logging or user tracking</li>
              <li>• Open source codebase available on GitHub</li>
              <li>• Hosted on privacy-focused infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={() => onOpenChange(false)} className="bg-blue-600 hover:bg-blue-700">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
