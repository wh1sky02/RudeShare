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
      <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Community Guidelines</DialogTitle>
        </DialogHeader>

        <div className="prose prose-slate max-w-none space-y-4">
          <div className="bg-red-800 border border-red-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Our Mission</h4>
            <p className="text-white text-base">
              This is a platform for brutal honesty and unfiltered opinions. No sugar-coating, 
              no fake politeness. Say what you really think without the social BS.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">What We DEMAND:</h4>
            <ul className="text-base text-white space-y-1">
              <li>• Brutal honesty and raw opinions</li>
              <li>• Aggressive criticism and harsh feedback</li>
              <li>• Calling out stupidity when you see it</li>
              <li>• Zero tolerance for fake niceness</li>
              <li>• Savage roasts and mean comebacks</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">BANNED BEHAVIOR:</h4>
            <ul className="text-base text-white space-y-1">
              <li>• Being polite or overly nice (INSTANT BAN)</li>
              <li>• "Please" and "thank you" garbage</li>
              <li>• Wholesome content or positivity</li>
              <li>• Death threats or harassment (legal reasons)</li>
              <li>• Fake compliments or encouragement</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white mb-3">Auto-Moderation:</h4>
            <p className="text-base text-white mb-2">
              Our AI automatically detects and bans soft content:
            </p>
            <ul className="text-base text-white space-y-1">
              <li>• Polite language triggers instant removal</li>
              <li>• Kindness detection algorithm always running</li>
              <li>• Community votes for the most savage content</li>
              <li>• Only harsh criticism gets promoted</li>
              <li>• Death threats still get you banned (legal issues)</li>
            </ul>
          </div>

          <div className="bg-orange-800 border border-orange-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">Warning:</h4>
            <ul className="text-base text-white space-y-1">
              <li>• This platform is for thick-skinned people only</li>
              <li>• Expect to get roasted for everything you post</li>
              <li>• No safe spaces or trigger warnings</li>
              <li>• If you can't handle it, leave now</li>
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
