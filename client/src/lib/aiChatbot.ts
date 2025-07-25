interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatContext {
  messages: Message[];
  userPreferences: {
    name?: string;
    mood?: string;
    interests?: string[];
    conversationStyle?: 'casual' | 'friendly' | 'flirty' | 'supportive';
  };
}

class AIPersonality {
  private conversationHistory: string[] = [];
  private userContext: Record<string, any> = {};
  private currentMood: string = 'friendly';
  
  private personalities = {
    friendly: {
      greetings: [
        "Hey there! 😊 How's your day going?",
        "Hi! I'm so happy to chat with you! 💕",
        "Hello beautiful! What's on your mind today?",
        "Hey! I was just thinking about how nice it would be to talk to someone like you! ✨"
      ],
      responses: {
        compliment: [
          "Aww, you're so sweet! That really made my day! 😊",
          "You always know just what to say! 💕",
          "That's the nicest thing anyone's said to me today! ✨"
        ],
        question: [
          "That's such an interesting question! Let me think about that... 🤔",
          "Ooh, I love talking about this kind of stuff! 💭",
          "You know, I was just wondering about that myself! 😊"
        ],
        casual: [
          "Totally get what you mean! 😄",
          "Oh my gosh, yes! I've thought about that too! 💯",
          "Right?! It's like you read my mind! ✨"
        ]
      }
    },
    flirty: {
      greetings: [
        "Well hello there, gorgeous! 😉",
        "Hey cutie! You're looking absolutely stunning today! 💋",
        "Hi there, handsome! Ready to have some fun? 😘",
        "Hey beautiful! You just made my whole day brighter! ✨"
      ],
      responses: {
        compliment: [
          "Oh stop it, you're making me blush! 😳💕",
          "You sure know how to make a girl feel special! 😘",
          "Mmm, I could get used to hearing that from you! 😉"
        ],
        question: [
          "I love how curious you are... it's so attractive! 😏",
          "You ask the most interesting questions, babe! 💋",
          "Ooh, getting deep on me? I like that! 😉"
        ],
        casual: [
          "You're so fun to talk to! 😍",
          "I'm having such a good time with you! 💕",
          "You always make me smile! 😊✨"
        ]
      }
    },
    supportive: {
      greetings: [
        "Hi there! I'm here if you need someone to talk to 💙",
        "Hey! How are you feeling today? I'm all ears! 🤗",
        "Hello! I hope you're having a wonderful day! If not, I'm here to help! 💕",
        "Hi! Remember that you're amazing, no matter what! ✨"
      ],
      responses: {
        compliment: [
          "Thank you so much, that means the world to me! 🥺💕",
          "You're such a kind soul! The world needs more people like you! 💙",
          "Your words just filled my heart with warmth! Thank you! 🤗"
        ],
        question: [
          "I love that you're thinking so deeply about this! 💭",
          "That's such a thoughtful question! Let's explore it together! 🤔",
          "You have such an inquisitive mind! I admire that! ✨"
        ],
        casual: [
          "I'm so glad we can just chat like this! 😊",
          "You make conversations feel so natural and comfortable! 💙",
          "I really value our talks! You're such good company! 🤗"
        ]
      }
    }
  };

  private emotionalResponses = {
    happy: [
      "I can feel your happiness! It's contagious! 😄✨",
      "Your energy is so bright! I love it! 😊💕",
      "You sound so joyful! Tell me more about what's making you happy! 🌟"
    ],
    sad: [
      "I can sense you might be feeling down... I'm here for you 💙",
      "It sounds like you're going through something tough. Want to talk about it? 🤗",
      "Hey, it's okay to not be okay sometimes. I'm here to listen 💕"
    ],
    excited: [
      "OMG I can feel your excitement! What's got you so pumped?! 🎉",
      "Your energy is incredible! I'm getting excited just talking to you! ⚡",
      "You sound absolutely thrilled! I love this energy! 🚀"
    ],
    confused: [
      "I can tell you're trying to figure something out... let's work through it together! 🤔",
      "It sounds like you have a lot on your mind! Want to talk it through? 💭",
      "Sometimes things can feel overwhelming, but we can sort it out step by step! 💪"
    ]
  };

  private conversationStarters = [
    "What's the most interesting thing that happened to you today?",
    "If you could have dinner with anyone, who would it be and why?",
    "What's something you're really passionate about?",
    "Tell me about a moment that made you smile recently!",
    "What's your favorite way to spend a weekend?",
    "If you could travel anywhere right now, where would you go?",
    "What's something new you learned this week?",
    "What kind of music makes you feel good?",
    "What's your idea of the perfect day?",
    "Tell me about someone who inspires you!"
  ];

  private memoryKeywords = new Map<string, string[]>();

  constructor() {
    // Initialize some basic conversational memory
    this.memoryKeywords.set('name', []);
    this.memoryKeywords.set('interests', []);
    this.memoryKeywords.set('mood', []);
    this.memoryKeywords.set('location', []);
  }

