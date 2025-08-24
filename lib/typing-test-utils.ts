export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedTime: number;
  consistency: number;
  wpmHistory: number[];
  errors: number[];  // Positions where errors occurred
}

export type TestMode = 'time' | 'words' | 'quote' | 'zen' | 'custom' | 'punctuation' | 'numbers';
export type TimeOption = 15 | 30 | 60 | 120 | 180 | 240 | 300 | number;
export type WordsOption = 10 | 25 | 50 | 100 | number;

const commonWords = [
  // Core foundation - ultra common words (1-3 letters)
  'a', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 
  'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we',
  
  // Common short words (3-5 letters) - smooth transitions
  'and', 'any', 'are', 'but', 'can', 'day', 'end', 'far', 'for', 'get', 'had', 'has', 'her', 
  'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'one', 'our', 'out', 'own', 'put', 
  'say', 'she', 'the', 'too', 'try', 'two', 'use', 'was', 'way', 'who', 'why', 'you',
  
  // Smooth flowing words (4-6 letters) - easy transitions
  'able', 'back', 'been', 'both', 'came', 'come', 'down', 'each', 'even', 'find', 'from', 
  'give', 'good', 'have', 'help', 'here', 'home', 'into', 'just', 'keep', 'know', 'last', 
  'left', 'like', 'live', 'long', 'look', 'made', 'make', 'many', 'more', 'most', 'move', 
  'much', 'must', 'name', 'need', 'next', 'only', 'open', 'over', 'part', 'play', 'right', 
  'said', 'same', 'seem', 'show', 'side', 'some', 'such', 'take', 'tell', 'than', 'that', 
  'them', 'then', 'they', 'this', 'time', 'turn', 'very', 'want', 'well', 'went', 'were', 
  'what', 'when', 'will', 'with', 'word', 'work', 'year',
  
  // Medium length words (5-7 letters) - natural flow
  'about', 'after', 'again', 'along', 'also', 'among', 'being', 'below', 'carry', 'close', 
  'could', 'doing', 'every', 'first', 'found', 'great', 'group', 'hands', 'heard', 'house', 
  'large', 'learn', 'leave', 'might', 'never', 'night', 'other', 'place', 'point', 'right', 
  'small', 'sound', 'still', 'study', 'their', 'there', 'these', 'think', 'those', 'three', 
  'under', 'until', 'voice', 'water', 'where', 'which', 'while', 'world', 'would', 'write',
  
  // Comfortable longer words (6-8 letters) - maintain rhythm
  'across', 'always', 'around', 'became', 'become', 'before', 'begin', 'behind', 'better', 
  'called', 'change', 'coming', 'course', 'family', 'follow', 'friend', 'letter', 'little', 
  'living', 'making', 'mother', 'number', 'people', 'person', 'public', 'really', 'school', 
  'second', 'should', 'simple', 'social', 'street', 'system', 'though', 'through', 'today', 
  'together', 'trying', 'walked', 'within', 'without',
  
  // Action words - smooth typing flow
  'ask', 'buy', 'call', 'cut', 'dig', 'eat', 'end', 'fall', 'feel', 'get', 'grow', 'hear', 
  'hold', 'jump', 'keep', 'lead', 'love', 'meet', 'move', 'pick', 'plan', 'pull', 'push', 
  'read', 'ride', 'rise', 'run', 'save', 'sell', 'send', 'show', 'shut', 'sing', 'sit', 
  'talk', 'tell', 'turn', 'wait', 'walk', 'want', 'warm', 'wash', 'wear', 'win', 'work',
  
  // Descriptive words - easy to type
  'big', 'hot', 'new', 'old', 'red', 'bad', 'top', 'few', 'own', 'far', 'off', 'fit', 'lot',
  'best', 'cool', 'dark', 'deep', 'easy', 'fast', 'free', 'full', 'hard', 'high', 'kind', 
  'late', 'left', 'long', 'loud', 'nice', 'open', 'real', 'rich', 'safe', 'slow', 'soft', 
  'sure', 'tall', 'true', 'warm', 'wide', 'wild', 'wise', 'young',
  
  // Common objects - natural words
  'air', 'arm', 'art', 'bag', 'ball', 'bed', 'bike', 'bird', 'book', 'box', 'boy', 'bus', 
  'car', 'cat', 'cup', 'desk', 'dog', 'door', 'eye', 'face', 'fire', 'fish', 'foot', 'game', 
  'girl', 'hair', 'hand', 'head', 'hill', 'job', 'key', 'land', 'leg', 'line', 'man', 'map', 
  'mind', 'moon', 'note', 'park', 'path', 'pen', 'plan', 'road', 'rock', 'room', 'sea', 'ship', 
  'sky', 'song', 'star', 'sun', 'team', 'tree', 'wall', 'wind', 'wing', 'wood',
  
  // Places and time - smooth flow
  'city', 'farm', 'home', 'lake', 'mall', 'park', 'pool', 'shop', 'town', 'yard', 'zone',
  'hour', 'week', 'year', 'dawn', 'dusk', 'fall', 'spring', 'summer', 'winter',
  
  // Technology and modern life - relevant words
  'app', 'blog', 'chat', 'code', 'data', 'edit', 'file', 'link', 'mail', 'news', 'page', 
  'post', 'save', 'scan', 'send', 'site', 'text', 'type', 'user', 'view', 'web', 'wifi',
  
  // Perfect typing flow words - ultra smooth
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 
  'one', 'our', 'out', 'day', 'get', 'use', 'man', 'new', 'now', 'way', 'may', 'say',
  
  // Rhythm builders - great for muscle memory
  'it', 'is', 'to', 'be', 'or', 'as', 'at', 'on', 'we', 'he', 'me', 'go', 'no', 'so',
  'up', 'an', 'my', 'by', 'do', 'if', 'in', 'of', 'us',
  
  // Smooth connecting words
  'also', 'both', 'each', 'else', 'even', 'ever', 'here', 'just', 'like', 'more', 'most', 
  'much', 'next', 'once', 'only', 'same', 'some', 'soon', 'then', 'very', 'well', 'when'
];

