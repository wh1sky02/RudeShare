// Daily Challenge Generator for RudeShare
export const BRUTAL_CHALLENGES = [
  "Roast your biggest failure this year",
  "What's the most overrated thing everyone loves?",
  "Tear apart your worst habit", 
  "Which popular opinion makes you want to scream?",
  "Destroy the worst advice you've ever received",
  "What trend needs to die immediately?",
  "Rant about the most annoying type of person",
  "What's your most controversial food opinion?",
  "Which celebrity needs a reality check?",
  "What societal norm is complete BS?",
  "Brutally honest review of your own personality",
  "What's the dumbest thing people waste money on?",
  "Roast the worst movie everyone pretends to like",
  "What makes you lose faith in humanity daily?",
  "Destroy your most embarrassing moment",
  "What's the most toxic positivity you've heard?",
  "Rant about the worst type of social media post",
  "What childhood belief was complete garbage?",
  "Brutally critique your own appearance",
  "What's the most annoying thing about your generation?"
];

export function getTodaysChallenge(): string {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const challengeIndex = dayOfYear % BRUTAL_CHALLENGES.length;
  return BRUTAL_CHALLENGES[challengeIndex];
}

export function getRandomChallenge(): string {
  return BRUTAL_CHALLENGES[Math.floor(Math.random() * BRUTAL_CHALLENGES.length)];
}