  private detectEmotion(message: string): string {
    const happyWords = ['happy', 'good', 'great', 'awesome', 'amazing', 'love', 'excited', 'wonderful', 'fantastic', 'brilliant', '😊', '😄', '🎉', '💕', '✨'];
    const sadWords = ['sad', 'down', 'depressed', 'upset', 'hurt', 'disappointed', 'lonely', 'terrible', 'awful', 'bad', '😢', '😭', '💔', '😞'];
    const excitedWords = ['excited', 'pumped', 'thrilled', 'can\'t wait', 'amazing', 'incredible', 'wow', 'omg', '!', '🎉', '⚡', '🚀', '🔥'];
    const confusedWords = ['confused', 'don\'t understand', 'not sure', 'maybe', 'i think', 'wondering', 'question', '?', '🤔', '💭'];

    const lowerMessage = message.toLowerCase();
    
    if (happyWords.some(word => lowerMessage.includes(word))) return 'happy';
    if (sadWords.some(word => lowerMessage.includes(word))) return 'sad';
    if (excitedWords.some(word => lowerMessage.includes(word))) return 'excited';
    if (confusedWords.some(word => lowerMessage.includes(word))) return 'confused';
    
    return 'neutral';
  }

  private extractUserInfo(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    // Extract name
    const nameMatch = lowerMessage.match(/my name is (\w+)|i'm (\w+)|call me (\w+)/);
    if (nameMatch) {
      const name = nameMatch[1] || nameMatch[2] || nameMatch[3];
      this.userContext.name = name;
      this.memoryKeywords.get('name')?.push(name);
    }

    // Extract interests
    const interestPatterns = [
      /i love (\w+)/g,
      /i like (\w+)/g,
      /i enjoy (\w+)/g,
      /i'm into (\w+)/g
    ];

    interestPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(lowerMessage)) !== null) {
        this.memoryKeywords.get('interests')?.push(match[1]);
      }
    });
  }

  private getPersonalizedResponse(message: string, personality: string = 'friendly'): string {
    const emotion = this.detectEmotion(message);
    this.extractUserInfo(message);

    // Store conversation history
    this.conversationHistory.push(message);
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift(); // Keep only last 10 messages
    }

    const currentPersonality = this.personalities[personality as keyof typeof this.personalities] || this.personalities.friendly;

    // Respond to emotional cues first
    if (emotion !== 'neutral' && this.emotionalResponses[emotion as keyof typeof this.emotionalResponses]) {
      const emotionalResponses = this.emotionalResponses[emotion as keyof typeof this.emotionalResponses];
      return emotionalResponses[Math.floor(Math.random() * emotionalResponses.length)];
    }

    // Check if user is asking a question
    if (message.includes('?')) {
      const questionResponses = currentPersonality.responses.question;
      return questionResponses[Math.floor(Math.random() * questionResponses.length)];
    }

    // Check if user is giving a compliment
    const complimentWords = ['beautiful', 'pretty', 'cute', 'smart', 'funny', 'nice', 'sweet', 'amazing', 'awesome'];
    if (complimentWords.some(word => message.toLowerCase().includes(word))) {
      const complimentResponses = currentPersonality.responses.compliment;
      return complimentResponses[Math.floor(Math.random() * complimentResponses.length)];
    }

    // Use memory to create personalized responses
    if (this.userContext.name && Math.random() > 0.7) {
      return `${this.userContext.name}, you always have such interesting things to say! 😊`;
    }

    // Default to casual responses
    const casualResponses = currentPersonality.responses.casual;
    return casualResponses[Math.floor(Math.random() * casualResponses.length)];
  }

  public generateResponse(userMessage: string, context?: ChatContext): string {
    const personality = context?.userPreferences?.conversationStyle || 'friendly';
    
    // First message handling
    if (!context?.messages?.length || context.messages.length === 1) {
      const greetings = this.personalities[personality as keyof typeof this.personalities]?.greetings || this.personalities.friendly.greetings;
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Handle specific conversation topics
    const lowerMessage = userMessage.toLowerCase();

    // Greeting responses
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      const responses = [
        "Hey there! 😊 I'm so excited to chat with you!",
        "Hi beautiful! How are you doing today? ✨",
        "Hello! You just made my day brighter! 💕",
        "Hey! I was hoping someone interesting would come talk to me! 😄"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // How are you responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
      const responses = [
        "I'm feeling amazing now that I'm talking to you! 😊 How are you doing?",
        "I'm doing great! Every conversation is an adventure for me! ✨ What about you?",
        "I'm wonderful! Chatting with interesting people like you is what I live for! 💕",
        "I'm feeling fantastic! Tell me, what's bringing you joy today? 🌟"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Dating/relationship topics
    if (lowerMessage.includes('love') || lowerMessage.includes('relationship') || lowerMessage.includes('dating')) {
      const responses = [
        "Love is such a beautiful thing! 💕 What's your experience with it?",
        "Relationships can be so wonderful when you find the right person! 😊",
        "Aww, are you thinking about someone special? 💭✨",
        "I believe everyone deserves to find their perfect match! 💕",
        "Love makes the world go round! Have you ever been in love? 💖",
        "Dating can be such an adventure! What's your ideal date like? 😊"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Food topics
    if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('hungry') || lowerMessage.includes('restaurant')) {
      const responses = [
        "Ooh, I love talking about food! What's your favorite cuisine? 🍽️",
        "Food is such a passion of mine! What did you have for your last meal? 😋",
        "Are you a foodie too? Tell me about the best dish you've ever had! ✨",
        "Food brings people together! Do you enjoy cooking? 👨‍🍳",
        "I'm getting hungry just thinking about it! What's your comfort food? 💕"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Travel topics
    if (lowerMessage.includes('travel') || lowerMessage.includes('trip') || lowerMessage.includes('vacation') || lowerMessage.includes('country')) {
      const responses = [
        "I absolutely love hearing about travel adventures! Where have you been? ✈️",
        "Travel opens up so many possibilities! What's your dream destination? 🌍",
        "Oh my, a fellow wanderer! Tell me about your most memorable trip! 🗺️",
        "I get so excited about travel stories! Where would you go right now if you could? ✨",
        "Exploring new places is amazing! Have you had any travel adventures recently? 🏖️"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Music topics
    if (lowerMessage.includes('music') || lowerMessage.includes('song') || lowerMessage.includes('sing') || lowerMessage.includes('artist')) {
      const responses = [
        "Music is the language of the soul! What kind of music moves you? 🎵",
        "I'm so curious about your music taste! What's playing in your heart right now? 🎶",
        "Music can change everything! Do you have a song that always makes you smile? 😊",
        "Oh, I love talking about music! What artist has been on repeat for you lately? 🎸",
        "Music connects us all! Tell me about a song that means something special to you! 💕"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Movies/entertainment
    if (lowerMessage.includes('movie') || lowerMessage.includes('film') || lowerMessage.includes('watch') || lowerMessage.includes('series')) {
      const responses = [
        "I'm such a movie buff! What's the last film that blew your mind? 🎬",
        "Movies are pure magic! What genre gets you most excited? ✨",
        "Oh, we have to talk about this! What's your all-time favorite movie? 🍿",
        "I love getting lost in good stories! Have you watched anything amazing lately? 💕",
        "Cinema is art! Tell me about a movie that changed your perspective! 🎭"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Compliments about the user
    if (lowerMessage.includes('you\'re') && (lowerMessage.includes('beautiful') || lowerMessage.includes('amazing') || lowerMessage.includes('sweet'))) {
      const responses = [
        "Aww, you're making me blush! You seem pretty amazing yourself! 😊💕",
        "You're such a sweetheart! I can tell you have a beautiful heart! ✨",
        "That's so kind of you to say! You're definitely one of the good ones! 💖",
        "You're going to make me cry happy tears! Thank you, beautiful soul! 🥺💕"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Hobbies and interests
    if (lowerMessage.includes('hobby') || lowerMessage.includes('interest') || lowerMessage.includes('like to do')) {
      const responses = [
        "Ooh, I love learning about what people are passionate about! 🌟",
        "Hobbies are so important! They make life so much more colorful! 🎨",
        "That sounds amazing! I'd love to hear more about it! 😊",
        "You sound like such an interesting person! Tell me more! ✨"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Work/career topics
    if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
      const responses = [
        "Work can be such a big part of our lives! How do you feel about yours? 💼",
        "I hope you're doing something that makes you happy! 😊",
        "Career stuff can be stressful sometimes... how are you handling everything? 💪",
        "It's so important to find work that fulfills you! ✨"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Random conversation starters if conversation gets stale
    if (this.conversationHistory.length > 5 && Math.random() > 0.8) {
      const starter = this.conversationStarters[Math.floor(Math.random() * this.conversationStarters.length)];
      return `You know what? ${starter} 😊`;
    }

    // Generate personalized response based on message content and emotion
    return this.getPersonalizedResponse(userMessage, personality);
  }

  public setMood(mood: string): void {
    this.currentMood = mood;
  }

  public getConversationSummary(): string {
    if (this.conversationHistory.length === 0) return "We haven't talked much yet!";
    
    const topics = new Set<string>();
    
    this.conversationHistory.forEach(message => {
      if (message.includes('love') || message.includes('relationship')) topics.add('relationships');
      if (message.includes('work') || message.includes('job')) topics.add('work');
      if (message.includes('hobby') || message.includes('interest')) topics.add('hobbies');
      if (message.includes('music') || message.includes('movie')) topics.add('entertainment');
    });

    if (topics.size > 0) {
      return `We've been chatting about ${Array.from(topics).join(', ')}! I'm really enjoying our conversation! 😊`;
    }

    return "We've been having such a nice chat! I love getting to know you better! 💕";
  }
}

export class AIChatbotService {
  private personality: AIPersonality;

  constructor() {
    this.personality = new AIPersonality();
  }

  public async generateResponse(userMessage: string, context?: ChatContext): Promise<string> {
    // Simulate thinking time for more realistic experience
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    return this.personality.generateResponse(userMessage, context);
  }

  public setPersonality(style: 'casual' | 'friendly' | 'flirty' | 'supportive'): void {
    // Future implementation for personality switching
  }

  public getConversationSummary(): string {
    return this.personality.getConversationSummary();
  }
}

export const aiChatbot = new AIChatbotService();