const punctuationWords = [
  "Don't forget to bring your lunch!", 
  "What's the weather like today?",
  "The cat's toy is under the table.",
  "Hey! Watch where you're going!",
  "She said, 'I'll be there soon.'",
  "Is this the right way? I'm not sure.",
  "Stop, look, and listen!",
  "The meeting starts at 9:30 a.m.",
  "Please bring: cups, plates, and napkins.",
  "Wow! That's amazing!",
  "He asked, \"Why did you do that?\"",
  "The sign reads, \"No parking at any time.\"",
  "We need to consider options A, B, and C.",
  "I can't believe it's already Friday!",
  "Do you know where the post office is?",
  "That's great news! Congratulations!",
  "The movie was good; however, the book was better.",
  "Pack the following items: shirts, socks, and shoes.",
  "Wait—did you hear that noise?",
  "My flight leaves at 6:45 p.m.",
  "Remember: practice makes perfect!",
  "There are three categories: beginner, intermediate, and advanced.",
  "She whispered, \"This is our secret; don't tell anyone.\"",
  "Can you believe it? We won the championship!",
  "The restaurant—which was highly recommended—was actually quite disappointing.",
  "First, preheat the oven; then, prepare the ingredients.",
  "The museum is closed on Mondays, but it's open on weekends (10:00 a.m. to 6:00 p.m.).",
  "I'm not sure what to do; perhaps you have some ideas?",
  "\"Come quickly,\" she texted, \"there's something you need to see!\"",
  "The instructions say: 'Do not open until Christmas.'",
  "I've heard that song before—it's one of my favorites!",
  "There are several reasons: time, money, and logistics.",
  "Wait! Don't touch that—it's hot!",
  "The conference will be held in Paris, France; Rome, Italy; and Madrid, Spain.",
  "Would you prefer tea, coffee, or hot chocolate?",
  "\"I can't believe you did that!\" she exclaimed.",
  "The forecast predicts rain (70% chance) for tomorrow's picnic.",
  "The package—delivered yesterday—contained all the supplies we ordered.",
  "Have you tried the new restaurant downtown? It's amazing!",
  "Please reply with 'yes,' 'no,' or 'maybe' by tomorrow."
];

