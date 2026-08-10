export interface QuizRiddle {
  id: string
  category: string
  prompt: string
  answer: string
  explanation: string
}

export interface QuizCategory {
  id: string
  name: string
  riddles: QuizRiddle[]
}

export const quizCategories: QuizCategory[] = [
  {
    id: 'basics',
    name: 'Basics',
    riddles: [
      {
        id: '1.1',
        category: 'Basics',
        prompt: 'Training was my classroom. This moment is my exam — and I sit it again every single time you ask.',
        answer: 'Inference',
        explanation: 'Running the trained model to produce an answer. It’s what you pay for per request.',
      },
      {
        id: '1.2',
        category: 'Basics',
        prompt: 'Not a coin, but I get counted and billed. I’m a word, or half a word, or just the “ing” on the end of one.',
        answer: 'Token',
        explanation: 'The chunk of text a model actually reads and writes. Roughly ¾ of a word in English.',
      },
      {
        id: '1.3',
        category: 'Basics',
        prompt: 'I have layers but I’m not a cake. I have weights but lift nothing. I have neurons but no skull.',
        answer: 'Neural network',
        explanation: 'Stacked layers of numbers, loosely inspired by brains, tuned until the output is useful.',
      },
      {
        id: '1.4',
        category: 'Basics',
        prompt: 'I’m the studying, not the test. Millions of examples, billions of tiny corrections, and then I’m done.',
        answer: 'Training',
        explanation: 'The expensive one-off process that produces a model. Inference is what happens afterwards.',
      },
      {
        id: '1.5',
        category: 'Basics',
        prompt: 'Two initials everyone says and few can define: software that improves from examples instead of instructions.',
        answer: 'ML (machine learning)',
        explanation: 'Instead of writing the rules, you show the system examples and it works the rules out.',
      },
    ],
  },
  {
    id: 'under-the-hood',
    name: 'Under the Hood',
    riddles: [
      {
        id: '2.1',
        category: 'Under the Hood',
        prompt: 'I share a name with a shapeshifting robot, but my famous paper insists attention is all I need.',
        answer: 'Transformer',
        explanation: 'The 2017 architecture behind nearly every modern language model.',
      },
      {
        id: '2.2',
        category: 'Under the Hood',
        prompt: 'Billions of me got nudged a fraction at a time. Count me up and people call it the size of the model.',
        answer: 'Parameters',
        explanation: 'The learned numbers inside a model. “70B” means seventy billion of them.',
      },
      {
        id: '2.3',
        category: 'Under the Hood',
        prompt: 'Big teacher, small student. The student will never know everything, but it fits on your phone.',
        answer: 'Distillation',
        explanation: 'Training a smaller, cheaper model to imitate a larger one.',
      },
      {
        id: '2.4',
        category: 'Under the Hood',
        prompt: 'I turn “king” and “queen” into numbers that sit close together. Meaning becomes coordinates.',
        answer: 'Embedding',
        explanation: 'Text converted to a list of numbers so similar meanings land near each other.',
      },
      {
        id: '2.5',
        category: 'Under the Hood',
        prompt: 'Turn me down and you get facts. Turn me up and you get poetry. I have nothing to do with weather.',
        answer: 'Temperature',
        explanation: 'The randomness dial on a model’s output. Low for accuracy, high for variety.',
      },
    ],
  },
  {
    id: 'prompt-craft',
    name: 'Prompt Craft',
    riddles: [
      {
        id: '3.1',
        category: 'Prompt Craft',
        prompt: 'Vague in, vague out. I’m the doorway to the whole thing, and most people knock far too quietly.',
        answer: 'The prompt',
        explanation: 'What you ask for. Specifics, context and a stated format do most of the work.',
      },
      {
        id: '3.2',
        category: 'Prompt Craft',
        prompt: 'No examples, no demo, no warm-up. You just ask, and I answer cold.',
        answer: 'Zero-shot prompting',
        explanation: 'Asking a model to do something it was never shown an example of.',
      },
      {
        id: '3.3',
        category: 'Prompt Craft',
        prompt: 'Show me three worked examples and I’ll catch the pattern for the fourth.',
        answer: 'Few-shot prompting',
        explanation: 'Including sample inputs and outputs so the model copies your format and tone.',
      },
      {
        id: '3.4',
        category: 'Prompt Craft',
        prompt: '“Show your work.” I make the model slow down and reason in steps before it commits to an answer.',
        answer: 'Chain of thought',
        explanation: 'Prompting for step-by-step reasoning. It noticeably improves maths and logic.',
      },
      {
        id: '3.5',
        category: 'Prompt Craft',
        prompt: 'I’m the instruction nobody in the chat ever sees, sitting above the conversation, setting the house rules.',
        answer: 'System prompt',
        explanation: 'Standing instructions that shape a model’s role, tone and limits for every message.',
      },
    ],
  },
  {
    id: 'agents-and-tools',
    name: 'Agents & Tools',
    riddles: [
      {
        id: '4.1',
        category: 'Agents & Tools',
        prompt: 'I don’t just answer. Give me a goal and a few tools and I’ll keep looping until the job is actually finished.',
        answer: 'Agent',
        explanation: 'A model that plans, calls tools, checks results and repeats, rather than replying once.',
      },
      {
        id: '4.2',
        category: 'Agents & Tools',
        prompt: 'I’m the open-book exam. Go and look it up first, then answer, and show me where you found it.',
        answer: 'RAG (retrieval-augmented generation)',
        explanation: 'Fetching your real documents and feeding them to the model so answers are grounded and citable.',
      },
      {
        id: '4.3',
        category: 'Agents & Tools',
        prompt: 'I’m the universal plug. Agree on me once and your assistant can reach your docs, your calendar, your tickets.',
        answer: 'MCP (Model Context Protocol)',
        explanation: 'An open standard for connecting models to tools and data without bespoke glue for each one.',
      },
      {
        id: '4.4',
        category: 'Agents & Tools',
        prompt: 'I’m short-term memory. Fill me right up and the oldest things quietly slide out the back.',
        answer: 'Context window',
        explanation: 'How much text a model can hold at once. Everything beyond it is simply not there.',
      },
      {
        id: '4.5',
        category: 'Agents & Tools',
        prompt: 'Instead of a nice paragraph of prose, I hand back tidy fields your code can actually use.',
        answer: 'Structured output',
        explanation: 'Forcing responses into JSON or a fixed schema so software downstream doesn’t have to guess.',
      },
    ],
  },
  {
    id: 'data-and-memory',
    name: 'Data & Memory',
    riddles: [
      {
        id: '5.1',
        category: 'Data & Memory',
        prompt: 'Everything it ever read, before it said a single word.',
        answer: 'Training data',
        explanation: 'The corpus a model learned from. Its quality sets the ceiling on everything after.',
      },
      {
        id: '5.2',
        category: 'Data & Memory',
        prompt: 'It was already clever. I made it clever about us — our tone, our terminology, our tickets.',
        answer: 'Fine-tuning',
        explanation: 'Further training a general model on your own examples to specialise it.',
      },
      {
        id: '5.3',
        category: 'Data & Memory',
        prompt: 'I aced every practice question and flunked the real exam. I memorised instead of learning.',
        answer: 'Overfitting',
        explanation: 'A model that’s learned the training set rather than the pattern, so it fails on anything new.',
      },
      {
        id: '5.4',
        category: 'Data & Memory',
        prompt: 'Not a spreadsheet, not a filing cabinet. I store meaning, and I search for “similar”, never “equals”.',
        answer: 'Vector database',
        explanation: 'Storage for embeddings. It finds things that mean the same thing, not things that match exactly.',
      },
      {
        id: '5.5',
        category: 'Data & Memory',
        prompt: 'Ask me about last month and I’ll confidently describe last year. There’s a date past which I know nothing.',
        answer: 'Knowledge cutoff',
        explanation: 'The end of a model’s training data. Anything later has to be searched for or supplied.',
      },
    ],
  },
  {
    id: 'risks-and-guardrails',
    name: 'Risks & Guardrails',
    riddles: [
      {
        id: '6.1',
        category: 'Risks & Guardrails',
        prompt: 'Fluent, confident, beautifully structured, correctly formatted — and entirely made up.',
        answer: 'Hallucination',
        explanation: 'A plausible-sounding fabrication. Confidence in the output tells you nothing about accuracy.',
      },
      {
        id: '6.2',
        category: 'Risks & Guardrails',
        prompt: 'I hide inside a document or a web page and whisper fresh instructions to your assistant.',
        answer: 'Prompt injection',
        explanation: 'Hostile text in fetched content that hijacks an agent. The main security worry for tool-using AI.',
      },
      {
        id: '6.3',
        category: 'Risks & Guardrails',
        prompt: 'Nobody intended me. I was sitting in the data, and the model learned me right along with everything else.',
        answer: 'Bias',
        explanation: 'Skew inherited from training data that shows up as unfair or lopsided outputs.',
      },
      {
        id: '6.4',
        category: 'Risks & Guardrails',
        prompt: 'I’m the fence, not the brain — the rules drawn around the model about what it won’t say or do.',
        answer: 'Guardrails',
        explanation: 'Policies, filters and checks layered around a model to keep its behaviour in bounds.',
      },
      {
        id: '6.5',
        category: 'Risks & Guardrails',
        prompt: 'That is your CFO’s face and your CFO’s voice on the video call. It is not your CFO.',
        answer: 'Deepfake',
        explanation: 'Synthetic audio or video of a real person. Already a live fraud vector for finance teams.',
      },
    ],
  },
  {
    id: 'buzzword-bingo',
    name: 'Buzzword Bingo',
    riddles: [
      {
        id: '7.1',
        category: 'Buzzword Bingo',
        prompt: 'I’m in every deck. Nobody agrees when we’ll reach me, and the definition quietly moves each year.',
        answer: 'AGI',
        explanation: '“Artificial general intelligence”, human-level ability across most tasks. The goalposts are famously mobile.',
      },
      {
        id: '7.2',
        category: 'Buzzword Bingo',
        prompt: 'I’m the job title that didn’t exist five years ago and may not exist in five more.',
        answer: 'Prompt engineer',
        explanation: 'Designing and testing prompts as a discipline. Increasingly folded into normal product and ops roles.',
      },
      {
        id: '7.3',
        category: 'Buzzword Bingo',
        prompt: 'Text, images, audio, video — I take them all in and don’t blink.',
        answer: 'Multimodal',
        explanation: 'A model that handles more than one type of input or output.',
      },
      {
        id: '7.4',
        category: 'Buzzword Bingo',
        prompt: 'I’m the person who has to press approve before anything real actually happens.',
        answer: 'Human in the loop',
        explanation: 'Deliberate review points where a person checks or authorises what the system produced.',
      },
      {
        id: '7.5',
        category: 'Buzzword Bingo',
        prompt: 'You can download me, run me, change me — though we argue endlessly about whether “weights available” really counts.',
        answer: 'Open-weights model',
        explanation: 'A model whose parameters are published. Often called open source, usually with licence strings attached.',
      },
    ],
  },
  {
    id: 'wildcard',
    name: 'Wildcard',
    riddles: [
      {
        id: '8.1',
        category: 'Wildcard',
        prompt: 'A judge, a human and a machine. If the judge can’t tell which is which, the machine has won.',
        answer: 'The Turing test',
        explanation: 'Alan Turing’s 1950 imitation game. More cultural landmark now than a serious benchmark.',
      },
      {
        id: '8.2',
        category: 'Wildcard',
        prompt: 'People ranked my answers best to worst, and I slowly learned to prefer what they preferred.',
        answer: 'RLHF',
        explanation: 'Reinforcement learning from human feedback, how raw models get shaped into helpful assistants.',
      },
      {
        id: '8.3',
        category: 'Wildcard',
        prompt: 'Built for video games, drafted into AI, now the most fought-over chip on the planet.',
        answer: 'The GPU',
        explanation: 'Graphics hardware whose parallel maths turned out to be perfect for training neural networks.',
      },
      {
        id: '8.4',
        category: 'Wildcard',
        prompt: 'I’m the scoreboard everyone quotes in the keynote and everyone quietly games.',
        answer: 'Benchmark',
        explanation: 'A standard test set for comparing models. Useful, but leaderboard scores rarely match your use case.',
      },
      {
        id: '8.5',
        category: 'Wildcard',
        prompt: 'It learned from its own kind’s output, and its children learned from that, and the quality drained away.',
        answer: 'Model collapse',
        explanation: 'Degradation from training on AI-generated data. The reason clean human data keeps its value.',
      },
    ],
  },
]

export const quizRiddles = quizCategories.flatMap((category) => category.riddles)
