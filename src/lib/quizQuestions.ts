export interface QuizQuestion {
  id: string
  category: string
  prompt: string
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'team-highlight',
    category: 'Team',
    prompt: 'What is one recent team accomplishment that made you proud?',
  },
  {
    id: 'hidden-talent',
    category: 'Just for fun',
    prompt: 'What is a skill or hidden talent your teammates might not know about?',
  },
  {
    id: 'workday-upgrade',
    category: 'Ways of working',
    prompt: 'What small change would make your workday noticeably better?',
  },
  {
    id: 'learned-lately',
    category: 'Learning',
    prompt: 'What is the most useful thing you have learned recently?',
  },
  {
    id: 'dream-project',
    category: 'Ideas',
    prompt: 'If time and resources were unlimited, what project would you start?',
  },
  {
    id: 'recommendation',
    category: 'Just for fun',
    prompt: 'What book, show, podcast, or game would you recommend to the team?',
  },
  {
    id: 'team-strength',
    category: 'Team',
    prompt: 'What is one strength our team should use more often?',
  },
  {
    id: 'future-skill',
    category: 'Learning',
    prompt: 'What skill would you most like to develop over the next year?',
  },
]