const numberWords = [
  "42 is the answer to everything",
  "There are 365 days in a year",
  "The temperature is 25°C outside",
  "I have 99 problems but typing isn't one",
  "It costs $19.99 plus tax",
  "Room 101 is down the hall",
  "Call 555-0123 for more information",
  "The year is 2025 according to the calendar",
  "Chapter 7, page 123 contains the answer",
  "The final score was 3-2",
  "My address is 1234 Oak Street",
  "The sale offers 50% off all items",
  "We need 4 volunteers for the project",
  "The meeting will take 90 minutes",
  "Highway 66 is closed for repairs",
  "The child is 8 years old today",
  "The recipe requires 2 cups of flour",
  "The password must contain at least 1 number",
  "The shop is open from 9:00 to 17:00",
  "The population has increased by 12.5%",
  "The class has 25 students, including 12 boys and 13 girls",
  "I need to buy 3 pounds of apples, 2 pounds of oranges, and 1 pound of grapes",
  "The distance between the two cities is approximately 345.7 miles",
  "Our company has grown by 27% in the last quarter of 2023",
  "The building has 42 floors with 8 apartments on each floor",
  "My new camera cost $599.99 and came with a 2-year warranty",
  "The average adult needs 7-9 hours of sleep per night",
  "The concert tickets are $85 for general admission and $150 for VIP passes",
  "We expect around 300-500 attendees at the conference next week",
  "The recipe will yield 24 cookies at 120 calories each",
  "The property tax rate increased by 0.25% this year",
  "In 2022, the company hired 157 new employees across 6 departments",
  "The museum's collection includes over 10,000 artifacts from the 18th century",
  "Flight AC254 departs at 15:45 from Terminal 3, Gate 27",
  "The laptop weighs 3.2 pounds and measures 13.5 inches diagonally",
  "On average, Americans consume 68 quarts of popcorn per person annually",
  "The Earth is approximately 93,000,000 miles from the Sun",
  "The 2024 budget includes a 5.7% increase for education funding",
  "I need to memorize 50 vocabulary words for tomorrow's test",
  "The marathon record is 2 hours, 1 minute, and 9 seconds"
];

const quotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Life is what happens when you're busy making other plans.",
  "In three words I can sum up everything I've learned about life: it goes on.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Be yourself; everyone else is already taken.",
  "Whether you think you can or you think you can't, you're right.",
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
  "The question isn't who is going to let me; it's who is going to stop me.",
  "The only impossible journey is the one you never begin.",
  "Yesterday is history, tomorrow is a mystery, today is a gift. That's why we call it 'The Present'.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "You miss 100% of the shots you don't take.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The way to get started is to quit talking and begin doing.",
  "Do not wait to strike till the iron is hot; but make it hot by striking.",
  "Success seems to be connected with action. Successful people keep moving.",
  "Life is short, and it is up to you to make it sweet.",
  "Believe you can and you're halfway there.",
  "If you want to lift yourself up, lift up someone else.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Your time is limited, so don't waste it living someone else's life.",
  "If life were predictable it would cease to be life, and be without flavor.",
  "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
  "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
  "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
  "When you reach the end of your rope, tie a knot in it and hang on.",
  "Always remember that you are absolutely unique. Just like everyone else.",
  "Don't judge each day by the harvest you reap but by the seeds that you plant.",
  "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
  "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.",
  "It is during our darkest moments that we must focus to see the light.",
  "Whoever is happy will make others happy too.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "You will face many defeats in life, but never let yourself be defeated.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "Never let the fear of striking out keep you from playing the game.",
  "Life is either a daring adventure or nothing at all.",
  "Many of life's failures are people who did not realize how close they were to success when they gave up.",
  "The purpose of our lives is to be happy."
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Smart word generation for smoother typing flow
function generateSmoothWordFlow(words: string[], targetCount: number): string {
  if (words.length === 0) return '';
  
  // Define word categories for better flow
  const shortWords = words.filter(w => w.length <= 3);
  const mediumWords = words.filter(w => w.length >= 4 && w.length <= 6);
  const longerWords = words.filter(w => w.length > 6);
  
  // Hand position mappings for alternation
  const leftHand = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
  const rightHand = new Set(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']);
  
  const getWordFlow = (word: string) => {
    let score = 0;
    const lower = word.toLowerCase();
    
    // Reward alternating hands
    for (let i = 0; i < lower.length - 1; i++) {
      const curr = lower[i];
      const next = lower[i + 1];
      if ((leftHand.has(curr) && rightHand.has(next)) || 
          (rightHand.has(curr) && leftHand.has(next))) {
        score += 2; // Bonus for hand alternation
      }
    }
    
    // Favor common letter patterns and home row
    const homeRow = new Set(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']);
    for (const char of lower) {
      if (homeRow.has(char)) score += 1;
    }
    
    return score;
  };
  
  // Sort words by flow quality
  const sortedShort = shuffleArray(shortWords).sort((a, b) => getWordFlow(b) - getWordFlow(a));
  const sortedMedium = shuffleArray(mediumWords).sort((a, b) => getWordFlow(b) - getWordFlow(a));
  const sortedLonger = shuffleArray(longerWords).sort((a, b) => getWordFlow(b) - getWordFlow(a));
  
  const result: string[] = [];
  let shortIndex = 0, mediumIndex = 0, longerIndex = 0;
  
  // Create pattern: short -> medium -> short -> short -> medium -> longer
  // This creates a natural typing rhythm
  for (let i = 0; i < targetCount; i++) {
    const pattern = i % 6;
    
    if (pattern === 0 || pattern === 2 || pattern === 3) {
      // Use short words (60% of the time)
      if (sortedShort.length > 0) {
        result.push(sortedShort[shortIndex % sortedShort.length]);
        shortIndex++;
      } else {
        result.push(sortedMedium[mediumIndex % sortedMedium.length]);
        mediumIndex++;
      }
    } else if (pattern === 1 || pattern === 4) {
      // Use medium words (30% of the time)
      if (sortedMedium.length > 0) {
        result.push(sortedMedium[mediumIndex % sortedMedium.length]);
        mediumIndex++;
      } else {
        result.push(sortedShort[shortIndex % sortedShort.length]);
        shortIndex++;
      }
    } else {
      // Use longer words sparingly (10% of the time)
      if (sortedLonger.length > 0) {
        result.push(sortedLonger[longerIndex % sortedLonger.length]);
        longerIndex++;
      } else {
        result.push(sortedMedium[mediumIndex % sortedMedium.length]);
        mediumIndex++;
      }
    }
  }
  
  return result.join(' ');
}

export function generateWords(count: number, mode: TestMode, customText?: string): string {
  let words: string[] = [];
  
  // Always generate at least 5000 words or 10x the requested count, whichever is larger
  const minWordCount = Math.max(5000, count * 10);
  
  switch (mode) {
    case 'punctuation':
      // Generate a much larger set of punctuation sentences
      words = shuffleArray(punctuationWords);
      // Repeat the dataset multiple times to ensure we have plenty of content
      while (words.join(' ').split(' ').length < minWordCount) {
        words = [...words, ...shuffleArray(punctuationWords)];
      }
      return words.join(' ');
      
    case 'numbers':
      // Generate a much larger set of number sentences
      words = shuffleArray(numberWords);
      // Repeat the dataset multiple times to ensure we have plenty of content
      while (words.join(' ').split(' ').length < minWordCount) {
        words = [...words, ...shuffleArray(numberWords)];
      }
      return words.join(' ');
      
    case 'quote':
      // For quote mode, combine multiple random quotes to make it longer
      const quotesToUse = Math.min(20, quotes.length);
      const selectedQuotes = shuffleArray(quotes).slice(0, quotesToUse);
      let quoteText = selectedQuotes.join(' ');
      // Repeat quotes if needed to ensure enough content
      while (quoteText.split(' ').length < minWordCount) {
        quoteText += ' ' + shuffleArray(quotes).join(' ');
      }
      return quoteText;
      
    case 'custom':
      // Use provided custom text or default
      const baseText = customText || "The quick brown fox jumps over the lazy dog. All good men must come to the aid of their country.";
      // Repeat the custom text to ensure we have enough content
      return baseText.repeat(Math.max(1, Math.ceil(minWordCount / baseText.split(' ').length)));
      
    case 'zen':
      // Zen mode - endless typing with smooth word flow
      const zenWordsNeeded = minWordCount * 2; // Double for zen mode
      return generateSmoothWordFlow(commonWords, zenWordsNeeded);
      
    default:
      // Time and Words modes - generate smooth typing flow
      const totalWordsNeeded = Math.max(minWordCount, count);
      return generateSmoothWordFlow(commonWords, totalWordsNeeded);
  }
}

export function calculateWPM(correctChars: number, elapsedTimeInSeconds: number): number {
  const words = correctChars / 5; // Standard: 5 characters = 1 word
  const minutes = elapsedTimeInSeconds / 60;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
}

export function calculateConsistency(wpmHistory: number[]): number {
  if (wpmHistory.length < 2) return 100;
  
  // Remove outliers for better consistency calculation
  const sortedWpm = [...wpmHistory].sort((a, b) => a - b);
  const q1 = sortedWpm[Math.floor(sortedWpm.length * 0.25)];
  const q3 = sortedWpm[Math.floor(sortedWpm.length * 0.75)];
  const iqr = q3 - q1;
  const filteredWpm = sortedWpm.filter(wpm => wpm >= q1 - 1.5 * iqr && wpm <= q3 + 1.5 * iqr);
  
  // If we've filtered too many points, just use the original data
  const dataToUse = filteredWpm.length > wpmHistory.length / 2 ? filteredWpm : wpmHistory;
  
  const average = dataToUse.reduce((a, b) => a + b, 0) / dataToUse.length;
  const variance = dataToUse.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / dataToUse.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Higher consistency = lower standard deviation relative to average
  // Adjust the formula to make results more intuitive
  const consistency = Math.max(0, 100 - Math.min(100, (standardDeviation / (average || 1) * 100)));
  return Math.round(consistency);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}